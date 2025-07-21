package com.ffb.be.controller;

import com.ffb.be.model.dto.request.user.RoleUpdatePayload;
import com.ffb.be.model.dto.response.SimpleUser;
import com.ffb.be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/set-role")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public String setRole(@RequestBody RoleUpdatePayload payload, Authentication authentication) {
        return userService.setRole(payload, authentication);
    }

    @GetMapping
    public ResponseEntity<List<SimpleUser>> getUsers(@RequestParam(required = false) Long projectId, @RequestParam(required = false) Boolean getAll, Authentication authentication) {
        return ResponseEntity.ok(userService.getUsers(projectId, getAll, authentication));
    }

}

