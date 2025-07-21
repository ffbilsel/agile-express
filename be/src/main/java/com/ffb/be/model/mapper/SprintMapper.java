package com.ffb.be.model.mapper;

import com.ffb.be.model.dto.response.OverdueSprint;
import com.ffb.be.model.dto.response.SprintResponse;
import com.ffb.be.model.entity.Sprint;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;

public class SprintMapper {

    public static SprintResponse toDto(Sprint sprint) {
        if (sprint == null) {
            return null;
        }

        long id = sprint.getId() != null ? sprint.getId() : -1L;
        String status = sprint.getSprintStatus() != null ? sprint.getSprintStatus().name() : null;
        long projectId = (sprint.getProject() != null && sprint.getProject().getId() != null)
                ? sprint.getProject().getId() : -1L;
        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();

        return SprintResponse.builder()
                .id(id)
                .status(status)
                .issues(sprint.getIssues() != null
                        ? sprint.getIssues().stream().map(IssueMapper::toDto).toList()
                        : Collections.emptyList())
                .projectId(projectId)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public static OverdueSprint toOverdueSprintDto(Sprint sprint) {
        if (sprint == null || sprint.getProject() == null || sprint.getProject().getId() == null || sprint.getEndDate() == null) {
            return null;
        }

        long hours = Duration.between(sprint.getEndDate(), LocalDateTime.now()).toDays();

        return new OverdueSprint(
                sprint.getProject().getId(),
                sprint.getId() != null ? sprint.getId() : -1L,
                hours
        );
    }

}