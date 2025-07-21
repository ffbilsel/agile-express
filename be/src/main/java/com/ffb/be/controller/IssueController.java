package com.ffb.be.controller;

import com.ffb.be.model.dto.request.issue.*;
import com.ffb.be.model.dto.response.EffortResponse;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/issue")
public class IssueController {

    private final IssueService issueService;

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @PostMapping("/create")
    public ResponseEntity<IssueResponse> createIssue(@RequestBody IssueCreatePayload payload, Authentication auth) {
        IssueResponse response = issueService.createIssue(payload, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @PutMapping("/update")
    public ResponseEntity<IssueResponse> updateIssue(@RequestBody IssueUpdatePayload payload, Authentication auth) {
        IssueResponse response = issueService.updateIssue(payload, auth);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TEAM_LEAD')")
    @DeleteMapping
    public ResponseEntity<Void> deleteIssue(@RequestParam long issueId, Authentication auth) {
        issueService.deleteIssue(issueId, auth);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/view")
    public ResponseEntity<IssueResponse> viewIssue(@RequestParam long projectId, @RequestParam long issueId, Authentication auth) {
        return ResponseEntity.ok(issueService.viewIssue(projectId, issueId, auth));
    }

    @PostMapping("/effort/create")
    public ResponseEntity<IssueResponse> createEffort(@RequestBody EffortCreatePayload payload, Authentication auth) {
        IssueResponse response = issueService.createEffort(payload, auth);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/effort/update")
    public ResponseEntity<EffortResponse> updateEffort(@RequestBody EffortUpdatePayload payload, Authentication auth) {
        EffortResponse response = issueService.updateEffort(payload, auth);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/effort")
    public ResponseEntity<Void> deleteEffort(@RequestParam long projectId, @RequestParam long issueId, @RequestParam long effortId, Authentication auth) {
        issueService.deleteEffort(projectId, issueId, effortId, auth);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/effort/view")
    public ResponseEntity<EffortResponse> viewEffort(@RequestParam long projectId, @RequestParam long issueId, @RequestParam long effortId, Authentication auth) {
        return ResponseEntity.ok(issueService.viewEffort(projectId, issueId, effortId, auth));
    }

}