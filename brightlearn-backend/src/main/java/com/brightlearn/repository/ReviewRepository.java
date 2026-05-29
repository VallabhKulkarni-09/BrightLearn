package com.brightlearn.repository;

import com.brightlearn.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCourseId(Long courseId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Review r WHERE r.course.id = :courseId")
    void deleteByCourseId(@org.springframework.data.repository.query.Param("courseId") Long courseId);
}
