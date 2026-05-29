package com.brightlearn.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
public class StudentController {

    @GetMapping("/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public String viewEnrolledCourses() {
        return "Student: Viewing enrolled courses";
    }

    @PostMapping("/review")
    @PreAuthorize("hasRole('STUDENT')")
    public String submitReview() {
        return "Student: Review submitted";
    }
}
