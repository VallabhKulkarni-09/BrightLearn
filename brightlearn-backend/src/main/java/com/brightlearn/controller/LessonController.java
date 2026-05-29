package com.brightlearn.controller;

import com.brightlearn.dto.course.LessonRequest;
import com.brightlearn.dto.course.LessonResponse;
import com.brightlearn.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/courses/{courseId}/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<LessonResponse> addLesson(@PathVariable Long courseId, @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.addLesson(courseId, request));
    }

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long courseId, 
            @PathVariable Long lessonId, 
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, request));
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.ok().build();
    }
}
