package com.ffb.be.model.dto.request.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectUpdatePayload {

    private long projectId;
    private String name;
    private String teamLead;
    private String manager;
    private List<String> teamMembers;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> statuses;

}
