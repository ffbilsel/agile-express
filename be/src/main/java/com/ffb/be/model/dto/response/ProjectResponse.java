package com.ffb.be.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponse {

    private long id;
    private String name;
    private String description;
    private List<String> statuses;
    private String managerUsername;
    private String teamLeadUsername;
    private List<String> teamMemberUsernames;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<Long> sprintIds;
    private long backlogId;

}