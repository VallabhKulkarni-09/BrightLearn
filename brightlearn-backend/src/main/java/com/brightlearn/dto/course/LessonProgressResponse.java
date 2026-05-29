package com.brightlearn.dto.course;

import java.util.ArrayList;
import java.util.List;

public class LessonProgressResponse {
    private Long lessonId;
    private String title;
    private String content;
    private boolean completed;
    private List<QuizDto> quizzes = new ArrayList<>();

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public List<QuizDto> getQuizzes() { return quizzes; }
    public void setQuizzes(List<QuizDto> quizzes) { this.quizzes = quizzes; }
}
