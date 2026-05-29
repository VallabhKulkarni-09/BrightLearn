package com.brightlearn.repository;

import com.brightlearn.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseIdOrderBySortOrderAsc(Long courseId);
}
