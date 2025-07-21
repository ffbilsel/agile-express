package com.ffb.be.service;

import com.ffb.be.model.dto.request.sprint.SprintCreatePayload;
import com.ffb.be.model.dto.request.sprint.SprintGetPayload;
import com.ffb.be.model.dto.request.sprint.SprintUpdatePayload;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.dto.response.OverdueSprint;
import com.ffb.be.model.dto.response.SprintResponse;
import com.ffb.be.model.entity.Issue;
import com.ffb.be.model.entity.Project;
import com.ffb.be.model.entity.Sprint;
import com.ffb.be.model.entity.User;
import com.ffb.be.model.enums.SprintStatus;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.auth.UnallowedActionException;
import com.ffb.be.model.mapper.IssueMapper;
import com.ffb.be.model.mapper.SprintMapper;
import com.ffb.be.repository.jpa.IssueRepository;
import com.ffb.be.repository.jpa.ProjectRepository;
import com.ffb.be.repository.jpa.SprintRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SprintServiceTest {

    @Mock private EntityAccessHelper helper;
    @Mock private SprintRepository sprintRepository;
    @Mock private IssueRepository issueRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private Authentication auth;

    @InjectMocks
    private SprintService sprintService;

    private Project project;
    private Sprint sprint;
    private Sprint backlog;
    private Issue issue;
    private User user;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);
        project.setSprints(new ArrayList<>());

        backlog = new Sprint();
        backlog.setId(1L);
        backlog.setSprintStatus(SprintStatus.BACKLOG);
        backlog.setProject(project);
        backlog.setIssues(new ArrayList<>());
        project.setBacklog(backlog);

        sprint = new Sprint();
        sprint.setId(2L);
        sprint.setSprintStatus(SprintStatus.ACTIVE);
        sprint.setProject(project);
        sprint.setIssues(new ArrayList<>());
        sprint.setStartDate(LocalDateTime.now().plusDays(1));
        sprint.setEndDate(LocalDateTime.now().plusDays(8));
        project.getSprints().add(sprint);

        issue = new Issue();
        issue.setId(1L);
        issue.setSprint(sprint);

        user = new User();
        user.setUsername("test_user");
        user.setRole(UserRole.PROJECT_MANAGER);
        user.setManagedProjects(new ArrayList<>());
        user.getManagedProjects().add(project);
    }

    // ========== CREATE SPRINT TESTS ==========

    @Test
    void createSprint_ValidPayload_Success() {
        SprintCreatePayload payload = new SprintCreatePayload();
        payload.setProjectId(1L);
        payload.setStartDate(LocalDateTime.now().plusDays(1));
        payload.setEndDate(LocalDateTime.now().plusDays(8));

        when(helper.getProject(1L)).thenReturn(project);
        when(sprintRepository.save(any(Sprint.class))).thenReturn(sprint);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(any(Sprint.class))).thenReturn(SprintResponse.builder().build());

            SprintResponse result = sprintService.createSprint(payload, auth);

            assertThat(result).isNotNull();
            verify(helper).authorizeUser(auth, 1L, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD));
            verify(sprintRepository).save(any(Sprint.class));
        }
    }

    // ========== UPDATE SPRINT TESTS ==========

    @Test
    void updateSprint_ValidPayload_Success() {
        SprintUpdatePayload payload = new SprintUpdatePayload();
        payload.setProjectId(1L);
        payload.setSprintId(2L);
        payload.setStartDate(LocalDateTime.now().plusDays(2));
        payload.setEndDate(LocalDateTime.now().plusDays(9));
        payload.setStatus(SprintStatus.PLANNED);

        when(helper.getSprint(1L, 2L)).thenReturn(sprint);
        when(sprintRepository.save(sprint)).thenReturn(sprint);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(sprint)).thenReturn(SprintResponse.builder().build());

            SprintResponse result = sprintService.updateSprint(payload, auth);

            assertThat(result).isNotNull();
            verify(sprintRepository).save(sprint);
        }
    }

    @Test
    void updateSprint_BacklogSprint_ThrowsException() {
        SprintUpdatePayload payload = new SprintUpdatePayload();
        payload.setProjectId(1L);
        payload.setSprintId(1L);
        payload.setStartDate(LocalDateTime.now().plusDays(1));
        payload.setEndDate(LocalDateTime.now().plusDays(8));

        when(helper.getSprint(1L, 1L)).thenReturn(backlog);

        assertThatThrownBy(() -> sprintService.updateSprint(payload, auth))
                .isInstanceOf(UnallowedActionException.class)
                .hasMessage("Cannot edit backlog sprint");
    }

    @Test
    void updateSprint_StatusToBacklog_ThrowsException() {
        SprintUpdatePayload payload = new SprintUpdatePayload();
        payload.setProjectId(1L);
        payload.setSprintId(2L);
        payload.setStartDate(LocalDateTime.now().plusDays(1));
        payload.setEndDate(LocalDateTime.now().plusDays(8));
        payload.setStatus(SprintStatus.BACKLOG);

        when(helper.getSprint(1L, 2L)).thenReturn(sprint);

        assertThatThrownBy(() -> sprintService.updateSprint(payload, auth))
                .isInstanceOf(UnallowedActionException.class)
                .hasMessage("Cannot set sprint status to BACKLOG");
    }

    // ========== DELETE SPRINT TESTS ==========

    @Test
    void deleteSprint_ValidSprint_Success() {
        SprintGetPayload payload = new SprintGetPayload();
        payload.setProjectId(1L);
        payload.setSprintId(2L);

        Sprint plannedSprint = new Sprint();
        plannedSprint.setId(2L);
        plannedSprint.setSprintStatus(SprintStatus.PLANNED);
        plannedSprint.setIssues(new ArrayList<>());
        plannedSprint.getIssues().add(issue);

        when(helper.getProject(1L)).thenReturn(project);
        when(helper.getSprint(1L, 2L)).thenReturn(plannedSprint);

        sprintService.deleteSprint(payload, auth);

        verify(issueRepository).saveAll(plannedSprint.getIssues());
        verify(sprintRepository).delete(plannedSprint);
        assertThat(issue.getSprint()).isEqualTo(backlog);
    }

    @Test
    void deleteSprint_ActiveSprint_ThrowsException() {
        SprintGetPayload payload = new SprintGetPayload();
        payload.setProjectId(1L);
        payload.setSprintId(2L);

        when(helper.getProject(1L)).thenReturn(project);
        when(helper.getSprint(1L, 2L)).thenReturn(sprint);

        assertThatThrownBy(() -> sprintService.deleteSprint(payload, auth))
                .isInstanceOf(UnallowedActionException.class)
                .hasMessage("Cannot delete backlog or active sprint");
    }

    // ========== VIEW SPRINT TESTS ==========

    @Test
    void viewSprint_WithSprintId_Success() {
        when(helper.getSprint(1L, 2L)).thenReturn(sprint);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(sprint)).thenReturn(SprintResponse.builder().build());

            SprintResponse result = sprintService.viewSprint(1L, 2L, null, auth);

            assertThat(result).isNotNull();
            verify(helper).authorizeUser(auth, 1L, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));
        }
    }

    @Test
    void viewSprint_WithSprintName_Active_Success() {
        project.setActiveSprint(sprint);
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(sprint)).thenReturn(SprintResponse.builder().build());

            SprintResponse result = sprintService.viewSprint(1L, null, "ACTIVE", auth);

            assertThat(result).isNotNull();
        }
    }

    @Test
    void viewSprint_WithSprintName_Backlog_Success() {
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(backlog)).thenReturn(SprintResponse.builder().build());

            SprintResponse result = sprintService.viewSprint(1L, null, "BACKLOG", auth);

            assertThat(result).isNotNull();
        }
    }

    // ========== VIEW ALL SPRINTS TESTS ==========

    @Test
    void viewAllSprints_ValidProject_Success() {
        when(helper.getProject(1L)).thenReturn(project);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toDto(any(Sprint.class))).thenReturn(SprintResponse.builder().build());

            List<SprintResponse> result = sprintService.viewAllSprints(1L, auth);

            assertThat(result).hasSize(1);
            verify(helper).authorizeUser(auth, 1L, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));
        }
    }

    // ========== VIEW SPRINT ISSUES TESTS ==========

    @Test
    void viewSprintIssues_ValidSprint_Success() {
        sprint.getIssues().add(issue);
        when(helper.getSprint(1L, 2L)).thenReturn(sprint);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.toDto(issue)).thenReturn(IssueResponse.builder().build());

            List<IssueResponse> result = sprintService.viewSprintIssues(1L, 2L, null, auth);

            assertThat(result).hasSize(1);
        }
    }

    @Test
    void viewSprintIssues_SprintNotFound_ReturnsEmptyList() {
        when(helper.getSprint(1L, 2L)).thenReturn(null);

        List<IssueResponse> result = sprintService.viewSprintIssues(1L, 2L, null, auth);

        assertThat(result).isEmpty();
    }

    // ========== CHECK STATUS TESTS ==========

    @Test
    void checkStatus_UserWithOverdueSprints_ReturnsOverdueSprints() {
        Sprint overdueSprint = new Sprint();
        overdueSprint.setId(3L);
        overdueSprint.setSprintStatus(SprintStatus.ACTIVE);
        overdueSprint.setEndDate(LocalDateTime.now().minusDays(1)); // Past end date
        project.getSprints().add(overdueSprint);

        when(auth.getName()).thenReturn("test_user");
        when(helper.getUser("test_user")).thenReturn(user);

        try (MockedStatic<SprintMapper> mapper = mockStatic(SprintMapper.class)) {
            mapper.when(() -> SprintMapper.toOverdueSprintDto(overdueSprint)).thenReturn(new OverdueSprint(project.getId(), sprint.getId(), 1));

            List<OverdueSprint> result = sprintService.checkStatus(auth);

            assertThat(result).hasSize(1);
        }
    }

    @Test
    void checkStatus_NoOverdueSprints_ReturnsEmptyList() {
        when(auth.getName()).thenReturn("test_user");
        when(helper.getUser("test_user")).thenReturn(user);

        List<OverdueSprint> result = sprintService.checkStatus(auth);

        assertThat(result).isEmpty();
    }

    @Test
    void checkStatus_TeamLeadUser_Success() {
        User teamLead = new User();
        teamLead.setUsername("team_lead");
        teamLead.setRole(UserRole.TEAM_LEAD);
        teamLead.setManagedProjects(new ArrayList<>());
        teamLead.setLeadingProject(project);

        when(auth.getName()).thenReturn("team_lead");
        when(helper.getUser("team_lead")).thenReturn(teamLead);

        List<OverdueSprint> result = sprintService.checkStatus(auth);

        assertThat(result).isEmpty(); // No overdue sprints in this case
    }
}