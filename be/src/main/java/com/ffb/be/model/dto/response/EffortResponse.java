package com.ffb.be.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EffortResponse {

    private long issueId;
    private long id;
    private String description;
    private String user;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}
