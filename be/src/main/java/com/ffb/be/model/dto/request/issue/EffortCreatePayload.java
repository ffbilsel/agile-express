package com.ffb.be.model.dto.request.issue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EffortCreatePayload {

    private long projectId;
    private long issueId;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}
