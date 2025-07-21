package com.ffb.be.model.dto.request.sprint;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SprintCreatePayload {

    private long projectId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
