package com.ffb.be.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OverdueSprint {

    private long projectId;
    private long sprintId;
    private long overdue;

}