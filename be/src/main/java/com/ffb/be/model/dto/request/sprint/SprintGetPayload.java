package com.ffb.be.model.dto.request.sprint;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SprintGetPayload {

    private long projectId;
    private long sprintId;

}
