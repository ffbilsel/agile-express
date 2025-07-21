package com.ffb.be.service;

import com.ffb.be.model.dto.request.issue.*;
import com.ffb.be.model.dto.response.EffortResponse;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.common.EntityNotFoundException;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.model.mapper.IssueMapper;
import com.ffb.be.repository.elastic.IssueSearchRepository;
import com.ffb.be.repository.jpa.EffortRepository;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final EntityAccessHelper helper;
    private final EffortRepository effortRepository;
    private final ElasticSyncService elasticSyncService;
    private final IssueSearchRepository issueSearchRepository;

    @Transactional
    public IssueResponse createIssue(IssueCreatePayload payload, Authentication auth) {
        log.info("Creating issue in project {}", payload.getProjectId());

        validateTitle(payload.getTitle());
        Project project = helper.getProject(payload.getProjectId());
        helper.authorizeUser(auth, payload.getProjectId(), allowedRolesForIssue());

        Issue issue = new Issue();
        issue.setProject(project);
        issue.setSprint(resolveSprint(project, payload.getSprintId()));
        issue.setTitle(payload.getTitle());
        issue.setDescription(payload.getDescription());
        issue.setStoryPoints(payload.getStoryPoints());
        issue.setEstimatedEffort(payload.getEstimatedEffort());
        issue.setIssueType(payload.getIssueType());
        issue.setStatus(helper.getStatusByStatusName(payload.getProjectId(), payload.getStatus()));
        issue.setClosedAt(payload.getStatus().equalsIgnoreCase("DONE") ? LocalDateTime.now() : null);
        issue.setAssigner(helper.getUser(auth.getName()));

        if (payload.getAssignee() != null && !payload.getAssignee().isBlank()) {
            log.debug("Assigning issue to {}", payload.getAssignee());
            issue.setAssignee(helper.getUser(payload.getAssignee()));
        }

        issue.setIssuedAt(LocalDateTime.now());
        issue = issueRepository.save(issue);
        elasticSyncService.indexIssue(issue);

        issue.getSprint().getIssues().add(issue);
        sprintRepository.save(issue.getSprint());
        projectRepository.save(project);

        log.info("Issue created with ID {}", issue.getId());
        return IssueMapper.toDto(issue);
    }

    @Transactional
    public IssueResponse updateIssue(IssueUpdatePayload payload, Authentication auth) {
        log.info("Updating issue {} in project {}", payload.getIssueId(), payload.getProjectId());

        validateTitle(payload.getTitle());
        Issue issue = helper.getIssue(payload.getProjectId(), payload.getIssueId());
        helper.authorizeUser(auth, payload.getProjectId(), allowedRolesForIssue());

        issue.setTitle(payload.getTitle());
        issue.setDescription(payload.getDescription());
        if (payload.getStoryPoints() != null) {
            issue.setStoryPoints(payload.getStoryPoints());
        }
        if (payload.getEstimatedEffort() != null) {
            issue.setEstimatedEffort(payload.getEstimatedEffort());
        }
        issue.setIssueType(payload.getIssueType());
        issue.setStatus(helper.getStatusByStatusName(payload.getProjectId(), payload.getStatus()));

        updateAssigneeIfPresent(payload.getAssignee(), issue);
        updateSprintIfChanged(payload, issue);

        if (payload.getStatus().equalsIgnoreCase("DONE")) {
            issue.setClosedAt(LocalDateTime.now());
        }
        else {
            issue.setClosedAt(null);
        }

        Issue saved = issueRepository.save(issue);
        elasticSyncService.indexIssue(issue);
        log.info("Issue {} updated successfully", saved.getId());
        return IssueMapper.toDto(saved);
    }

    @Transactional
    public void deleteIssue(long issueId, Authentication auth) {
        log.info("Deleting issue {}", issueId);

        Issue issue = helper.getIssueById(issueId);

        helper.authorizeUser(auth, issue.getProject().getId(), allowedRolesForIssue());

        Sprint sprint = issue.getSprint();
        if (sprint != null) {
            sprint.getIssues().remove(issue);
            sprintRepository.save(sprint);
        }

        issueRepository.delete(issue);
        issueSearchRepository.deleteById(issueId);
        log.info("Issue {} deleted", issueId);
    }

    @Transactional
    public IssueResponse viewIssue(long projectId, long issueId, Authentication auth) {
        log.info("Viewing issue {} in project {}", issueId, projectId);
        helper.authorizeUser(auth, projectId, allProjectRoles());
        Issue issue = helper.getIssue(projectId, issueId);
        return IssueMapper.toDto(issue);
    }

    @Transactional
    public IssueResponse createEffort(EffortCreatePayload payload, Authentication auth) {
        log.info("Creating effort for issue {} in project {}", payload.getIssueId(), payload.getProjectId());

        Issue issue = helper.getIssue(payload.getProjectId(), payload.getIssueId());
        User user = helper.getAuthorizedUser(auth, payload.getProjectId(), allProjectRoles());

        helper.checkDates(payload.getStartTime(), payload.getEndTime());

        boolean overlaps = issue.getEfforts().stream().anyMatch(e ->
                payload.getStartTime().isBefore(e.getEndTime()) && e.getStartTime().isBefore(payload.getEndTime())
        );
        if (overlaps) {
            log.warn("Effort creation failed: overlapping effort detected");
            throw new InvalidDataException("efforts overlap");
        }

        Effort effort = new Effort();
        effort.setDescription(payload.getDescription());
        effort.setIssue(issue);
        effort.setStartTime(payload.getStartTime());
        effort.setEndTime(payload.getEndTime());
        effort.setPerson(user);
        effortRepository.save(effort);

        issue.getEfforts().add(effort);
        Issue saved = issueRepository.save(issue);

        log.info("Effort created successfully for issue {}", payload.getIssueId());
        return IssueMapper.toDto(saved);
    }

    @Transactional
    public EffortResponse updateEffort(EffortUpdatePayload payload, Authentication auth) {
        log.info("Updating effort {} for issue {}", payload.getEffortId(), payload.getIssueId());

        helper.authorizeUser(auth, payload.getProjectId(), allProjectRoles());

        Effort effort = helper.getEffortWithIssue_Id(payload.getEffortId(), payload.getIssueId());

        helper.checkDates(payload.getStartTime(), payload.getEndTime());

        effort.setDescription(payload.getDescription());
        effort.setStartTime(payload.getStartTime());
        effort.setEndTime(payload.getEndTime());

        Effort saved = effortRepository.save(effort);
        log.info("Effort {} updated", saved.getId());

        return IssueMapper.effortToDto(saved);
    }

    @Transactional
    public void deleteEffort(long projectId, long issueId, long effortId, Authentication auth) {
        log.info("Deleting effort {} from issue {}", effortId, issueId);

        helper.authorizeUser(auth, projectId, allProjectRoles());

        Issue issue = helper.getIssue(projectId, issueId);
        Effort effort = helper.getEffortWithIssue_Id(effortId, issueId);

        issue.getEfforts().remove(effort);
        effortRepository.delete(effort);

        log.info("Effort {} deleted", effortId);
    }

    @Transactional
    public EffortResponse viewEffort(long projectId, long issueId, long effortId, Authentication auth) {
        log.info("Viewing effort {} of issue {} in project {}", effortId, issueId, projectId);

        helper.authorizeUser(auth, projectId, allProjectRoles());

        Effort effort = helper.getEffortWithIssue_Id(effortId, issueId);
        return IssueMapper.effortToDto(effort);
    }

    // ==== Private Helpers ====

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            log.warn("Issue title validation failed: title is null or blank");
            throw new InvalidDataException("Title is mandatory");
        }
    }

    private Sprint resolveSprint(Project project, Long sprintId) {
        if (sprintId == null) {
            log.debug("No sprint ID provided; using backlog for project {}", project.getId());
            return project.getBacklog();
        }

        return project.getSprints().stream()
                .filter(s -> s.getId().equals(sprintId))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Sprint {} not found in project {}", sprintId, project.getId());
                    return new EntityNotFoundException("Sprint", sprintId);
                });
    }

    private void updateAssigneeIfPresent(String assignee, Issue issue) {
        if (assignee != null && !assignee.isBlank()) {
            log.debug("Updating assignee to {}", assignee);
            issue.setAssignee(helper.getUser(assignee));
        }
    }

    private void updateSprintIfChanged(IssueUpdatePayload payload, Issue issue) {
        if (payload.getNewSprintId() != null && !payload.getNewSprintId().equals(issue.getSprint().getId())) {
            log.info("Changing sprint for issue {} to {}", issue.getId(), payload.getNewSprintId());

            Sprint prevSprint = issue.getSprint();
            Sprint newSprint = helper.getSprint(payload.getProjectId(), payload.getNewSprintId());

            issue.setSprint(newSprint);
            newSprint.getIssues().add(issue);
            prevSprint.getIssues().remove(issue);

            sprintRepository.save(prevSprint);
            sprintRepository.save(newSprint);
        }
    }

    private List<UserRole> allowedRolesForIssue() {
        return List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD);
    }

    private List<UserRole> allProjectRoles() {
        return List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER);
    }
}
