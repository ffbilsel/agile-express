package com.ffb.be.service;

import com.ffb.be.model.dto.response.DashboardResponse;
import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.model.entity.Project;
import com.ffb.be.model.entity.User;
import com.ffb.be.model.enums.SprintStatus;
import com.ffb.be.model.mapper.ProjectMapper;
import com.ffb.be.repository.jpa.IssueRepository;
import com.ffb.be.repository.jpa.ProjectRepository;
import com.ffb.be.service.helper.EntityAccessHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // <-- Added
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j // <-- Added
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final ZoneId TR = ZoneId.of("Europe/Istanbul");

    private final EntityAccessHelper helper;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final Clock clock = Clock.system(TR); // Inject a Clock if you want to unit test time logic

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardInfo(Authentication authentication) {
        final String username = authentication.getName();
        log.info("Fetching dashboard statistics for user: {}", username);

        final User user = helper.getUser(username);
        log.debug("Resolved user: {}", user);

        List<Project> projectEntities = resolveUserProjects(user);
        log.debug("User '{}' has access to {} project(s)", username, projectEntities.size());

        List<ProjectResponse> projects = mapProjectsToDto(projectEntities);

        int activeSprints = countActiveSprints(projectEntities);
        log.debug("User '{}' has {} active sprint(s)", username, activeSprints);

        int openIssues = countOpenIssues(username);
        log.debug("User '{}' has {} open issue(s)", username, openIssues);

        int closedIssues = countClosedIssuesThisWeek(username);
        log.debug("User '{}' has {} closed issue(s) this week", username, closedIssues);

        log.info("Dashboard statistics ready for user: {}", username);
        return new DashboardResponse(projects, activeSprints, openIssues, closedIssues);
    }

    private LocalDateTime weekStartTr() {
        LocalDate todayTr = LocalDate.now(clock);
        LocalDate monday = todayTr.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime result = monday.atStartOfDay();
        log.trace("Week start (TR): {}", result);
        return result;
    }

    private LocalDateTime weekEndTr(LocalDateTime start) {
        LocalDateTime result = start.plusWeeks(1);
        log.trace("Week end (TR): {}", result);
        return result;
    }

    private List<Project> resolveUserProjects(User user) {
        log.debug("Resolving projects for user: {} with role: {}", user.getUsername(), user.getRole());
        return switch (user.getRole()) {
            case ADMIN -> {
                List<Project> allProjects = projectRepository.findAll();
                log.debug("Admin access: returning all {} project(s)", allProjects.size());
                yield allProjects;
            }
            case PROJECT_MANAGER -> {
                List<Project> managed = user.getManagedProjects() != null ? user.getManagedProjects() : List.of();
                log.debug("Project manager access: {} managed project(s)", managed.size());
                yield managed;
            }
            case TEAM_LEAD -> {
                Project p = user.getLeadingProject();
                log.debug("Team lead access: {}", p != null ? "1 project" : "no project");
                yield p != null ? List.of(p) : List.of();
            }
            case TEAM_MEMBER -> {
                Project p = user.getMemberProject();
                log.debug("Team member access: {}", p != null ? "1 project" : "no project");
                yield p != null ? List.of(p) : List.of();
            }
        };
    }

    private List<ProjectResponse> mapProjectsToDto(List<Project> projects) {
        if (projects == null || projects.isEmpty()) {
            log.debug("No projects to map to DTOs");
            return Collections.emptyList();
        }
        log.debug("Mapping {} project(s) to DTOs", projects.size());
        List<ProjectResponse> out = new ArrayList<>(projects.size());
        for (Project p : projects) {
            out.add(ProjectMapper.toDto(p));
        }
        return out;
    }

    private int countActiveSprints(List<Project> projects) {
        if (projects == null || projects.isEmpty()) {
            log.debug("No projects provided to count active sprints");
            return 0;
        }
        int count = (int) projects.stream()
                .flatMap(p -> p.getSprints().stream())
                .filter(s -> s.getSprintStatus() == SprintStatus.ACTIVE)
                .count();
        log.debug("Counted {} active sprint(s)", count);
        return count;
    }

    private int countOpenIssues(String username) {
        int count = issueRepository.countByClosedAtIsNullAndAssignee_UsernameOrAssigner_Username(username, username);
        log.debug("Counted {} open issue(s) for user '{}'", count, username);
        return count;
    }

    private int countClosedIssuesThisWeek(String username) {
        LocalDateTime start = weekStartTr();
        LocalDateTime end = weekEndTr(start);
        int count = issueRepository.countClosedByAssigneeInRange(username, start, end);
        log.debug("Counted {} closed issue(s) for user '{}' between {} and {}", count, username, start, end);
        return count;
    }
}
