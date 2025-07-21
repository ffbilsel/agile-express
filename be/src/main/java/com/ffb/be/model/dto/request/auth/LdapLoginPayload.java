package com.ffb.be.model.dto.request.auth;

import lombok.Data;

@Data
public class LdapLoginPayload {
    private String username;
    private String password;
}