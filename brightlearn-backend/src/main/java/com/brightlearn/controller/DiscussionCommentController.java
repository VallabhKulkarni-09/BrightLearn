package com.brightlearn.controller;

import com.brightlearn.dto.discussion.DiscussionCommentResponse;
import com.brightlearn.dto.discussion.CreateCommentRequest;
import com.brightlearn.service.DiscussionCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lessons")
public class DiscussionCommentController {

    private final DiscussionCommentService commentService;

    public DiscussionCommentController(DiscussionCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{lessonId}/comments")
    public ResponseEntity<List<DiscussionCommentResponse>> getComments(
            @PathVariable Long lessonId,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.getCommentsByLesson(lessonId, authentication.getName()));
    }

    @PostMapping("/{lessonId}/comments")
    public ResponseEntity<DiscussionCommentResponse> createComment(
            @PathVariable Long lessonId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.createComment(lessonId, request, authentication.getName()));
    }

    @PostMapping("/comments/{commentId}/upvote")
    public ResponseEntity<DiscussionCommentResponse> upvoteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.upvoteComment(commentId, authentication.getName()));
    }
}
