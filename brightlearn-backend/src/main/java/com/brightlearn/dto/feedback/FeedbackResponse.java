package com.brightlearn.dto.feedback;

import com.brightlearn.entity.Feedback;
import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long id;
    private String studentUsername;
    private String type;
    private Long courseId;
    private String courseTitle;
    private String content;
    private int rating;
    private LocalDateTime createdAt;

    public FeedbackResponse() {}

    public FeedbackResponse(Long id, String studentUsername, String type, Long courseId, String courseTitle, String content, int rating, LocalDateTime createdAt) {
        this.id = id;
        this.studentUsername = studentUsername;
        this.type = type;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.content = content;
        this.rating = rating;
        this.createdAt = createdAt;
    }

    public static FeedbackResponse from(Feedback feedback) {
        Long courseId = null;
        String courseTitle = null;
        if (feedback.getCourse() != null) {
            courseId = feedback.getCourse().getId();
            courseTitle = feedback.getCourse().getTitle();
        }
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getStudent().getUsername(),
                feedback.getType().name(),
                courseId,
                courseTitle,
                feedback.getContent(),
                feedback.getRating(),
                feedback.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentUsername() {
        return studentUsername;
    }

    public void setStudentUsername(String studentUsername) {
        this.studentUsername = studentUsername;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
