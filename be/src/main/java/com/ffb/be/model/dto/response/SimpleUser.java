package com.ffb.be.model.dto.response;

import com.ffb.be.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimpleUser {

    private String username;
    private UserRole role;

}