package com.brightlearn.controller;

import com.brightlearn.dto.course.LessonProgressRequest;
import com.brightlearn.dto.course.LessonProgressResponse;
import com.brightlearn.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/enrollments/{enrollmentId}/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long enrollmentId,
            @PathVariable Long lessonId,
            @RequestBody LessonProgressRequest request) {
        progressService.updateProgress(enrollmentId, lessonId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<LessonProgressResponse>> getProgress(@PathVariable Long enrollmentId) {
        return ResponseEntity.ok(progressService.getCourseProgress(enrollmentId));
    }
}
