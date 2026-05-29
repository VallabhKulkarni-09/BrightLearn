package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
    name = "lesson_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"enrollment_id", "lesson_id"})
)
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false)
    private boolean completed = false;

    private Instant completedAt;

    public LessonProgress() {}

    public LessonProgress(Enrollment enrollment, Lesson lesson) {
        this.enrollment = enrollment;
        this.lesson = lesson;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Enrollment getEnrollment() { return enrollment; }
    public void setEnrollment(Enrollment enrollment) { this.enrollment = enrollment; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LessonProgress that = (LessonProgress) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
