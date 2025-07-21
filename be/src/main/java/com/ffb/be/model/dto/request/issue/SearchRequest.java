package com.ffb.be.model.dto.request.issue;

import com.ffb.be.model.enums.IssueType;
import lombok.Data;

@Data
public class SearchRequest {
    private String projectName;
    private String title;
    private String description;
    private IssueType issueType;
    private String statusName;
    private String userName;
}
