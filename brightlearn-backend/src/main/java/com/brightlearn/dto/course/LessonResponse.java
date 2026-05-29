package com.brightlearn.dto.course;

import com.brightlearn.entity.Lesson;
import com.brightlearn.entity.Quiz;
import java.util.List;

public class LessonResponse {
    private Long id;
    private String title;
    private String content;
    private int sortOrder;
    private List<QuizDto> quizzes;

    public static LessonResponse from(Lesson lesson) {
        LessonResponse res = new LessonResponse();
        res.id = lesson.getId();
        res.title = lesson.getTitle();
        res.content = lesson.getContent();
        res.sortOrder = lesson.getSortOrder();
        return res;
    }

    public static LessonResponse from(Lesson lesson, List<Quiz> quizzes) {
        LessonResponse res = from(lesson);
        if (quizzes != null) {
            res.quizzes = quizzes.stream().map(q -> {
                QuizDto dto = new QuizDto();
                dto.setId(q.getId());
                dto.setQuestion(q.getQuestion());
                dto.setOptions(q.getOptions());
                dto.setCorrectAnswerIndex(q.getCorrectAnswerIndex());
                return dto;
            }).toList();
        }
        return res;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public int getSortOrder() { return sortOrder; }
    public List<QuizDto> getQuizzes() { return quizzes; }
    public void setQuizzes(List<QuizDto> quizzes) { this.quizzes = quizzes; }
}
