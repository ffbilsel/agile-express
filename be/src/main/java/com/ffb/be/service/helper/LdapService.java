package com.ffb.be.service.helper;

import com.ffb.be.model.exception.common.InvalidDataException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.support.LdapNameBuilder;
import org.springframework.stereotype.Service;

import javax.naming.Name;
import javax.naming.directory.*;
import java.util.List;
import java.util.UUID;

import static org.springframework.ldap.query.LdapQueryBuilder.query;

@Slf4j
@Service
@RequiredArgsConstructor
public class LdapService {

    private final LdapTemplate ldapTemplate;

    public void removeUserFromGroup(String username, Name groupDn) {

        if (username == null || username.isEmpty()) {
            throw new InvalidDataException("Username is null or empty");
        }

        Name userDn = LdapNameBuilder.newInstance()
                .add("dc", "com")
                .add("dc", "obss")
                .add("ou", "users")
                .add("cn", username)
                .build();

        log.debug("Removing user '{}' from group '{}'", username, groupDn);

        ModificationItem removeItem = new ModificationItem(
                DirContext.REMOVE_ATTRIBUTE,
                new BasicAttribute("member", userDn.toString())
        );

        try {
            ldapTemplate.modifyAttributes(groupDn, new ModificationItem[]{removeItem});
            log.info("Removed user '{}' from group '{}'", username, groupDn);
        } catch (Exception e) {
            log.warn("Failed to remove user '{}' from group '{}': {}", username, groupDn, e.getMessage());
            throw e;
        }
    }

    public boolean userExists(String username) {
        log.debug("Checking existence of user '{}'", username);
        List<String> result = ldapTemplate.search(
                query().where("cn").is(username),
                (AttributesMapper<String>) attrs -> (String) attrs.get("cn").get()
        );
        boolean exists = !result.isEmpty();
        log.debug("User '{}' existence: {}", username, exists);
        return exists;
    }

    public void createUserWithDefaultRole(String username) {
        log.debug("Creating user '{}' with default role", username);

        Name userDn = LdapNameBuilder.newInstance("ou=users")
                .add("cn", username)
                .build();

        Attributes userAttributes = new BasicAttributes();
        BasicAttribute ocAttr = new BasicAttribute("objectClass");
        ocAttr.add("inetOrgPerson");
        userAttributes.put(ocAttr);
        userAttributes.put("cn", username);
        userAttributes.put("sn", username); // required by inetOrgPerson
        userAttributes.put("mail", username);
        userAttributes.put("userPassword", UUID.randomUUID().toString());

        try {
            ldapTemplate.bind(userDn, null, userAttributes);
            log.info("Created LDAP user '{}'", username);
        } catch (Exception e) {
            log.warn("Failed to create LDAP user '{}': {}", username, e.getMessage());
            throw e;
        }

        Name groupDn = LdapNameBuilder.newInstance("ou=groups")
                .add("cn", "team_member")
                .build();

        Attribute memberAttr = new BasicAttribute("member", userDn.toString());

        ModificationItem addMember = new ModificationItem(
                DirContextOperations.ADD_ATTRIBUTE,
                memberAttr
        );

        try {
            ldapTemplate.modifyAttributes(groupDn, new ModificationItem[]{addMember});
            log.info("Added user '{}' to default group 'team_member'", username);
        } catch (Exception e) {
            log.warn("Failed to add user '{}' to default group 'team_member': {}", username, e.getMessage());
            throw e;
        }
    }

    public String getRoleForUsername(String username) {
        log.debug("Getting role for user '{}'", username);
        String fullUserDn = "cn=" + username + ",ou=users,dc=obss,dc=com";
        String shortUserDn = "cn=" + username + ",ou=users";

        String filter = "(&(objectClass=groupOfNames)(|(member=" + fullUserDn + ")(member=" + shortUserDn + ")))";

        List<String> roles = ldapTemplate.search(
                "",  // base DN
                filter,
                (AttributesMapper<String>) attrs -> (String) attrs.get("cn").get()
        );

        String role = roles.stream()
                .findFirst()
                .map(s -> "ROLE_" + s.toUpperCase())
                .orElse(null);

        log.debug("User '{}' role found: {}", username, role);
        return role;
    }

    public boolean isUserInGroup(Name userDn, Name groupDn) {
        log.debug("Checking if user DN '{}' is in group DN '{}'", userDn, groupDn);
        boolean inGroup = Boolean.TRUE.equals(ldapTemplate.lookup(groupDn, (AttributesMapper<Boolean>) attributes -> {
            Attribute members = attributes.get("member");
            if (members == null) return false;
            for (int i = 0; i < members.size(); i++) {
                if (members.get(i).equals(userDn.toString())) {
                    return true;
                }
            }
            return false;
        }));
        log.debug("User DN '{}' is in group DN '{}': {}", userDn, groupDn, inGroup);
        return inGroup;
    }

    public void addUserToGroup(String username, Name groupDn) {

        if (username == null || username.isEmpty()) {
            throw new InvalidDataException("Username is null or empty");
        }

        Name userDn = LdapNameBuilder.newInstance()
                .add("dc", "com")
                .add("dc", "obss")
                .add("ou", "users")
                .add("cn", username)
                .build();

        log.debug("Adding user '{}' to group '{}'", username, groupDn);

        ModificationItem addItem = new ModificationItem(
                DirContext.ADD_ATTRIBUTE,
                new BasicAttribute("member", userDn.toString())
        );

        try {
            ldapTemplate.modifyAttributes(groupDn, new ModificationItem[]{addItem});
            log.info("Added user '{}' to group '{}'", username, groupDn);
        } catch (Exception e) {
            log.warn("Failed to add user '{}' to group '{}': {}", username, groupDn, e.getMessage());
            throw e;
        }
    }

    public boolean doesUserDnExist(Name userDn) {
        log.debug("Checking existence of user DN '{}'", userDn);
        try {
            ldapTemplate.lookup(userDn);
            log.debug("User DN '{}' exists", userDn);
            return true;
        } catch (Exception e) {
            log.debug("User DN '{}' does not exist: {}", userDn, e.getMessage());
            return false;
        }
    }

    public Name buildUserDn(String username) {
        log.debug("Building user DN for username '{}'", username);
        return LdapNameBuilder.newInstance("ou=users")
                .add("cn", username)
                .build();
    }

    public Name buildGroupDn(String groupName) {
        log.debug("Building group DN for group '{}'", groupName);
        return LdapNameBuilder.newInstance("ou=groups")
                .add("cn", groupName)
                .build();
    }
}
