package com.brightlearn.repository;

import com.brightlearn.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByEnrollmentId(Long enrollmentId);
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByLessonId(Long lessonId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByEnrollmentId(Long enrollmentId);
}
