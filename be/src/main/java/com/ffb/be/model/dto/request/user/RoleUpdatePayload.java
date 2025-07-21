package com.ffb.be.model.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleUpdatePayload {

    private String username;
    private String newRole;
    private Long projectId;

}