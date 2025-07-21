package com.ffb.be.service.helper;

import com.ffb.be.model.entity.*;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.auth.UnauthorizedUserException;
import com.ffb.be.model.exception.common.EntityNotFoundException;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EntityAccessHelper {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final EffortRepository effortRepository;

    public User getUser(String username) {
        log.debug("Fetching user by username: {}", username);
        return userRepository.findUserByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new EntityNotFoundException("User", username);
                });
    }

    public Project getProject(long projectId) {
        log.debug("Fetching project by ID: {}", projectId);
        return projectRepository.findProjectById(projectId)
                .orElseThrow(() -> {
                    log.warn("Project not found: {}", projectId);
                    return new EntityNotFoundException("Project", projectId);
                });
    }

    public Issue getIssue(long projectId, long issueId) {
        log.debug("Fetching issue by ID: {} for project ID: {}", issueId, projectId);
        return issueRepository.findIssueByIdAndProject_Id(issueId, projectId)
                .orElseThrow(() -> {
                    log.warn("Issue not found: {} in project: {}", issueId, projectId);
                    return new EntityNotFoundException("Issue", issueId);
                });
    }

    public Issue getIssueById(long issueId) {
        log.debug("Fetching issue by ID: {}", issueId);
        return issueRepository.findById(issueId)
                .orElseThrow(() -> {
                    log.warn("Issue not found: {}", issueId);
                    return new EntityNotFoundException("Issue", issueId);
                });
    }

    public List<Issue> getIssuesByStatus(Status status) {
        log.debug("Fetching issues by status: {}", status.getName());
        return issueRepository.findAllByStatus(status);
    }

    public Issue getIssueWithSprintId(long projectId, long sprintId, long issueId) {
        log.debug("Fetching issue by ID: {} with sprint ID: {} and project ID: {}", issueId, sprintId, projectId);
        return issueRepository.findIssueByIdAndProject_IdAndSprint_Id(issueId, projectId, sprintId)
                .orElseThrow(() -> {
                    log.warn("Issue not found: {} with sprint ID: {} in project: {}", issueId, sprintId, projectId);
                    return new EntityNotFoundException("Issue", issueId);
                });
    }

    public Sprint getSprint(long projectId, long sprintId) {
        log.debug("Fetching sprint by ID: {} for project ID: {}", sprintId, projectId);
        return sprintRepository.findSprintByIdAndProject_Id(sprintId, projectId)
                .orElseThrow(() -> {
                    log.warn("Sprint not found: {} in project: {}", sprintId, projectId);
                    return new EntityNotFoundException("Sprint", sprintId);
                });
    }

    public Status getStatusByStatusName(long projectId, String statusName) {
        log.debug("Fetching status by name: '{}' for project ID: {}", statusName, projectId);
        return statusRepository.findStatusByNameAndProject_Id(statusName, projectId)
                .orElseThrow(() -> {
                    log.warn("Status not found: '{}' in project: {}", statusName, projectId);
                    return new EntityNotFoundException("Status", statusName);
                });
    }

    public Effort getEffortWithIssue_Id(long effortId, long issueId) {
        log.debug("Fetching effort by ID: {} with issue ID: {}", effortId, issueId);
        return effortRepository.findEffortByIdAndIssue_Id(effortId, issueId)
                .orElseThrow(() -> {
                    log.warn("Effort not found: {} with issue ID: {}", effortId, issueId);
                    return new EntityNotFoundException("Effort", effortId);
                });
    }

    public List<User> getUsers(List<String> usernames) {
        log.debug("Fetching users by usernames: {}", usernames);
        List<User> users = new ArrayList<>();
        for (String username : usernames) {
            users.add(getUser(username));
        }
        return users;
    }

    public List<User> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll();
    }

    public boolean isUserInProject(User user, Long projectId) {
        if (user == null) {
            log.debug("User is null in isUserInProject check");
            return false;
        }
        boolean inProject = (user.getMemberProject() != null && user.getMemberProject().getId().equals(projectId)) ||
                (user.getLeadingProject() != null && user.getLeadingProject().getId().equals(projectId)) ||
                (user.getManagedProjects() != null && user.getManagedProjects().stream()
                        .anyMatch(p -> p.getId().equals(projectId)));

        log.debug("User '{}' is in project {}: {}", user.getUsername(), projectId, inProject);
        return inProject;
    }

    public User getAuthorizedUser(Authentication authentication, long projectId, List<UserRole> allowedRoles) {
        return getAuthorizedUser(authentication.getName(), projectId, allowedRoles);
    }

    public User getAuthorizedUser(String username, long projectId, List<UserRole> allowedRoles) {
        log.debug("Authorizing user '{}' for project ID {} with roles {}", username, projectId, allowedRoles);
        User user = getUser(username);

        boolean isAdmin = allowedRoles.contains(UserRole.ADMIN) && user.getRole().equals(UserRole.ADMIN);
        boolean isProjectManager = allowedRoles.contains(UserRole.PROJECT_MANAGER) &&
                user.getRole().equals(UserRole.PROJECT_MANAGER) &&
                user.getManagedProjects().stream().anyMatch(p -> p.getId().equals(projectId));
        boolean isTeamLead = allowedRoles.contains(UserRole.TEAM_LEAD) &&
                user.getRole().equals(UserRole.TEAM_LEAD) &&
                user.getLeadingProject() != null &&
                user.getLeadingProject().getId().equals(projectId);
        boolean isTeamMember = allowedRoles.contains(UserRole.TEAM_MEMBER) &&
                user.getRole().equals(UserRole.TEAM_MEMBER) &&
                user.getMemberProject() != null &&
                user.getMemberProject().getId().equals(projectId);

        if (!(isAdmin || isProjectManager || isTeamLead || isTeamMember)) {
            log.warn("Unauthorized access attempt by user '{}' for project ID {} with roles {}", username, projectId, allowedRoles);
            throw new UnauthorizedUserException(username, "generic");
        }

        log.debug("User '{}' authorized successfully for project ID {}", username, projectId);
        return user;
    }

    public void authorizeUser(Authentication auth, long projectId, List<UserRole> roles) {
        getAuthorizedUser(auth, projectId, roles);
    }

    public void authorizeUser(String username, long projectId, List<UserRole> roles) {
        getAuthorizedUser(username, projectId, roles);
    }

    public void checkDates(LocalDateTime start, LocalDateTime end) {
        log.debug("Checking dates. Start: {}, End: {}", start, end);
        if (start == null || end == null || start.isAfter(end)) {
            log.warn("Invalid dates detected. Start: {}, End: {}", start, end);
            throw new InvalidDataException("invalid dates");
        }
    }

}
