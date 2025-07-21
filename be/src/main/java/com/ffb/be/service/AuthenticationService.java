package com.ffb.be.service;

import com.ffb.be.model.dto.response.JwtResponse;
import com.ffb.be.security.jwt.JwtUtils;
import com.ffb.be.service.helper.LdapService;
import lombok.RequiredArgsConstructor;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final LdapTemplate ldapTemplate;
    private final LdapService ldapService;
    private final JwtUtils jwtUtils;

    @Transactional
    public JwtResponse authenticateWithLdap(String username, String password) {
        // Authenticate with LDAP
        if (!authenticateLdap(username, password)) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String ldapRole = ldapService.getRoleForUsername(username);
        if (ldapRole == null) {
            ldapRole = "ROLE_TEAM_MEMBER";
        }

        // Generate tokens
        String accessToken = jwtUtils.generateJwtToken(username, List.of(ldapRole));
        String refreshToken = jwtUtils.generateRefreshToken(username);

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .username(username)
                .role(ldapRole)
                .build();
    }

    private boolean authenticateLdap(String username, String password) {
        String baseDn = "ou=users";
        String filter = "(cn=" + username + ")";
        return ldapTemplate.authenticate(baseDn, filter, password);
    }

    public JwtResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateJwtToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String username = jwtUtils.getUsernameFromJwtToken(refreshToken);
        String role = ldapService.getRoleForUsername(username);

        String newAccessToken = jwtUtils.generateJwtToken(username, List.of(role));

        return JwtResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .username(username)
                .role(role)
                .build();
    }
}