package com.ffb.be.controller;

import com.ffb.be.model.dto.request.auth.LdapLoginPayload;
import com.ffb.be.model.dto.response.JwtResponse;
import com.ffb.be.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authService;

    @PostMapping("/ldap-login")
    public ResponseEntity<JwtResponse> ldapLogin(@RequestBody LdapLoginPayload request) {
        JwtResponse response = authService.authenticateWithLdap(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(@RequestParam String refreshToken) {
        JwtResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

}