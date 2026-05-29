package com.brightlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String options; // Stored as JSON array string

    @Column(nullable = false)
    private int correctAnswerIndex;

    public Quiz() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }

    public int getCorrectAnswerIndex() { return correctAnswerIndex; }
    public void setCorrectAnswerIndex(int correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }
}
