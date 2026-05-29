package com.brightlearn.dto.course;

import com.brightlearn.entity.Review;

public class ReviewResponse {

    private Long id;
    private String studentUsername;
    private int rating;
    private String comment;

    public ReviewResponse(Long id, String studentUsername, int rating, String comment) {
        this.id = id;
        this.studentUsername = studentUsername;
        this.rating = rating;
        this.comment = comment;
    }

    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getStudent().getUsername(),
                review.getRating(),
                review.getComment()
        );
    }

    public Long getId() { return id; }
    public String getStudentUsername() { return studentUsername; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
}
