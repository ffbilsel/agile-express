package com.ffb.be.model.mapper;

import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.model.entity.Project;
import com.ffb.be.model.entity.Sprint;
import com.ffb.be.model.entity.Status;
import com.ffb.be.model.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class ProjectMapper {

    public static ProjectResponse toDto(Project project) {
        if (project == null) {
            return null;
        }

        Long backlogId = project.getBacklog() != null ?  project.getBacklog().getId() : null;
        String managerUsername = project.getManager() != null ?   project.getManager().getUsername() : null;

        String teamLeaderUsername = project.getTeamLead() != null ?   project.getTeamLead().getUsername() : null;

        List<Long> sprintIds = project.getSprints() != null
                ? project.getSprints().stream()
                .filter(s -> s != null && s.getId() != null)
                .map(Sprint::getId)
                .toList()
                : Collections.emptyList();

        List<String> statuses = project.getStatuses() != null
                ? project.getStatuses().stream()
                .filter(Objects::nonNull)
                .map(Status::getName)
                .toList()
                : Collections.emptyList();

        List<String> teamMemberUsernames = project.getTeamMembers() != null
                ? project.getTeamMembers().stream()
                .filter(u -> u != null && u.getUsername() != null)
                .map(User::getUsername)
                .toList()
                : Collections.emptyList();

        return ProjectResponse.builder()
                .id(project.getId() != null ? project.getId() : -1L)
                .name(project.getName() != null ? project.getName() : "")
                .backlogId(backlogId != null ? backlogId : -1L)
                .managerUsername(managerUsername)
                .teamLeadUsername(teamLeaderUsername)
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .sprintIds(sprintIds)
                .statuses(statuses)
                .teamMemberUsernames(teamMemberUsernames)
                .build();
    }

}