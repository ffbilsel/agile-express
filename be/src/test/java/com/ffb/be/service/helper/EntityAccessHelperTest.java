package com.ffb.be.service.helper;

import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.auth.UnauthorizedUserException;
import com.ffb.be.model.exception.common.EntityNotFoundException;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.repository.jpa.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntityAccessHelperTest {

    @Mock private IssueRepository issueRepository;
    @Mock private SprintRepository sprintRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private StatusRepository statusRepository;
    @Mock private EffortRepository effortRepository;
    @Mock private Authentication authentication;

    @InjectMocks
    private EntityAccessHelper helper;

    private Project project;
    private User user;
    private Issue issue;
    private Sprint sprint;
    private Status status;
    private Effort effort;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);

        user = new User();
        user.setUsername("testuser");
        user.setRole(UserRole.TEAM_MEMBER);
        user.setManagedProjects(new ArrayList<>());

        issue = new Issue();
        issue.setId(1L);

        sprint = new Sprint();
        sprint.setId(1L);

        status = new Status();
        status.setId(1L);
        status.setName("TODO");

        effort = new Effort();
        effort.setId(1L);
    }

    // ========== GET USER TESTS ==========

    @Test
    void getUser_UserExists_ReturnsUser() {
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getUser("testuser");

        assertThat(result).isEqualTo(user);
    }

    @Test
    void getUser_UserNotFound_ThrowsException() {
        when(userRepository.findUserByUsername("notfound")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getUser("notfound"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET PROJECT TESTS ==========

    @Test
    void getProject_ProjectExists_ReturnsProject() {
        when(projectRepository.findProjectById(1L)).thenReturn(Optional.of(project));

        Project result = helper.getProject(1L);

        assertThat(result).isEqualTo(project);
    }

    @Test
    void getProject_ProjectNotFound_ThrowsException() {
        when(projectRepository.findProjectById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getProject(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET ISSUE TESTS ==========

    @Test
    void getIssue_IssueExists_ReturnsIssue() {
        when(issueRepository.findIssueByIdAndProject_Id(1L, 1L)).thenReturn(Optional.of(issue));

        Issue result = helper.getIssue(1L, 1L);

        assertThat(result).isEqualTo(issue);
    }

    @Test
    void getIssue_IssueNotFound_ThrowsException() {
        when(issueRepository.findIssueByIdAndProject_Id(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getIssue(1L, 999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getIssueById_IssueExists_ReturnsIssue() {
        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));

        Issue result = helper.getIssueById(1L);

        assertThat(result).isEqualTo(issue);
    }

    @Test
    void getIssueById_IssueNotFound_ThrowsException() {
        when(issueRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getIssueById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getIssuesByStatus_ValidStatus_ReturnsIssues() {
        List<Issue> issues = List.of(issue);
        when(issueRepository.findAllByStatus(status)).thenReturn(issues);

        List<Issue> result = helper.getIssuesByStatus(status);

        assertThat(result).isEqualTo(issues);
    }

    @Test
    void getIssueWithSprintId_IssueExists_ReturnsIssue() {
        when(issueRepository.findIssueByIdAndProject_IdAndSprint_Id(1L, 1L, 1L)).thenReturn(Optional.of(issue));

        Issue result = helper.getIssueWithSprintId(1L, 1L, 1L);

        assertThat(result).isEqualTo(issue);
    }

    @Test
    void getIssueWithSprintId_IssueNotFound_ThrowsException() {
        when(issueRepository.findIssueByIdAndProject_IdAndSprint_Id(999L, 1L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getIssueWithSprintId(1L, 1L, 999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET SPRINT TESTS ==========

    @Test
    void getSprint_SprintExists_ReturnsSprint() {
        when(sprintRepository.findSprintByIdAndProject_Id(1L, 1L)).thenReturn(Optional.of(sprint));

        Sprint result = helper.getSprint(1L, 1L);

        assertThat(result).isEqualTo(sprint);
    }

    @Test
    void getSprint_SprintNotFound_ThrowsException() {
        when(sprintRepository.findSprintByIdAndProject_Id(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getSprint(1L, 999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET STATUS TESTS ==========

    @Test
    void getStatusByStatusName_StatusExists_ReturnsStatus() {
        when(statusRepository.findStatusByNameAndProject_Id("TODO", 1L)).thenReturn(Optional.of(status));

        Status result = helper.getStatusByStatusName(1L, "TODO");

        assertThat(result).isEqualTo(status);
    }

    @Test
    void getStatusByStatusName_StatusNotFound_ThrowsException() {
        when(statusRepository.findStatusByNameAndProject_Id("NOTFOUND", 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getStatusByStatusName(1L, "NOTFOUND"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET EFFORT TESTS ==========

    @Test
    void getEffortWithIssueId_EffortExists_ReturnsEffort() {
        when(effortRepository.findEffortByIdAndIssue_Id(1L, 1L)).thenReturn(Optional.of(effort));

        Effort result = helper.getEffortWithIssue_Id(1L, 1L);

        assertThat(result).isEqualTo(effort);
    }

    @Test
    void getEffortWithIssueId_EffortNotFound_ThrowsException() {
        when(effortRepository.findEffortByIdAndIssue_Id(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getEffortWithIssue_Id(999L, 1L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ========== GET USERS TESTS ==========

    @Test
    void getUsers_ValidUsernames_ReturnsUsers() {
        User user1 = new User();
        user1.setUsername("user1");
        User user2 = new User();
        user2.setUsername("user2");

        when(userRepository.findUserByUsername("user1")).thenReturn(Optional.of(user1));
        when(userRepository.findUserByUsername("user2")).thenReturn(Optional.of(user2));

        List<User> result = helper.getUsers(List.of("user1", "user2"));

        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(user1, user2);
    }

    @Test
    void getUsers_UserNotFound_ThrowsException() {
        when(userRepository.findUserByUsername("user1")).thenReturn(Optional.of(user));
        when(userRepository.findUserByUsername("notfound")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> helper.getUsers(List.of("user1", "notfound")))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getAllUsers_ReturnsAllUsers() {
        List<User> users = List.of(user);
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = helper.getAllUsers();

        assertThat(result).isEqualTo(users);
    }

    // ========== IS USER IN PROJECT TESTS ==========

    @Test
    void isUserInProject_NullUser_ReturnsFalse() {
        boolean result = helper.isUserInProject(null, 1L);

        assertThat(result).isFalse();
    }

    @Test
    void isUserInProject_UserIsMember_ReturnsTrue() {
        user.setMemberProject(project);

        boolean result = helper.isUserInProject(user, 1L);

        assertThat(result).isTrue();
    }

    @Test
    void isUserInProject_UserIsLead_ReturnsTrue() {
        user.setLeadingProject(project);

        boolean result = helper.isUserInProject(user, 1L);

        assertThat(result).isTrue();
    }

    @Test
    void isUserInProject_UserIsManager_ReturnsTrue() {
        user.getManagedProjects().add(project);

        boolean result = helper.isUserInProject(user, 1L);

        assertThat(result).isTrue();
    }

    @Test
    void isUserInProject_UserNotInProject_ReturnsFalse() {
        boolean result = helper.isUserInProject(user, 1L);

        assertThat(result).isFalse();
    }

    // ========== GET AUTHORIZED USER TESTS ==========

    @Test
    void getAuthorizedUser_AdminUser_ReturnsUser() {
        user.setRole(UserRole.ADMIN);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getAuthorizedUser("testuser", 1L, List.of(UserRole.ADMIN));

        assertThat(result).isEqualTo(user);
    }

    @Test
    void getAuthorizedUser_ProjectManager_ReturnsUser() {
        user.setRole(UserRole.PROJECT_MANAGER);
        user.getManagedProjects().add(project);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getAuthorizedUser("testuser", 1L, List.of(UserRole.PROJECT_MANAGER));

        assertThat(result).isEqualTo(user);
    }

    @Test
    void getAuthorizedUser_TeamLead_ReturnsUser() {
        user.setRole(UserRole.TEAM_LEAD);
        user.setLeadingProject(project);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getAuthorizedUser("testuser", 1L, List.of(UserRole.TEAM_LEAD));

        assertThat(result).isEqualTo(user);
    }

    @Test
    void getAuthorizedUser_TeamMember_ReturnsUser() {
        user.setRole(UserRole.TEAM_MEMBER);
        user.setMemberProject(project);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getAuthorizedUser("testuser", 1L, List.of(UserRole.TEAM_MEMBER));

        assertThat(result).isEqualTo(user);
    }

    @Test
    void getAuthorizedUser_UnauthorizedUser_ThrowsException() {
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> helper.getAuthorizedUser("testuser", 1L, List.of(UserRole.ADMIN)))
                .isInstanceOf(UnauthorizedUserException.class);
    }

    @Test
    void getAuthorizedUser_WithAuthentication_ReturnsUser() {
        user.setRole(UserRole.ADMIN);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        User result = helper.getAuthorizedUser(authentication, 1L, List.of(UserRole.ADMIN));

        assertThat(result).isEqualTo(user);
    }

    // ========== AUTHORIZE USER TESTS ==========

    @Test
    void authorizeUser_WithAuthentication_Success() {
        user.setRole(UserRole.ADMIN);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        assertThatCode(() -> helper.authorizeUser(authentication, 1L, List.of(UserRole.ADMIN)))
                .doesNotThrowAnyException();
    }

    @Test
    void authorizeUser_WithUsername_Success() {
        user.setRole(UserRole.ADMIN);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        assertThatCode(() -> helper.authorizeUser("testuser", 1L, List.of(UserRole.ADMIN)))
                .doesNotThrowAnyException();
    }

    @Test
    void authorizeUser_Unauthorized_ThrowsException() {
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> helper.authorizeUser("testuser", 1L, List.of(UserRole.ADMIN)))
                .isInstanceOf(UnauthorizedUserException.class);
    }

    @Test
    void checkDates_ValidDates_Success() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(1);

        assertThatCode(() -> helper.checkDates(start, end))
                .doesNotThrowAnyException();
    }

    @Test
    void checkDates_NullStartDate_ThrowsException() {
        LocalDateTime end = LocalDateTime.now();

        assertThatThrownBy(() -> helper.checkDates(null, end))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("invalid dates");
    }

    @Test
    void checkDates_NullEndDate_ThrowsException() {
        LocalDateTime start = LocalDateTime.now();

        assertThatThrownBy(() -> helper.checkDates(start, null))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("invalid dates");
    }

    @Test
    void checkDates_StartAfterEnd_ThrowsException() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.minusDays(1);

        assertThatThrownBy(() -> helper.checkDates(start, end))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("invalid dates");
    }

    @Test
    void checkDates_EqualDates_Success() {
        LocalDateTime date = LocalDateTime.now();

        assertThatCode(() -> helper.checkDates(date, date))
                .doesNotThrowAnyException();
    }
}