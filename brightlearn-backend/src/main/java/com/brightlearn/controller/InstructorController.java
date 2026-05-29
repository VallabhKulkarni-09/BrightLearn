package com.brightlearn.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    @PostMapping("/course")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public String createCourse() {
        return "Instructor: Course created";
    }

    @PutMapping("/course")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public String updateCourse() {
        return "Instructor: Course updated";
    }
}
