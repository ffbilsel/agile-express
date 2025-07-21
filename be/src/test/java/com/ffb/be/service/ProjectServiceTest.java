package com.ffb.be.service;

import com.ffb.be.model.dto.request.project.*;
import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.SprintStatus;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.common.DuplicateDataException;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.model.mapper.ProjectMapper;
import com.ffb.be.repository.jpa.*;
import com.ffb.be.service.helper.EntityAccessHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private EntityAccessHelper helper;
    @Mock private ProjectRepository projectRepository;
    @Mock private SprintRepository sprintRepository;
    @Mock private IssueRepository issueRepository;
    @Mock private StatusRepository statusRepository;
    @Mock private UserRepository userRepository;
    @Mock private Authentication auth;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private User projectManager;
    private User teamLead;
    private User teamMember;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);
        project.setName("Test Project");
        project.setTeamMembers(new ArrayList<>());
        project.getSprints().add(new Sprint());
        project.setStatuses(new ArrayList<>());

        projectManager = new User();
        projectManager.setUsername("manager");
        projectManager.setRole(UserRole.PROJECT_MANAGER);
        projectManager.setManagedProjects(new ArrayList<>());

        teamLead = new User();
        teamLead.setUsername("team_lead");
        teamLead.setRole(UserRole.TEAM_LEAD);

        teamMember = new User();
        teamMember.setUsername("member");
        teamMember.setRole(UserRole.TEAM_MEMBER);

        Sprint sprint = new Sprint();
        sprint.setId(1L);
        sprint.setSprintStatus(SprintStatus.ACTIVE);
        sprint.setIssues(new ArrayList<>());

        Status status = new Status();
        status.setId(1L);
        status.setName("TODO");
        status.setProject(project);
    }

    // ========== CREATE PROJECT TESTS ==========

    @Test
    void createProject_ValidPayload_Success() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName("New Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setManager("manager");
        payload.setTeamLead("team_lead");
        payload.setTeamMembers(List.of("member"));
        payload.setStatuses(List.of("TODO", "IN_PROGRESS", "DONE"));

        when(helper.getUser("manager")).thenReturn(projectManager);
        when(helper.getUser("team_lead")).thenReturn(teamLead);
        when(helper.getUsers(List.of("member"))).thenReturn(List.of(teamMember));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(sprintRepository.save(any(Sprint.class))).thenReturn(new Sprint());
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            ProjectResponse result = projectService.createProject(payload);

            assertThat(result).isNotNull();
            verify(projectRepository, atLeastOnce()).save(any(Project.class));
            verify(sprintRepository, times(2)).save(any(Sprint.class)); // backlog + active sprint
        }
    }

    @Test
    void createProject_NullName_ThrowsException() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName(null);

        assertThatThrownBy(() -> projectService.createProject(payload))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Name is mandatory");
    }

    @Test
    void createProject_BlankName_ThrowsException() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName("   ");

        assertThatThrownBy(() -> projectService.createProject(payload))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Name is mandatory");
    }

    @Test
    void createProject_InvalidTeamMembers_ThrowsException() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName("Test Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setTeamMembers(List.of("member"));
        payload.setStatuses(List.of("TODO"));

        User invalidMember = new User();
        invalidMember.setRole(UserRole.ADMIN); // Not TEAM_MEMBER

        when(helper.getUsers(List.of("member"))).thenReturn(List.of(invalidMember));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        assertThatThrownBy(() -> projectService.createProject(payload))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("all members are not team member");
    }

    // ========== UPDATE PROJECT TESTS ==========

    @Test
    void updateProject_ValidPayload_Success() {
        ProjectUpdatePayload payload = new ProjectUpdatePayload();
        payload.setProjectId(1L);
        payload.setName("Updated Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setManager("manager");
        payload.setTeamLead("team_lead");
        payload.setTeamMembers(List.of("member"));
        payload.setStatuses(List.of("TODO"));

        when(helper.getProject(1L)).thenReturn(project);
        when(helper.getUser("manager")).thenReturn(projectManager);
        when(helper.getUser("team_lead")).thenReturn(teamLead);
        when(helper.getUsers(List.of("member"))).thenReturn(List.of(teamMember));
        when(projectRepository.save(project)).thenReturn(project);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            ProjectResponse result = projectService.updateProject(payload);

            assertThat(result).isNotNull();
        }
    }

    @Test
    void updateProject_InvalidName_ThrowsException() {
        ProjectUpdatePayload payload = new ProjectUpdatePayload();
        payload.setName("");

        assertThatThrownBy(() -> projectService.updateProject(payload))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Name is mandatory");
    }

    @Test
    void updateProject_DuplicateTeamMembers_ThrowsException() {
        ProjectUpdatePayload payload = new ProjectUpdatePayload();
        payload.setProjectId(1L);
        payload.setName("Test Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setTeamMembers(List.of("member", "member")); // Duplicate
        payload.setStatuses(List.of("TODO"));

        when(helper.getProject(1L)).thenReturn(project);

        assertThatThrownBy(() -> projectService.updateProject(payload))
                .isInstanceOf(DuplicateDataException.class)
                .hasMessage("duplicate team members");
    }

    // ========== DELETE PROJECT TESTS ==========

    @Test
    void deleteProject_ValidId_Success() {
        project.setManager(projectManager);
        project.setTeamLead(teamLead);
        project.getTeamMembers().add(teamMember);

        when(helper.getProject(1L)).thenReturn(project);

        projectService.deleteProject(1L, auth);

        verify(helper).authorizeUser(auth, 1L, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER));
        verify(projectRepository).delete(project);
        verify(issueRepository).deleteAll(anyList());
    }

    // ========== VIEW PROJECT TESTS ==========

    @Test
    void viewProject_ValidId_Success() {
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            ProjectResponse result = projectService.viewProject(1L, auth);

            assertThat(result).isNotNull();
            verify(helper).authorizeUser(auth, 1L, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));
        }
    }

    // ========== VIEW ALL PROJECTS TESTS ==========

    @Test
    void viewAllProjects_AdminUser_ReturnsAllProjects() {
        User adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setRole(UserRole.ADMIN);

        when(auth.getName()).thenReturn("admin");
        when(helper.getUser("admin")).thenReturn(adminUser);
        when(projectRepository.findAll()).thenReturn(List.of(project));

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(any(Project.class))).thenReturn(ProjectResponse.builder().build());

            List<ProjectResponse> result = projectService.viewAllProjects(auth);

            assertThat(result).hasSize(1);
            verify(projectRepository).findAll();
        }
    }

    @Test
    void viewAllProjects_ProjectManager_ReturnsOwnProjects() {
        projectManager.getManagedProjects().add(project);

        when(auth.getName()).thenReturn("manager");
        when(helper.getUser("manager")).thenReturn(projectManager);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            List<ProjectResponse> result = projectService.viewAllProjects(auth);

            assertThat(result).hasSize(1);
            verify(projectRepository, never()).findAll();
        }
    }

    @Test
    void viewAllProjects_TeamMember_ReturnsMemberProject() {
        teamMember.setMemberProject(project);

        when(auth.getName()).thenReturn("member");
        when(helper.getUser("member")).thenReturn(teamMember);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            List<ProjectResponse> result = projectService.viewAllProjects(auth);

            assertThat(result).hasSize(1);
        }
    }

    @Test
    void viewAllProjects_TeamLead_ReturnsLeadingProject() {
        teamLead.setLeadingProject(project);

        when(auth.getName()).thenReturn("team_lead");
        when(helper.getUser("team_lead")).thenReturn(teamLead);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            List<ProjectResponse> result = projectService.viewAllProjects(auth);

            assertThat(result).hasSize(1);
        }
    }

    // ========== PRIVATE HELPER METHOD TESTS (via public methods) ==========

    @Test
    void createProject_DuplicateStatuses_ThrowsException() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName("Test Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setStatuses(List.of("TODO", "todo")); // Duplicate when lowercased
        payload.setTeamMembers(List.of());

        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(sprintRepository.save(any(Sprint.class))).thenReturn(new Sprint());

        assertThatThrownBy(() -> projectService.createProject(payload))
                .isInstanceOf(DuplicateDataException.class)
                .hasMessage("statuses");
    }

    @Test
    void createProject_WithoutOptionalFields_Success() {
        ProjectCreatePayload payload = new ProjectCreatePayload();
        payload.setName("Test Project");
        payload.setStartDate(LocalDateTime.now());
        payload.setEndDate(LocalDateTime.now().plusDays(30));
        payload.setManager(""); // Empty string
        payload.setTeamLead(""); // Empty string
        payload.setTeamMembers(List.of());
        payload.setStatuses(List.of("TODO"));

        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(sprintRepository.save(any(Sprint.class))).thenReturn(new Sprint());
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<ProjectMapper> mapper = mockStatic(ProjectMapper.class)) {
            mapper.when(() -> ProjectMapper.toDto(project)).thenReturn(ProjectResponse.builder().build());

            ProjectResponse result = projectService.createProject(payload);

            assertThat(result).isNotNull();
            verify(helper, never()).getUser(""); // Should not try to get users with empty usernames
        }
    }
}