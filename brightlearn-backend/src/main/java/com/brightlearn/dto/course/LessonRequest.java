package com.brightlearn.dto.course;

import java.util.List;

public class LessonRequest {
    private String title;
    private String content;
    private int sortOrder;
    private List<QuizRequest> quizzes;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public List<QuizRequest> getQuizzes() { return quizzes; }
    public void setQuizzes(List<QuizRequest> quizzes) { this.quizzes = quizzes; }
}
