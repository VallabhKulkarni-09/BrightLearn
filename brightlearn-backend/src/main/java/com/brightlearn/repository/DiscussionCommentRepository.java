package com.brightlearn.repository;

import com.brightlearn.entity.DiscussionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscussionCommentRepository extends JpaRepository<DiscussionComment, Long> {
    List<DiscussionComment> findByLessonIdOrderByCreatedAtAsc(Long lessonId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM DiscussionComment d WHERE d.lesson.id = :lessonId AND d.parent IS NOT NULL")
    void deleteRepliesByLessonId(@org.springframework.data.repository.query.Param("lessonId") Long lessonId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM DiscussionComment d WHERE d.lesson.id = :lessonId AND d.parent IS NULL")
    void deleteRootsByLessonId(@org.springframework.data.repository.query.Param("lessonId") Long lessonId);

    @org.springframework.transaction.annotation.Transactional
    default void deleteByLessonId(Long lessonId) {
        deleteRepliesByLessonId(lessonId);
        deleteRootsByLessonId(lessonId);
    }
}
