package com.brightlearn.controller;

import com.brightlearn.dto.course.ReviewResponse;
import com.brightlearn.service.ReviewService;
import com.brightlearn.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewService reviewService, ReviewRepository reviewRepository) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }

    @PostMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> review(
            @PathVariable Long courseId,
            @RequestParam int rating,
            @RequestParam String comment,
            Authentication authentication) {

        reviewService.submitReview(
                courseId,
                authentication.getName(),
                rating,
                comment
        );

        return ResponseEntity.ok("Review submitted");
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ReviewResponse>> courseReviews(@PathVariable Long courseId) {
        return ResponseEntity.ok(reviewRepository.findByCourseId(courseId)
                .stream()
                .map(ReviewResponse::from)
                .toList());
    }
}
