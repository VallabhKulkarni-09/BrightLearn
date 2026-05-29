package com.brightlearn.service;

import com.brightlearn.dto.course.LessonRequest;
import com.brightlearn.dto.course.LessonResponse;
import com.brightlearn.entity.Course;
import com.brightlearn.entity.Lesson;
import com.brightlearn.repository.CourseRepository;
import com.brightlearn.repository.LessonRepository;
import com.brightlearn.repository.LessonProgressRepository;
import com.brightlearn.repository.QuizRepository;
import com.brightlearn.repository.StudentNoteRepository;
import com.brightlearn.repository.DiscussionCommentRepository;
import com.brightlearn.entity.Quiz;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizRepository quizRepository;
    private final StudentNoteRepository studentNoteRepository;
    private final DiscussionCommentRepository discussionCommentRepository;

    public LessonService(
            LessonRepository lessonRepository,
            CourseRepository courseRepository,
            LessonProgressRepository lessonProgressRepository,
            QuizRepository quizRepository,
            StudentNoteRepository studentNoteRepository,
            DiscussionCommentRepository discussionCommentRepository) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.quizRepository = quizRepository;
        this.studentNoteRepository = studentNoteRepository;
        this.discussionCommentRepository = discussionCommentRepository;
    }

    @Transactional
    public LessonResponse addLesson(Long courseId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setSortOrder(request.getSortOrder());

        lesson = lessonRepository.save(lesson);

        List<Quiz> savedQuizzes = null;
        if (request.getQuizzes() != null) {
            savedQuizzes = new java.util.ArrayList<>();
            for (com.brightlearn.dto.course.QuizRequest qReq : request.getQuizzes()) {
                Quiz quiz = new Quiz();
                quiz.setLesson(lesson);
                quiz.setQuestion(qReq.getQuestion());
                quiz.setOptions(qReq.getOptions());
                quiz.setCorrectAnswerIndex(qReq.getCorrectAnswerIndex());
                savedQuizzes.add(quizRepository.save(quiz));
            }
        }

        return LessonResponse.from(lesson, savedQuizzes);
    }

    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
            
        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setSortOrder(request.getSortOrder());
        
        lesson = lessonRepository.save(lesson);

        // Prune existing quizzes
        List<Quiz> oldQuizzes = quizRepository.findByLessonIdOrderByIdAsc(lesson.getId());

        for (Quiz oldQuiz : oldQuizzes) {
            quizRepository.delete(oldQuiz);
        }
        quizRepository.flush();

        List<Quiz> savedQuizzes = null;
        if (request.getQuizzes() != null) {
            savedQuizzes = new java.util.ArrayList<>();
            for (com.brightlearn.dto.course.QuizRequest qReq : request.getQuizzes()) {
                Quiz quiz = new Quiz();
                quiz.setLesson(lesson);
                quiz.setQuestion(qReq.getQuestion());
                quiz.setOptions(qReq.getOptions());
                quiz.setCorrectAnswerIndex(qReq.getCorrectAnswerIndex());
                savedQuizzes.add(quizRepository.save(quiz));
            }
        }

        return LessonResponse.from(lesson, savedQuizzes);
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId)
                .stream()
                .map(l -> LessonResponse.from(l, quizRepository.findByLessonIdOrderByIdAsc(l.getId())))
                .toList();
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        // Delete all student notes first
        studentNoteRepository.deleteByLessonId(lessonId);

        // Delete all discussion comments
        discussionCommentRepository.deleteByLessonId(lessonId);

        // Delete associated quizzes first
        List<Quiz> quizzes = quizRepository.findByLessonIdOrderByIdAsc(lessonId);

        for (Quiz quiz : quizzes) {
            quizRepository.delete(quiz);
        }
        quizRepository.flush();
        
        // First delete all progress records referencing this lesson
        lessonProgressRepository.deleteByLessonId(lessonId);

        // Then delete the lesson itself
        lessonRepository.deleteById(lessonId);
    }
}
