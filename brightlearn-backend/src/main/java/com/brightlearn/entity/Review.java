package com.brightlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "reviews",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"})
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    private int rating;
    private String comment;

    public Review() {}

    public Review(User student, Course course, int rating, String comment) {
        this.student = student;
        this.course = course;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public Course getCourse() { return course; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
}
