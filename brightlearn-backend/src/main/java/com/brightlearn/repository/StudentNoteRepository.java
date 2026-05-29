package com.brightlearn.repository;

import com.brightlearn.entity.StudentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentNoteRepository extends JpaRepository<StudentNote, Long> {
    Optional<StudentNote> findByUserIdAndLessonId(Long userId, Long lessonId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByLessonId(Long lessonId);
}
