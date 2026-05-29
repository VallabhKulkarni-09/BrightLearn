package com.brightlearn.controller;

import com.brightlearn.dto.feedback.FeedbackResponse;
import com.brightlearn.dto.feedback.SubmitFeedbackRequest;
import com.brightlearn.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @RequestBody SubmitFeedbackRequest request,
            Authentication authentication) {
        FeedbackResponse response = feedbackService.submitFeedback(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<FeedbackResponse>> getInstructorFeedback(Authentication authentication) {
        List<FeedbackResponse> feedbackList = feedbackService.getFeedbackForInstructor(authentication.getName());
        return ResponseEntity.ok(feedbackList);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        List<FeedbackResponse> feedbackList = feedbackService.getAllFeedbackForAdmin();
        return ResponseEntity.ok(feedbackList);
    }
}
