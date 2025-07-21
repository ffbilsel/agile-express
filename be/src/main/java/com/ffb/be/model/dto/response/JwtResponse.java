package com.ffb.be.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String username;
    private String role;

}