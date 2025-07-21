package com.ffb.be.model.dto.request.issue;

import com.ffb.be.model.enums.IssueType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueUpdatePayload {

    private long projectId;
    private long issueId;
    private Long newSprintId;
    private String title;
    private String description;
    private String status;
    private Integer storyPoints;
    private Double estimatedEffort;
    private IssueType issueType;
    private String assignee;

}