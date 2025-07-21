package com.ffb.be.controller;

import com.ffb.be.model.dto.response.DashboardResponse;
import com.ffb.be.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardInfo(Authentication authentication) {
        DashboardResponse dashboardResponse = dashboardService.getDashboardInfo(authentication);
        return ResponseEntity.ok(dashboardResponse);
    }

}