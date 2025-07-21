package com.ffb.be.model.dto.request.issue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EffortUpdatePayload {

    private long projectId;
    private long issueId;
    private long effortId;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}