package com.ffb.be.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SprintResponse {

    private long id;
    private long projectId;
    private String status;
    private List<IssueResponse> issues;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

}