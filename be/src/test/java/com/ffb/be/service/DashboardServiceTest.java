package com.ffb.be.service;

import com.ffb.be.model.dto.response.DashboardResponse;
import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.SprintStatus;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.repository.jpa.IssueRepository;
import com.ffb.be.repository.jpa.ProjectRepository;
import com.ffb.be.service.helper.EntityAccessHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class DashboardServiceTest {

    private EntityAccessHelper helper;
    private ProjectRepository projectRepository;
    private IssueRepository issueRepository;
    private DashboardService dashboardService;
    private Authentication authentication;

    private final Clock fixedClock = Clock.fixed(
            LocalDateTime.of(2025, 8, 4, 10, 0).atZone(ZoneId.of("Europe/Istanbul")).toInstant(),
            ZoneId.of("Europe/Istanbul")
    );

    @BeforeEach
    void setUp() {
        helper = mock(EntityAccessHelper.class);
        projectRepository = mock(ProjectRepository.class);
        issueRepository = mock(IssueRepository.class);
        authentication = mock(Authentication.class);

        dashboardService = new DashboardService(helper, projectRepository, issueRepository);
    }

    @Test
    void testGetDashboardInfo_asAdmin() {
        // Arrange
        User admin = new User();
        admin.setUsername("admin");
        admin.setRole(UserRole.ADMIN);

        Project project1 = new Project();
        Project project2 = new Project();

        Sprint sprint1 = new Sprint();
        sprint1.setSprintStatus(SprintStatus.ACTIVE);
        Sprint sprint2 = new Sprint();
        sprint2.setSprintStatus(SprintStatus.COMPLETED);

        project1.setSprints(List.of(sprint1, sprint2));
        project2.setSprints(List.of(sprint1));

        List<Project> projects = List.of(project1, project2);

        when(authentication.getName()).thenReturn("admin");
        when(helper.getUser("admin")).thenReturn(admin);
        when(projectRepository.findAll()).thenReturn(projects);
        when(issueRepository.countByClosedAtIsNullAndAssignee_UsernameOrAssigner_Username("admin", "admin"))
                .thenReturn(5);
        when(issueRepository.countClosedByAssigneeInRange(
                eq("admin"),
                any(LocalDateTime.class),
                any(LocalDateTime.class))
        ).thenReturn(3);

        // Act
        DashboardResponse result = dashboardService.getDashboardInfo(authentication);

        // Assert
        assertThat(result.getProjects()).hasSize(2);
        assertThat(result.getActiveSprintCount()).isEqualTo(2); // sprint1 is active in both
        assertThat(result.getOpenIssueCount()).isEqualTo(5);
        assertThat(result.getClosedIssueCount()).isEqualTo(3);

        verify(helper).getUser("admin");
        verify(projectRepository).findAll();
    }

    @Test
    void testGetDashboardInfo_asTeamLead_noProject() {
        // Arrange
        User lead = new User();
        lead.setUsername("lead");
        lead.setRole(UserRole.TEAM_LEAD);
        lead.setLeadingProject(null);

        when(authentication.getName()).thenReturn("lead");
        when(helper.getUser("lead")).thenReturn(lead);
        when(issueRepository.countByClosedAtIsNullAndAssignee_UsernameOrAssigner_Username("lead", "lead"))
                .thenReturn(0);
        when(issueRepository.countClosedByAssigneeInRange(
                eq("lead"),
                any(LocalDateTime.class),
                any(LocalDateTime.class))
        ).thenReturn(0);

        // Act
        DashboardResponse result = dashboardService.getDashboardInfo(authentication);

        // Assert
        assertThat(result.getProjects()).isEmpty();
        assertThat(result.getActiveSprintCount()).isZero();
        assertThat(result.getOpenIssueCount()).isZero();
        assertThat(result.getClosedIssueCount()).isZero();

        verify(helper).getUser("lead");
    }
}
