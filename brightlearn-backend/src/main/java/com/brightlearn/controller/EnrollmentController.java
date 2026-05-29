package com.brightlearn.controller;

import com.brightlearn.dto.admin.UserResponse;
import com.brightlearn.dto.course.EnrolledCourseResponse;
import com.brightlearn.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<String> enroll(
            @PathVariable Long courseId,
            Authentication authentication) {

        enrollmentService.enrollStudent(courseId, authentication.getName());
        return ResponseEntity.ok("Enrolled successfully");
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<EnrolledCourseResponse>> myCourses(Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.getMyCoursesAsResponses(authentication.getName()));
    }

    @GetMapping("/courses/{courseId}/students")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<UserResponse>> getEnrolledStudents(
            @PathVariable Long courseId,
            Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.getEnrolledStudents(
                courseId, 
                authentication.getName(), 
                authentication.getAuthorities()
        ));
    }

    @PostMapping("/courses/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> enrollStudentByAdmin(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication authentication) {
        enrollmentService.enrollStudentByAdmin(courseId, studentId, authentication.getName());
        return ResponseEntity.ok("Student enrolled successfully");
    }

    @DeleteMapping("/courses/{courseId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<String> removeStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication authentication) {
        enrollmentService.removeStudentByAuthorizedUser(
                courseId, 
                studentId, 
                authentication.getName(), 
                authentication.getAuthorities()
        );
        return ResponseEntity.ok("Student removed successfully");
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<String> unenrollSelf(
            @PathVariable Long courseId,
            Authentication authentication) {
        enrollmentService.unenrollSelf(courseId, authentication.getName());
        return ResponseEntity.ok("Unenrolled successfully");
    }
}
