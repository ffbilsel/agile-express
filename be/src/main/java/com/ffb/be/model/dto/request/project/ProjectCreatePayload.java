package com.ffb.be.model.dto.request.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectCreatePayload {

    private String name;

    private String manager;
    private String teamLead;
    private List<String> teamMembers;

    private List<String> statuses;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
