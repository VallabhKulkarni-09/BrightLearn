package com.brightlearn.service;

import com.brightlearn.dto.discussion.DiscussionCommentResponse;
import com.brightlearn.dto.discussion.CreateCommentRequest;
import com.brightlearn.entity.DiscussionComment;
import com.brightlearn.entity.Lesson;
import com.brightlearn.entity.User;
import com.brightlearn.repository.DiscussionCommentRepository;
import com.brightlearn.repository.LessonRepository;
import com.brightlearn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscussionCommentService {

    private final DiscussionCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    public DiscussionCommentService(
            DiscussionCommentRepository commentRepository,
            UserRepository userRepository,
            LessonRepository lessonRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<DiscussionCommentResponse> getCommentsByLesson(Long lessonId, String username) {
        return commentRepository.findByLessonIdOrderByCreatedAtAsc(lessonId)
                .stream()
                .map(comment -> toResponse(comment, username))
                .toList();
    }

    @Transactional
    public DiscussionCommentResponse createComment(Long lessonId, CreateCommentRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        DiscussionComment comment = new DiscussionComment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setLesson(lesson);
        comment.setCreatedAt(LocalDateTime.now());

        if (request.getParentId() != null) {
            DiscussionComment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        DiscussionComment saved = commentRepository.save(comment);
        return toResponse(saved, username);
    }

    @Transactional
    public DiscussionCommentResponse upvoteComment(Long commentId, String username) {
        DiscussionComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (comment.getUpvotedUsers().contains(user)) {
            comment.getUpvotedUsers().remove(user);
        } else {
            comment.getUpvotedUsers().add(user);
        }

        DiscussionComment saved = commentRepository.save(comment);
        return toResponse(saved, username);
    }

    private DiscussionCommentResponse toResponse(DiscussionComment comment, String currentUsername) {
        String role = comment.getAuthor().getRoles().stream()
                .map(r -> r.getName())
                .findFirst()
                .orElse("STUDENT");

        boolean hasUpvoted = false;
        if (currentUsername != null) {
            hasUpvoted = comment.getUpvotedUsers().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
        }

        return new DiscussionCommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getUsername(),
                role,
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.getCreatedAt(),
                comment.getUpvotes(),
                hasUpvoted
        );
    }
}
