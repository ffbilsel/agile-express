package com.ffb.be.service;

import com.ffb.be.model.dto.request.user.RoleUpdatePayload;
import com.ffb.be.model.dto.response.SimpleUser;
import com.ffb.be.model.entity.User;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.model.exception.auth.UnallowedActionException;
import com.ffb.be.model.exception.auth.UnauthorizedUserException;
import com.ffb.be.model.exception.common.EntityNotFoundException;
import com.ffb.be.repository.jpa.UserRepository;
import com.ffb.be.service.helper.EntityAccessHelper;
import com.ffb.be.service.helper.LdapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.naming.Name;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final LdapService ldapService;
    private final EntityAccessHelper helper;
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public String setRole(RoleUpdatePayload payload, Authentication authentication) {

        String username = payload.getUsername();
        String newRole = payload.getNewRole();

        log.info("Changing role for user '{}' to '{}'", username, newRole);

        User caller = helper.getUser(authentication.getName());
        if (caller.getRole().equals(UserRole.PROJECT_MANAGER)) {
            if (payload.getProjectId() == null) {
                throw new UnauthorizedUserException(caller.getUsername(), "can not set user role outside project");
            }
            helper.authorizeUser(authentication, payload.getProjectId(), List.of(UserRole.PROJECT_MANAGER));
        }

        User user = helper.getUser(username);
        log.debug("Fetched user entity for '{}'", username);

        Name userDn = ldapService.buildUserDn(username);
        if (!ldapService.doesUserDnExist(userDn)) {
            log.warn("User DN does not exist for '{}'", username);
            throw new EntityNotFoundException("User", username);
        }

        Name adminGroupDn = ldapService.buildGroupDn("admin");

        if (ldapService.isUserInGroup(userDn, adminGroupDn)) {
            log.warn("Attempt to change role of admin '{}'", username);
            throw new UnallowedActionException("Change role of admin");
        }

        String currentLdapRole = Optional.ofNullable(ldapService.getRoleForUsername(username))
                .map(role -> role.toLowerCase().replace("role_", ""))
                .orElse(null);
        log.debug("Current LDAP role for user '{}': {}", username, currentLdapRole);

        if (newRole.equals(currentLdapRole)) {
            log.warn("User '{}' already has role '{}'", username, newRole);
            throw new UnallowedActionException("User already has role");
        }

        if (currentLdapRole != null) {
            Name currentGroupDn = ldapService.buildGroupDn(currentLdapRole);
            ldapService.removeUserFromGroup(username, currentGroupDn);
            log.debug("Removed user '{}' from group '{}'", username, currentLdapRole);
        }

        Name newGroupDn = ldapService.buildGroupDn(newRole);
        ldapService.addUserToGroup(username, newGroupDn);
        log.debug("Added user '{}' to group '{}'", username, newRole);

        projectService.removeUserFromAllProjects(user);

        user.setRole(UserRole.from(newRole));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
        log.info("Role successfully changed for user '{}' to '{}'", username, newRole);

        return "Role changed for user: " + username + " to " + newRole;
    }

    public List<SimpleUser> getUsers(Long projectId, Boolean getAll, Authentication authentication) {
        User temp = helper.getUser(authentication.getName());
        if (getAll != null && getAll) {
            if (!temp.getRole().equals(UserRole.ADMIN)) {
                throw new  UnauthorizedUserException(temp.getUsername(), "can not get all users");
            }
            List<SimpleUser> users = helper.getAllUsers().stream()
                    .filter(user -> !user.getUsername().equals("dummy"))
                    .map(user -> new SimpleUser(user.getUsername(), user.getRole()))
                    .toList();
            log.debug("Found {} users for project ID {}", users.size(), projectId);
            return users;
        }
        if (projectId != null) {
            helper.authorizeUser(authentication, projectId, List.of(UserRole.PROJECT_MANAGER, UserRole.ADMIN));
            List<SimpleUser> users = helper.getAllUsers().stream()
                    .filter(user -> !user.getUsername().equals("dummy") &&
                            ((user.getLeadingProject() != null && user.getLeadingProject().getId().equals(projectId)) ||
                                    (user.getMemberProject() != null && user.getMemberProject().getId().equals(projectId)) ||
                                    (user.getManagedProjects().stream().anyMatch(project -> project.getId().equals(projectId)))))
                    .map(user -> new SimpleUser(user.getUsername(), user.getRole()))
                    .toList();
            log.debug("Found {} users for project ID {}", users.size(), projectId);
            return users;
        }
        if (!temp.getRole().equals(UserRole.PROJECT_MANAGER) &&  !temp.getRole().equals(UserRole.ADMIN)) {
            throw new  UnauthorizedUserException(temp.getUsername(), "can not get available users");
        }
        List<SimpleUser> users = helper.getAllUsers().stream()
                .filter(user -> !user.getUsername().equals("dummy") && user.getLeadingProject() == null
                        && user.getMemberProject() == null)
                .map(user -> new SimpleUser(user.getUsername(), user.getRole()))
                .toList();
        log.debug("Found {} users with no project associations", users.size());
        return users;
    }
}
