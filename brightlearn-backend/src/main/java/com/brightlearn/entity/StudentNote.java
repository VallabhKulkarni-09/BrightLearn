package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "student_notes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
)
public class StudentNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant updatedAt;

    public StudentNote() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
