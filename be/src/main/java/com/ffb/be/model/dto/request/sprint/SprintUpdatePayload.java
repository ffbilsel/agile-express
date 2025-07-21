package com.ffb.be.model.dto.request.sprint;

import com.ffb.be.model.enums.SprintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SprintUpdatePayload {

    private long projectId;
    private long sprintId;
    private SprintStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
