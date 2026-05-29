package com.brightlearn.dto.feedback;

public class SubmitFeedbackRequest {
    private String type; // COURSE or PLATFORM
    private Long courseId; // null if platform feedback
    private String content;
    private int rating; // 1-5 for courses, 0 or optional for platform

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
}
