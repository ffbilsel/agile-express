package com.ffb.be.model.dto.request.issue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueGetPayload {

    private long projectId;
    private long sprintId;
    private long issueId;

}
