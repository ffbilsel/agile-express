package com.ffb.be.model.dto.request.issue;

import com.ffb.be.model.enums.IssueType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueCreatePayload {

    private long projectId;
    private Long sprintId;
    private String title;
    private String description;
    private String status;
    private int storyPoints;
    private double estimatedEffort;
    private IssueType issueType;
    private String assignee;

}