package com.ffb.be.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardResponse {

    private List<ProjectResponse> projects;
    private int activeSprintCount;
    private int openIssueCount;
    private int closedIssueCount;

}