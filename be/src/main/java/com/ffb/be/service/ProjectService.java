package com.ffb.be.service;

import com.ffb.be.model.dto.request.project.*;
import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.SprintStatus;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.auth.UnallowedActionException;
import com.ffb.be.model.exception.common.DuplicateDataException;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.model.mapper.ProjectMapper;
import com.ffb.be.repository.elastic.ProjectSearchRepository;
import com.ffb.be.repository.jpa.*;
import com.ffb.be.service.helper.EntityAccessHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final EntityAccessHelper helper;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;
    private final ElasticSyncService elasticSyncService;
    private final ProjectSearchRepository projectSearchRepository;

    @Transactional
    public ProjectResponse createProject(ProjectCreatePayload payload) {
        log.info("Creating project with name '{}'", payload.getName());
        helper.checkDates(payload.getStartDate(), payload.getEndDate());
        validateProjectName(payload.getName());

        Project project = new Project();
        project.setName(payload.getName());
        project.setStartDate(payload.getStartDate());
        project.setEndDate(payload.getEndDate());

        assignManagerIfValid(project, payload.getManager());
        assignTeamLeadIfValid(project, payload.getTeamLead());

        project = projectRepository.save(project);
        log.debug("Project saved with ID {}", project.getId());
        elasticSyncService.indexProject(project);

        assignTeamMembers(project, payload.getTeamMembers());

        project = setupSprints(project, payload.getStartDate());
        setStatuses(project.getId(), payload.getStatuses());

        log.info("Project '{}' created successfully with ID {}", project.getName(), project.getId());
        return ProjectMapper.toDto(project);
    }

    @Transactional
    public ProjectResponse updateProject(ProjectUpdatePayload payload) {
        log.info("Updating project with ID {}", payload.getProjectId());
        validateProjectName(payload.getName());
        helper.checkDates(payload.getStartDate(), payload.getEndDate());

        Project project = helper.getProject(payload.getProjectId());

        project.setName(payload.getName());
        project.setStartDate(payload.getStartDate());
        project.setEndDate(payload.getEndDate());

        if (payload.getManager() != null && !payload.getManager().isBlank()) {
            log.debug("Setting project manager to '{}'", payload.getManager());
            setProjectManager(project, payload.getManager());
        }

        if (payload.getTeamLead() != null && !payload.getTeamLead().isBlank()) {
            log.debug("Setting project team lead to '{}'", payload.getTeamLead());
            setProjectTeamLead(project, payload.getTeamLead());
        }

        updateTeamMembers(project, payload.getTeamMembers());

        Project saved = projectRepository.save(project);
        elasticSyncService.indexProject(project);
        log.debug("Project with ID {} saved", saved.getId());

        setStatuses(saved.getId(), payload.getStatuses());

        log.info("Project with ID {} updated successfully", saved.getId());
        return ProjectMapper.toDto(saved);
    }

    @Transactional
    public void deleteProject(long projectId, Authentication auth) {
        log.info("Deleting project with ID {}", projectId);
        helper.authorizeUser(auth, projectId, List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER));

        Project project = helper.getProject(projectId);

        if (project.getManager() != null) {
            log.debug("Removing project from manager '{}' managed projects", project.getManager().getUsername());
            project.getManager().getManagedProjects().remove(project);
        }

        if (project.getTeamLead() != null) {
            log.debug("Removing team lead '{}' from project", project.getTeamLead().getUsername());
            project.getTeamLead().setLeadingProject(null);
        }

        if (project.getTeamMembers() != null) {
            log.debug("Clearing {} team members from project", project.getTeamMembers().size());
            project.getTeamMembers().forEach(member -> member.setMemberProject(null));
        }

        for (Sprint sprint : project.getSprints()) {
            log.debug("Deleting issues for sprint with ID {}", sprint.getId());
            issueRepository.deleteAll(sprint.getIssues());
        }

        sprintRepository.delete(project.getBacklog());
        if (project.getActiveSprint() != null) {
            sprintRepository.delete(project.getActiveSprint());
        }

        projectRepository.delete(project);
        projectSearchRepository.deleteById(projectId);
        log.info("Project with ID {} deleted", projectId);
    }

    @Transactional
    public ProjectResponse viewProject(long projectId, Authentication auth) {
        log.info("Viewing project with ID {}", projectId);
        helper.authorizeUser(auth, projectId,
                List.of(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_LEAD, UserRole.TEAM_MEMBER));
        Project project = helper.getProject(projectId);
        log.debug("Project retrieved: {}", project.getName());
        return ProjectMapper.toDto(project);
    }

    @Transactional
    public List<ProjectResponse> viewAllProjects(Authentication auth) {
        User user = helper.getUser(auth.getName());
        log.info("Fetching all projects for user '{}', role {}", user.getUsername(), user.getRole());
        List<ProjectResponse> response = new ArrayList<>();

        if (UserRole.ADMIN.equals(user.getRole())) {
            log.debug("User is admin, fetching all projects");
            response.addAll(projectRepository.findAll().stream().map(ProjectMapper::toDto).toList());
        }

        if (user.getManagedProjects() != null) {
            log.debug("User manages {} projects", user.getManagedProjects().size());
            user.getManagedProjects().forEach(p -> response.add(ProjectMapper.toDto(p)));
        }

        if (user.getMemberProject() != null) {
            log.debug("User is member of project ID {}", user.getMemberProject().getId());
            response.add(ProjectMapper.toDto(user.getMemberProject()));
        }

        if (user.getLeadingProject() != null) {
            log.debug("User leads project ID {}", user.getLeadingProject().getId());
            response.add(ProjectMapper.toDto(user.getLeadingProject()));
        }

        log.info("Returning {} projects for user '{}'", response.size(), user.getUsername());
        return response;
    }

    @Transactional
    public void removeUserFromAllProjects(User user) {
        if (user == null) {
            log.debug("User is null in removeUserFromProject, skipping");
            return;
        }

        unassignAllIssues(user.getUsername());

        if ((user.getRole().equals(UserRole.PROJECT_MANAGER) ||  user.getRole().equals(UserRole.ADMIN))
                && user.getManagedProjects() != null) {
            for (Project project : user.getManagedProjects()) {
                project.setManager(null);
            }
            user.setManagedProjects(List.of());
        }

        if (user.getRole().equals(UserRole.TEAM_MEMBER) && user.getMemberProject() != null) {
            user.getMemberProject().getTeamMembers()
                    .removeIf(member -> member.getUsername().equals(user.getUsername()));
            user.setMemberProject(null);
        }

        if (user.getRole().equals(UserRole.TEAM_LEAD) && user.getLeadingProject() != null) {
            user.getLeadingProject().setTeamLead(null);
            user.setLeadingProject(null);
        }
    }

    // ================== Private Helpers ==================

    private void validateProjectName(String name) {
        if (name == null || name.isBlank()) {
            log.warn("Invalid project name provided");
            throw new InvalidDataException("Name is mandatory");
        }
    }

    private void assignManagerIfValid(Project project, String username) {
        if (username == null || username.isBlank()) {
            log.debug("No manager username provided, skipping manager assignment");
            return;
        }
        User manager = helper.getUser(username);
        if (UserRole.PROJECT_MANAGER.equals(manager.getRole()) && project.getManager() == null) {
            log.debug("Assigning manager '{}' to project", username);
            project.setManager(manager);
            manager.getManagedProjects().add(project);
        } else {
            log.warn("User '{}' is not a project manager or project already has a manager", username);
        }
    }

    private void assignTeamLeadIfValid(Project project, String username) {
        if (username == null || username.isBlank()) {
            log.debug("No team lead username provided, skipping team lead assignment");
            return;
        }
        User lead = helper.getUser(username);
        if (UserRole.TEAM_LEAD.equals(lead.getRole()) && project.getTeamLead() == null) {
            log.debug("Assigning team lead '{}' to project", username);
            project.setTeamLead(lead);
            lead.setLeadingProject(project);
        } else {
            log.warn("User '{}' is not a team lead or project already has a team lead", username);
        }
    }

    private void assignTeamMembers(Project project, List<String> usernames) {
        log.debug("Assigning {} team members to project ID {}", usernames.size(), project.getId());
        List<User> members = helper.getUsers(usernames);
        if (!members.stream().allMatch(u -> UserRole.TEAM_MEMBER.equals(u.getRole()) && u.getMemberProject() == null)) {
            log.warn("One or more users are not team members or already assigned to a project");
            throw new InvalidDataException("all members are not team member");
        }
        for (User u : members) {
            u.setMemberProject(project);
            log.debug("User '{}' assigned as team member", u.getUsername());
        }
        project.getTeamMembers().addAll(members);
        projectRepository.save(project);
    }

    private Project setupSprints(Project project, LocalDateTime startDate) {
        log.debug("Setting up sprints for project ID {}", project.getId());

        Sprint backlog = new Sprint();
        backlog.setProject(project);
        backlog.setSprintStatus(SprintStatus.BACKLOG);
        sprintRepository.save(backlog);
        log.debug("Backlog sprint created with ID {}", backlog.getId());

        Sprint active = new Sprint();
        active.setProject(project);
        active.setSprintStatus(SprintStatus.ACTIVE);
        active.setStartDate(startDate);
        active.setEndDate(startDate.plusWeeks(1));
        sprintRepository.save(active);
        log.debug("Active sprint created with ID {}", active.getId());

        project.setBacklog(backlog);
        project.setActiveSprint(active);
        project.getSprints().add(active);

        Project saved = projectRepository.save(project);
        log.debug("Project sprints set and project saved with ID {}", saved.getId());
        return saved;
    }

    private void updateTeamMembers(Project project, List<String> newTeamUsernames) {
        log.debug("Updating team members for project ID {}", project.getId());
        Set<String> uniqueUsernames = new HashSet<>(newTeamUsernames);
        if (uniqueUsernames.size() != newTeamUsernames.size()) {
            log.warn("Duplicate team members found in update payload");
            throw new DuplicateDataException("duplicate team members");
        }

        List<User> requestedUsers = helper.getUsers(newTeamUsernames);
        checkNewUsers(requestedUsers, project.getId());

        List<User> currentMembers = project.getTeamMembers();
        Set<String> currentUsernames = currentMembers.stream().map(User::getUsername).collect(Collectors.toSet());

        List<User> usersToRemove = currentMembers.stream()
                .filter(user -> !uniqueUsernames.contains(user.getUsername()))
                .toList();
        log.debug("Removing {} users from project", usersToRemove.size());
        usersToRemove.forEach(user -> {
            log.debug("Unassigning user '{}' from project", user.getUsername());
            unassignIssuesForProject(user.getUsername(), project.getId());
            user.setMemberProject(null);
        });

        List<User> usersToAdd = requestedUsers.stream()
                .filter(user -> !currentUsernames.contains(user.getUsername()))
                .toList();
        log.debug("Adding {} users to project", usersToAdd.size());
        usersToAdd.forEach(user -> {
            log.debug("Assigning user '{}' as team member", user.getUsername());
            user.setMemberProject(project);
        });
    }

    private void checkNewUsers(List<User> requestedUsers, long projectId) {
        for (User user : requestedUsers) {
            if (!user.getRole().equals(UserRole.TEAM_MEMBER) || (user.getMemberProject() != null && !user.getMemberProject().getId().equals(projectId))) {
                throw new InvalidDataException("Unavailable team members");
            }
        }
    }

    private void setProjectTeamLead(Project project, String username) {
        if (username == null || username.isBlank()) {
            log.debug("Removing current team lead from project ID {}", project.getId());
            User currentLead = project.getTeamLead();
            if (currentLead != null) {
                unassignIssuesForProject(currentLead.getUsername(), project.getId());
                currentLead.setLeadingProject(null);
                project.setTeamLead(null);
            }
            projectRepository.save(project);
            return;
        }

        log.debug("Setting team lead '{}' for project ID {}", username, project.getId());
        User user = helper.getUser(username);
        if (!UserRole.TEAM_LEAD.equals(user.getRole())) {
            log.warn("User '{}' is not a team lead", username);
            throw new UnallowedActionException("given user is not team lead");
        }

        if (user.getLeadingProject() != null && !user.getLeadingProject().equals(project)) {
            log.debug("Removing user '{}' from leading project ID {}", username, user.getLeadingProject().getId());
            user.getLeadingProject().setTeamLead(null);
            projectRepository.save(user.getLeadingProject());
        }

        if (user.getMemberProject() != null && !user.getMemberProject().equals(project)) {
            log.debug("Removing user '{}' from member project ID {}", username, user.getMemberProject().getId());
            user.getMemberProject().getTeamMembers().remove(user);
            user.setMemberProject(null);
            projectRepository.save(user.getMemberProject());
        }

        user.setLeadingProject(project);
        project.setTeamLead(user);
        userRepository.save(user);
        projectRepository.save(project);
        log.debug("User '{}' set as team lead for project ID {}", username, project.getId());
    }

    private void setProjectManager(Project project, String username) {
        if (username == null || username.isBlank()) {
            log.debug("Removing project manager from project ID {}", project.getId());
            unassignIssuesForProject(username, project.getId());
            project.setManager(null);
            projectRepository.save(project);
            return;
        }

        log.debug("Setting project manager '{}' for project ID {}", username, project.getId());
        User user = helper.getUser(username);
        if (!UserRole.PROJECT_MANAGER.equals(user.getRole())) {
            log.warn("User '{}' is not a project manager", username);
            throw new UnallowedActionException("given user is not a pm");
        }

        project.setManager(user);
        user.getManagedProjects().add(project);
        userRepository.save(user);
        projectRepository.save(project);
        log.debug("User '{}' set as project manager for project ID {}", username, project.getId());
    }

    private void setStatuses(long projectId, List<String> statuses) {
        log.debug("Updating statuses for project ID {}", projectId);
        Project project = helper.getProject(projectId);

        List<String> lowerNames = statuses.stream().map(String::trim).map(String::toLowerCase).toList();

        Set<String> duplicates = lowerNames.stream()
                .filter(n -> Collections.frequency(lowerNames, n) > 1)
                .collect(Collectors.toSet());

        if (!duplicates.isEmpty()) {
            log.warn("Duplicate statuses found: {}", duplicates);
            throw new DuplicateDataException("statuses");
        }

        List<Status> existingStatuses = project.getStatuses();
        Set<String> existingNames = existingStatuses.stream()
                .map(s -> s.getName().toLowerCase()).collect(Collectors.toSet());

        List<Status> toRemove = existingStatuses.stream()
                .filter(s -> !lowerNames.contains(s.getName().toLowerCase()))
                .toList();

        List<String> toAdd = statuses.stream()
                .filter(name -> !existingNames.contains(name.toLowerCase()))
                .toList();

        if (!toRemove.isEmpty()) {
            log.debug("Removing {} statuses from project", toRemove.size());
            for (Status s : toRemove) {
                List<Issue> issues = helper.getIssuesByStatus(s);
                issues.forEach(i -> i.setStatus(null));
                issueRepository.saveAll(issues);
            }
            project.getStatuses().removeAll(toRemove);
            statusRepository.deleteAll(toRemove);
        }

        if (!toAdd.isEmpty()) {
            log.debug("Adding {} new statuses to project", toAdd.size());
            List<Status> newStatuses = toAdd.stream().map(name -> {
                Status s = new Status();
                s.setName(name);
                s.setProject(project);
                return s;
            }).toList();

            project.getStatuses().addAll(newStatuses);
            statusRepository.saveAll(newStatuses);
        }

        projectRepository.save(project);
        log.debug("Statuses updated for project ID {}", projectId);
    }

    private void unassignAllIssues(String username) {
        unassignHelper(issueRepository
                .findAllByAssignee_UsernameOrAssigner_Username(username, username), username);
    }

    private void unassignIssuesForProject(String username, long projectId) {
        unassignHelper(issueRepository
                .findAllByProject_IdAndAssignee_UsernameOrAssigner_Username(projectId, username, username),
                username);
    }

    private void unassignHelper(List<Issue> issues, String username) {
        log.debug("Unassigning issues for user '{}'", username);

        for (Issue issue : issues) {
            if (issue.getAssignee() != null && issue.getAssignee().getUsername().equals(username)) {
                issue.setAssignee(null);
                log.debug("Unassigned assignee for issue ID {}", issue.getId());
            }
            if (issue.getAssigner() != null && issue.getAssigner().getUsername().equals(username)) {
                issue.setAssigner(null);
                log.debug("Unassigned assigner for issue ID {}", issue.getId());
            }
        }

        issueRepository.saveAll(issues);
    }
}
