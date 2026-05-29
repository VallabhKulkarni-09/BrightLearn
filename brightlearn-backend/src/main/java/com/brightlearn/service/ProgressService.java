package com.brightlearn.service;

import com.brightlearn.dto.course.LessonProgressRequest;
import com.brightlearn.dto.course.LessonProgressResponse;
import com.brightlearn.entity.Enrollment;
import com.brightlearn.entity.Lesson;
import com.brightlearn.entity.LessonProgress;
import com.brightlearn.repository.EnrollmentRepository;
import com.brightlearn.repository.LessonProgressRepository;
import com.brightlearn.repository.LessonRepository;
import com.brightlearn.repository.QuizRepository;
import com.brightlearn.dto.course.QuizDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.brightlearn.entity.Certificate;
import com.brightlearn.repository.CertificateRepository;
import java.util.UUID;

import java.time.Instant;
import java.util.List;

@Service
public class ProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final CertificateRepository certificateRepository;

    public ProgressService(
            LessonProgressRepository lessonProgressRepository,
            EnrollmentRepository enrollmentRepository,
            LessonRepository lessonRepository,
            QuizRepository quizRepository,
            CertificateRepository certificateRepository) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.certificateRepository = certificateRepository;
    }

    @Transactional
    public void updateProgress(Long enrollmentId, Long lessonId, LessonProgressRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new com.brightlearn.exception.ResourceNotFoundException("Enrollment not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new com.brightlearn.exception.ResourceNotFoundException("Lesson not found"));

        LessonProgress progress = lessonProgressRepository
                .findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
                .orElse(new LessonProgress(enrollment, lesson));

        progress.setCompleted(request.isCompleted());
        progress.setCompletedAt(request.isCompleted() ? Instant.now() : null);

        lessonProgressRepository.save(progress);

        // Check if all lessons are completed
        List<Lesson> allLessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(enrollment.getCourse().getId());
        List<LessonProgress> allProgress = lessonProgressRepository.findByEnrollmentId(enrollmentId);

        long completedCount = allProgress.stream().filter(LessonProgress::isCompleted).count();

        if (completedCount == allLessons.size() && allLessons.size() > 0) {
            enrollment.setStatus("COMPLETED");
            enrollmentRepository.save(enrollment);
            
            // Check if certificate already exists
            if (certificateRepository.findByEnrollmentId(enrollmentId).isEmpty()) {
                String certCode = "BL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Certificate certificate = new Certificate(certCode, enrollment);
                certificateRepository.save(certificate);
            }
        } else {
            enrollment.setStatus("ACTIVE");
            enrollmentRepository.save(enrollment);
        }
    }

    public List<LessonProgressResponse> getCourseProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new com.brightlearn.exception.ResourceNotFoundException("Enrollment not found"));
        List<Lesson> allLessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(enrollment.getCourse().getId());
        List<LessonProgress> allProgress = lessonProgressRepository.findByEnrollmentId(enrollmentId);

        return allLessons.stream().map(lesson -> {
            LessonProgressResponse res = new LessonProgressResponse();
            res.setLessonId(lesson.getId());
            res.setTitle(lesson.getTitle());
            res.setContent(lesson.getContent());

            boolean completed = allProgress.stream()
                    .filter(p -> p.getLesson().getId().equals(lesson.getId()))
                    .map(LessonProgress::isCompleted)
                    .findFirst()
                    .orElse(false);

            res.setCompleted(completed);

            List<com.brightlearn.entity.Quiz> quizzes = quizRepository.findByLessonIdOrderByIdAsc(lesson.getId());
            if (quizzes != null && !quizzes.isEmpty()) {
                List<QuizDto> quizDtos = quizzes.stream().map(q -> {
                    QuizDto qDto = new QuizDto();
                    qDto.setId(q.getId());
                    qDto.setQuestion(q.getQuestion());
                    qDto.setOptions(q.getOptions());
                    
                    if (completed) {
                        qDto.setCorrectAnswerIndex(q.getCorrectAnswerIndex());
                    } else {
                        qDto.setCorrectAnswerIndex(-1);
                    }
                    
                    return qDto;
                }).toList();
                res.setQuizzes(quizDtos);
            }

            return res;
        }).toList();
    }
}
