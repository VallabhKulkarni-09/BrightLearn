package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackType type;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course; // null if type is PLATFORM

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private int rating; // 1 to 5 for courses, optional for platform (default 0)

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Feedback() {}

    public Feedback(User student, FeedbackType type, Course course, String content, int rating) {
        this.student = student;
        this.type = type;
        this.course = course;
        this.content = content;
        this.rating = rating;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public FeedbackType getType() {
        return type;
    }

    public void setType(FeedbackType type) {
        this.type = type;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
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
