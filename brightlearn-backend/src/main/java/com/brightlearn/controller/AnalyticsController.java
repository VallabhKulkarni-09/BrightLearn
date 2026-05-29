package com.brightlearn.controller;

import com.brightlearn.dto.analytics.AnalyticsResponse;
import com.brightlearn.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AnalyticsResponse> getStudentAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(authentication.getName()));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<AnalyticsResponse> getInstructorAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getInstructorAnalytics(authentication.getName()));
    }
}
