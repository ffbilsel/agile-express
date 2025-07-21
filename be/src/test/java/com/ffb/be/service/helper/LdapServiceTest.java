package com.ffb.be.service.helper;

import com.ffb.be.model.exception.common.InvalidDataException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.query.LdapQuery;
import org.springframework.ldap.support.LdapNameBuilder;

import javax.naming.Name;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.BasicAttribute;
import javax.naming.directory.ModificationItem;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LdapServiceTest {

    @Mock private LdapTemplate ldapTemplate;
    @Mock private Attributes attributes;
    @Mock private BasicAttribute memberAttribute;

    @InjectMocks
    private LdapService ldapService;

    private Name userDn;
    private Name groupDn;

    @BeforeEach
    void setUp() {
        userDn = LdapNameBuilder.newInstance("ou=users").add("cn", "test_user").build();
        groupDn = LdapNameBuilder.newInstance("ou=groups").add("cn", "team_member").build();
    }

    // ========== REMOVE USER FROM GROUP TESTS ==========

    @Test
    void removeUserFromGroup_ValidUser_Success() {
        ldapService.removeUserFromGroup("test_user", groupDn);

        ArgumentCaptor<ModificationItem[]> modCaptor = ArgumentCaptor.forClass(ModificationItem[].class);
        verify(ldapTemplate).modifyAttributes(eq(groupDn), modCaptor.capture());

        ModificationItem[] modifications = modCaptor.getValue();
        assertThat(modifications).hasSize(1);
        assertThat(modifications[0].getModificationOp()).isEqualTo(javax.naming.directory.DirContext.REMOVE_ATTRIBUTE);
        assertThat(modifications[0].getAttribute().getID()).isEqualTo("member");
    }

    // ========== USER EXISTS TESTS ==========

    @Test
    void userExists_UserFound_ReturnsTrue() {
        when(ldapTemplate.search(any(LdapQuery.class), any(AttributesMapper.class)))
                .thenReturn(List.of("test_user"));

        boolean result = ldapService.userExists("test_user");

        assertThat(result).isTrue();
        verify(ldapTemplate).search(any(LdapQuery.class), any(AttributesMapper.class));
    }

    @Test
    void userExists_UserNotFound_ReturnsFalse() {
        when(ldapTemplate.search(any(LdapQuery.class), any(AttributesMapper.class)))
                .thenReturn(List.of());

        boolean result = ldapService.userExists("nonexistent");

        assertThat(result).isFalse();
    }

    // ========== CREATE USER WITH DEFAULT ROLE TESTS ==========

    @Test
    void createUserWithDefaultRole_ValidUsername_Success() {
        ldapService.createUserWithDefaultRole("new_user");

        // Verify user creation
        verify(ldapTemplate).bind(any(Name.class), isNull(), any(Attributes.class));

        // Verify group assignment
        ArgumentCaptor<ModificationItem[]> modCaptor = ArgumentCaptor.forClass(ModificationItem[].class);
        verify(ldapTemplate).modifyAttributes(any(Name.class), modCaptor.capture());

        ModificationItem[] modifications = modCaptor.getValue();
        assertThat(modifications).hasSize(1);
        assertThat(modifications[0].getAttribute().getID()).isEqualTo("member");
    }

    // ========== GET ROLE FOR USERNAME TESTS ==========

    @Test
    void getRoleForUsername_UserHasRole_ReturnsRole() {
        when(ldapTemplate.search(anyString(), anyString(), any(AttributesMapper.class)))
                .thenReturn(List.of("team_member"));

        String result = ldapService.getRoleForUsername("test_user");

        assertThat(result).isEqualTo("ROLE_TEAM_MEMBER");
        verify(ldapTemplate).search(anyString(), anyString(), any(AttributesMapper.class));
    }

    @Test
    void getRoleForUsername_UserHasNoRole_ReturnsNull() {
        when(ldapTemplate.search(anyString(), anyString(), any(AttributesMapper.class)))
                .thenReturn(List.of());

        String result = ldapService.getRoleForUsername("test_user");

        assertThat(result).isNull();
    }

    @Test
    void getRoleForUsername_MultipleRoles_ReturnsFirst() {
        when(ldapTemplate.search(anyString(), anyString(), any(AttributesMapper.class)))
                .thenReturn(List.of("admin", "team_member"));

        String result = ldapService.getRoleForUsername("test_user");

        assertThat(result).isEqualTo("ROLE_ADMIN");
    }

    // ========== IS USER IN GROUP TESTS ==========

    @Test
    void isUserInGroup_UserInGroup_ReturnsTrue() throws NamingException {
        when(memberAttribute.size()).thenReturn(2);
        when(memberAttribute.get(0)).thenReturn("cn=other_user,ou=users");
        when(memberAttribute.get(1)).thenReturn(userDn.toString());
        when(attributes.get("member")).thenReturn(memberAttribute);

        when(ldapTemplate.lookup(eq(groupDn), any(AttributesMapper.class))).thenAnswer(invocation -> {
            AttributesMapper<Boolean> mapper = invocation.getArgument(1);
            return mapper.mapFromAttributes(attributes);
        });

        boolean result = ldapService.isUserInGroup(userDn, groupDn);

        assertThat(result).isTrue();
    }

    @Test
    void isUserInGroup_UserNotInGroup_ReturnsFalse() throws NamingException {
        when(memberAttribute.size()).thenReturn(1);
        when(memberAttribute.get(0)).thenReturn("cn=other_user,ou=users");
        when(attributes.get("member")).thenReturn(memberAttribute);

        when(ldapTemplate.lookup(eq(groupDn), any(AttributesMapper.class))).thenAnswer(invocation -> {
            AttributesMapper<Boolean> mapper = invocation.getArgument(1);
            return mapper.mapFromAttributes(attributes);
        });

        boolean result = ldapService.isUserInGroup(userDn, groupDn);

        assertThat(result).isFalse();
    }

    @Test
    void isUserInGroup_NoMembers_ReturnsFalse() {
        when(attributes.get("member")).thenReturn(null);

        when(ldapTemplate.lookup(eq(groupDn), any(AttributesMapper.class))).thenAnswer(invocation -> {
            AttributesMapper<Boolean> mapper = invocation.getArgument(1);
            return mapper.mapFromAttributes(attributes);
        });

        boolean result = ldapService.isUserInGroup(userDn, groupDn);

        assertThat(result).isFalse();
    }

    @Test
    void isUserInGroup_LookupReturnsNull_ReturnsFalse() {
        when(ldapTemplate.lookup(eq(groupDn), any(AttributesMapper.class))).thenReturn(null);

        boolean result = ldapService.isUserInGroup(userDn, groupDn);

        assertThat(result).isFalse();
    }

    // ========== ADD USER TO GROUP TESTS ==========

    @Test
    void addUserToGroup_ValidUser_Success() {
        ldapService.addUserToGroup("test_user", groupDn);

        ArgumentCaptor<ModificationItem[]> modCaptor = ArgumentCaptor.forClass(ModificationItem[].class);
        verify(ldapTemplate).modifyAttributes(eq(groupDn), modCaptor.capture());

        ModificationItem[] modifications = modCaptor.getValue();
        assertThat(modifications).hasSize(1);
        assertThat(modifications[0].getModificationOp()).isEqualTo(javax.naming.directory.DirContext.ADD_ATTRIBUTE);
        assertThat(modifications[0].getAttribute().getID()).isEqualTo("member");
    }

    // ========== DOES USER DN EXIST TESTS ==========

    @Test
    void doesUserDnExist_UserExists_ReturnsTrue() {
        when(ldapTemplate.lookup(userDn)).thenReturn(new Object());

        boolean result = ldapService.doesUserDnExist(userDn);

        assertThat(result).isTrue();
        verify(ldapTemplate).lookup(userDn);
    }

    @Test
    void doesUserDnExist_UserNotExists_ReturnsFalse() {
        when(ldapTemplate.lookup(userDn)).thenThrow(new RuntimeException("Not found"));

        boolean result = ldapService.doesUserDnExist(userDn);

        assertThat(result).isFalse();
        verify(ldapTemplate).lookup(userDn);
    }

    // ========== BUILD DN TESTS ==========

    @Test
    void buildUserDn_ValidUsername_ReturnsCorrectDn() {
        Name result = ldapService.buildUserDn("test_user");

        assertThat(result.toString()).isEqualTo("cn=test_user,ou=users");
    }

    @Test
    void buildGroupDn_ValidGroupName_ReturnsCorrectDn() {
        Name result = ldapService.buildGroupDn("admin");

        assertThat(result.toString()).isEqualTo("cn=admin,ou=groups");
    }

    // ========== EDGE CASE TESTS ==========

    @Test
    void removeUserFromGroup_EmptyUsername_ThrowsException() {
        assertThatThrownBy(() -> ldapService.removeUserFromGroup("", groupDn))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Username is null or empty");
    }

    @Test
    void addUserToGroup_EmptyUsername_ThrowsException() {
        assertThatThrownBy(() -> ldapService.addUserToGroup("", groupDn))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Username is null or empty");
    }

    @Test
    void getRoleForUsername_EmptyUsername_SearchesCorrectly() {
        when(ldapTemplate.search(anyString(), anyString(), any(AttributesMapper.class)))
                .thenReturn(List.of());

        String result = ldapService.getRoleForUsername("");

        assertThat(result).isNull();
        verify(ldapTemplate).search(anyString(), contains("cn=,ou=users"), any(AttributesMapper.class));
    }

    @Test
    void userExists_EmptyUsername_ReturnsFalse() {
        when(ldapTemplate.search(any(LdapQuery.class), any(AttributesMapper.class)))
                .thenReturn(List.of());

        boolean result = ldapService.userExists("");

        assertThat(result).isFalse();
    }

    @Test
    void createUserWithDefaultRole_UsernameWithSpecialChars_Success() {
        ldapService.createUserWithDefaultRole("test.user@example.com");

        verify(ldapTemplate).bind(any(Name.class), isNull(), any(Attributes.class));
        verify(ldapTemplate).modifyAttributes(any(Name.class), any(ModificationItem[].class));
    }

    // ========== LDAP OPERATION VERIFICATION TESTS ==========

    @Test
    void removeUserFromGroup_VerifyLdapOperation() throws NamingException {
        ldapService.removeUserFromGroup("test_user", groupDn);

        ArgumentCaptor<ModificationItem[]> captor = ArgumentCaptor.forClass(ModificationItem[].class);
        verify(ldapTemplate).modifyAttributes(eq(groupDn), captor.capture());

        ModificationItem[] items = captor.getValue();
        ModificationItem item = items[0];

        assertThat(item.getModificationOp()).isEqualTo(javax.naming.directory.DirContext.REMOVE_ATTRIBUTE);
        assertThat(item.getAttribute().getID()).isEqualTo("member");
        assertThat(item.getAttribute().get().toString()).contains("cn=test_user");
    }

    @Test
    void addUserToGroup_VerifyLdapOperation() throws NamingException {
        ldapService.addUserToGroup("test_user", groupDn);

        ArgumentCaptor<ModificationItem[]> captor = ArgumentCaptor.forClass(ModificationItem[].class);
        verify(ldapTemplate).modifyAttributes(eq(groupDn), captor.capture());

        ModificationItem[] items = captor.getValue();
        ModificationItem item = items[0];

        assertThat(item.getModificationOp()).isEqualTo(javax.naming.directory.DirContext.ADD_ATTRIBUTE);
        assertThat(item.getAttribute().getID()).isEqualTo("member");
        assertThat(item.getAttribute().get().toString()).contains("cn=test_user");
    }
}