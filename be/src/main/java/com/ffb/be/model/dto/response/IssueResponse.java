package com.ffb.be.model.dto.response;

import com.ffb.be.model.enums.IssueType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class IssueResponse {

    private long projectId;
    private long sprintId;
    private long id;
    private String title;
    private String description;
    private String status;
    private int storyPoints;
    private double estimatedEffort;
    private IssueType issueType;
    private String assignee;
    private String assigner;
    private List<EffortResponse> efforts;
    private LocalDateTime issuedAt;
    private LocalDateTime closedAt;

}