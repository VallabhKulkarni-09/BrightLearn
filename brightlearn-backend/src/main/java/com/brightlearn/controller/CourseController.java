package com.brightlearn.controller;

import com.brightlearn.dto.course.CourseResponse;
import com.brightlearn.dto.course.CreateCourseRequest;
import com.brightlearn.service.CourseService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Fix: was implemented in service but never wired — now accessible
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseResponse> createCourse(
            @RequestBody CreateCourseRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                courseService.createCourse(request, authentication.getName())
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @RequestBody CreateCourseRequest request,
            Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(
                courseService.updateCourse(id, request, authentication.getName(), isAdmin)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<String> deleteCourse(
            @PathVariable Long id,
            Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        courseService.deleteCourse(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok("Course deleted successfully");
    }
}
