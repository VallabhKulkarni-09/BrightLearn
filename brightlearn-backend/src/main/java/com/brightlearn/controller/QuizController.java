package com.brightlearn.controller;

import com.brightlearn.entity.Quiz;
import com.brightlearn.repository.QuizRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quizzes")
public class QuizController {

    private final QuizRepository quizRepository;

    public QuizController(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    @PostMapping("/{quizId}/attempt")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Boolean> attemptQuiz(@PathVariable Long quizId, @RequestParam int selectedOptionIndex, Authentication auth) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();

        boolean isCorrect = quiz.getCorrectAnswerIndex() == selectedOptionIndex;

        return ResponseEntity.ok(isCorrect);
    }
}
