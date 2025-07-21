package com.ffb.be.controller;

import com.ffb.be.model.dto.request.sprint.SprintGetPayload;
import com.ffb.be.model.dto.request.sprint.SprintCreatePayload;
import com.ffb.be.model.dto.request.sprint.SprintUpdatePayload;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.dto.response.OverdueSprint;
import com.ffb.be.model.dto.response.SprintResponse;
import com.ffb.be.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sprint")
public class SprintController {

    private final SprintService sprintService;

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @PostMapping("/create")
    public ResponseEntity<SprintResponse> createSprint(@RequestBody SprintCreatePayload payload, Authentication auth) {
        return ResponseEntity.ok(sprintService.createSprint(payload, auth));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @PutMapping("/update")
    public ResponseEntity<SprintResponse> updateSprint(@RequestBody SprintUpdatePayload payload, Authentication auth) {
        return ResponseEntity.ok(sprintService.updateSprint(payload, auth));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @DeleteMapping
    public ResponseEntity<Void> deleteSprint(@RequestParam long projectId, @RequestParam long sprintId, Authentication auth) {
        sprintService.deleteSprint(new SprintGetPayload(projectId, sprintId), auth);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/view")
    public ResponseEntity<SprintResponse> viewSprint(@RequestParam long projectId, @RequestParam(required = false) Long sprintId,
                                                     @RequestParam(defaultValue = "") String sprintName, Authentication authentication) {
        return ResponseEntity.ok(sprintService.viewSprint(projectId, sprintId, sprintName, authentication));
    }

    @GetMapping("/view-all")
    public ResponseEntity<List<SprintResponse>> viewAllSprints(@RequestParam long projectId, Authentication authentication) {
        return ResponseEntity.ok(sprintService.viewAllSprints(projectId, authentication));
    }

    @GetMapping("/issue/view-all")
    public ResponseEntity<List<IssueResponse>> viewSprintIssues(
            @RequestParam long projectId,
            @RequestParam(required = false) Long sprintId,
            @RequestParam(defaultValue = "") String sprintName,
            Authentication authentication) {
        return ResponseEntity.ok(
                sprintService.viewSprintIssues(projectId, sprintId, sprintName, authentication));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    @GetMapping("/check-status")
    public ResponseEntity<List<OverdueSprint>> checkSprintStatus(Authentication authentication) {
        return ResponseEntity.ok(sprintService.checkStatus(authentication));
    }

}