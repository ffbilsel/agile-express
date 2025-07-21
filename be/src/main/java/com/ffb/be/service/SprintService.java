package com.ffb.be.service;

import com.ffb.be.model.dto.request.sprint.SprintCreatePayload;
import com.ffb.be.model.dto.request.sprint.SprintGetPayload;
import com.ffb.be.model.dto.request.sprint.SprintUpdatePayload;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.dto.response.OverdueSprint;
import com.ffb.be.model.dto.response.SprintResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprintService {

    private final EntityAccessHelper helper;
    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public SprintResponse createSprint(SprintCreatePayload payload, Authentication auth) {
        log.info("Creating sprint for project ID {} with start date {} and end date {}", payload.getProjectId(), payload.getStartDate(), payload.getEndDate());
        helper.authorizeUser(auth, payload.getProjectId(),
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD));

        Project project = helper.getProject(payload.getProjectId());
        helper.checkDates(payload.getStartDate(), payload.getEndDate());

        Sprint sprint = new Sprint();
        sprint.setProject(project);
        sprint.setSprintStatus(SprintStatus.PLANNED);
        sprint.setStartDate(payload.getStartDate());
        sprint.setEndDate(payload.getEndDate());

        sprint = sprintRepository.save(sprint);
        log.info("Sprint created with ID {} for project ID {}", sprint.getId(), project.getId());
        return SprintMapper.toDto(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(SprintUpdatePayload payload, Authentication auth) {
        log.info("Updating sprint ID {} in project ID {}", payload.getSprintId(), payload.getProjectId());
        helper.authorizeUser(auth, payload.getProjectId(),
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD));

        helper.checkDates(payload.getStartDate(), payload.getEndDate());

        Sprint sprint = helper.getSprint(payload.getProjectId(), payload.getSprintId());

        if (sprint.getSprintStatus() == SprintStatus.BACKLOG) {
            log.warn("Attempt to edit backlog sprint ID {}", sprint.getId());
            throw new UnallowedActionException("Cannot edit backlog sprint");
        }

        updateSprintStatusIfNeeded(sprint, payload.getStatus());

        sprint.setStartDate(payload.getStartDate());
        sprint.setEndDate(payload.getEndDate());

        sprint = sprintRepository.save(sprint);
        projectRepository.save(sprint.getProject());
        log.info("Sprint ID {} updated", sprint.getId());
        return SprintMapper.toDto(sprint);
    }

    @Transactional
    public void deleteSprint(SprintGetPayload payload, Authentication auth) {
        log.info("Deleting sprint ID {} from project ID {}", payload.getSprintId(), payload.getProjectId());
        helper.authorizeUser(auth, payload.getProjectId(),
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD));

        Project project = helper.getProject(payload.getProjectId());
        Sprint sprint = helper.getSprint(payload.getProjectId(), payload.getSprintId());

        if (sprint.getSprintStatus() == SprintStatus.ACTIVE || sprint.getSprintStatus() == SprintStatus.BACKLOG) {
            log.warn("Attempt to delete active or backlog sprint ID {}", sprint.getId());
            throw new UnallowedActionException("Cannot delete backlog or active sprint");
        }

        sprint.getIssues().forEach(issue -> issue.setSprint(project.getBacklog()));
        issueRepository.saveAll(sprint.getIssues());
        log.debug("Moved {} issues from sprint ID {} to backlog", sprint.getIssues().size(), sprint.getId());

        sprintRepository.delete(sprint);
        log.info("Sprint ID {} deleted", sprint.getId());
    }

    @Transactional
    public SprintResponse viewSprint(long projectId, Long sprintId, String sprintName, Authentication auth) {
        log.info("Viewing sprint in project ID {} with sprintId={} or sprintName='{}'", projectId, sprintId, sprintName);
        helper.authorizeUser(auth, projectId,
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));

        Sprint sprint = resolveSprint(projectId, sprintId, sprintName);
        if (sprint != null) {
            log.debug("Sprint resolved with ID {}", sprint.getId());
        } else {
            log.warn("Sprint not found for project ID {} with sprintId={} or sprintName='{}'", projectId, sprintId, sprintName);
        }
        return SprintMapper.toDto(sprint);
    }

    @Transactional
    public List<SprintResponse> viewAllSprints(long projectId, Authentication auth) {
        log.info("Viewing all sprints for project ID {}", projectId);
        helper.authorizeUser(auth, projectId,
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));

        Project project = helper.getProject(projectId);

        List<SprintResponse> sprints = project.getSprints().stream()
                .map(SprintMapper::toDto)
                .collect(Collectors.toList());
        log.debug("Found {} sprints for project ID {}", sprints.size(), projectId);

        return sprints;
    }

    @Transactional
    public List<IssueResponse> viewSprintIssues(long projectId, Long sprintId, String sprintName, Authentication auth) {
        log.info("Viewing issues for sprint in project ID {} with sprintId={} or sprintName='{}'", projectId, sprintId, sprintName);
        helper.authorizeUser(auth, projectId,
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));

        Sprint sprint = resolveSprint(projectId, sprintId, sprintName);
        if (sprint == null) {
            log.warn("Sprint not found, returning empty issue list");
            return List.of();
        }

        List<IssueResponse> issues = sprint.getIssues().stream()
                .map(IssueMapper::toDto)
                .collect(Collectors.toList());
        log.debug("Returning {} issues for sprint ID {}", issues.size(), sprint.getId());

        return issues;
    }

    @Transactional
    public List<OverdueSprint> checkStatus(Authentication auth) {
        User user = helper.getUser(auth.getName());
        log.info("Checking overdue sprints for user '{}'", user.getUsername());

        List<Project> projects = collectUserProjects(user);
        log.debug("User '{}' involved in {} projects", user.getUsername(), projects.size());

        List<OverdueSprint> overdueSprints = projects.stream()
                .flatMap(project -> project.getSprints().stream())
                .filter(this::isSprintActiveAndPastEndDate)
                .map(SprintMapper::toOverdueSprintDto)
                .collect(Collectors.toList());

        log.info("Found {} overdue active sprints for user '{}'", overdueSprints.size(), user.getUsername());
        return overdueSprints;
    }

    // ========== Private helper methods ==========

    private Sprint resolveSprint(long projectId, Long sprintId, String sprintName) {
        if (sprintId != null) {
            log.debug("Resolving sprint by ID {}", sprintId);
            return helper.getSprint(projectId, sprintId);
        }
        if (sprintName != null && !sprintName.isBlank()) {
            log.debug("Resolving sprint by name '{}'", sprintName);
            return switch (sprintName.toUpperCase()) {
                case "ACTIVE" -> helper.getProject(projectId).getActiveSprint();
                case "BACKLOG" -> helper.getProject(projectId).getBacklog();
                default -> null;
            };
        }
        log.debug("No sprintId or sprintName provided for resolution");
        return null;
    }

    private List<Project> collectUserProjects(User user) {
        List<Project> projects = user.getRole().equals(UserRole.ADMIN) ? projectRepository.findAll()
                : new ArrayList<>(user.getManagedProjects());
        Optional.ofNullable(user.getLeadingProject()).ifPresent(projects::add);
        log.debug("Collected {} projects for user '{}'", projects.size(), user.getUsername());
        return projects;
    }

    private boolean isSprintActiveAndPastEndDate(Sprint sprint) {
        boolean overdue = sprint.getSprintStatus() == SprintStatus.ACTIVE &&
                sprint.getEndDate().isBefore(LocalDateTime.now());
        if (overdue) {
            log.debug("Sprint ID {} is active and overdue", sprint.getId());
        }
        return overdue;
    }

    private void updateSprintStatusIfNeeded(Sprint sprint, SprintStatus newStatus) {
        if (newStatus == null || newStatus.equals(sprint.getSprintStatus())) {
            log.debug("Sprint status not changed for sprint ID {}", sprint.getId());
            return;
        }
        if (newStatus == SprintStatus.BACKLOG) {
            log.warn("Attempt to set sprint status to BACKLOG for sprint ID {}", sprint.getId());
            throw new UnallowedActionException("Cannot set sprint status to BACKLOG");
        }

        if (sprint.getSprintStatus() == SprintStatus.ACTIVE) {
            log.debug("Clearing active sprint from project ID {}", sprint.getProject().getId());
            sprint.getProject().setActiveSprint(null);
        }
        if (newStatus == SprintStatus.ACTIVE) {
            log.debug("Setting sprint ID {} as active sprint for project ID {}", sprint.getId(), sprint.getProject().getId());
            if (sprint.getProject().getActiveSprint() != null) {
                sprint.getProject().getActiveSprint().setSprintStatus(SprintStatus.COMPLETED);
            }
            sprint.getProject().setActiveSprint(sprint);
        }

        sprint.setSprintStatus(newStatus);
        log.info("Sprint ID {} status updated to {}", sprint.getId(), newStatus);
    }
}
