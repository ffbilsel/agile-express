package com.ffb.be.controller;

import com.ffb.be.model.dto.request.project.*;
import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/project")
public class ProjectController {

    private final ProjectService projectService;

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    @PostMapping("/create")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectCreatePayload projectCreatePayload) {
        return ResponseEntity.ok(projectService.createProject(projectCreatePayload));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    @PutMapping("/update")
    public ResponseEntity<ProjectResponse> updateProject(@RequestBody ProjectUpdatePayload projectUpdatePayload) {
        return ResponseEntity.ok(projectService.updateProject(projectUpdatePayload));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    @DeleteMapping
    public ResponseEntity<Void> deleteProject(@RequestParam long projectId, Authentication authentication) {
        projectService.deleteProject(projectId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/view")
    public ResponseEntity<ProjectResponse> viewProject(@RequestParam long projectId, Authentication authentication) {
        return ResponseEntity.ok(projectService.viewProject(projectId, authentication));
    }

}