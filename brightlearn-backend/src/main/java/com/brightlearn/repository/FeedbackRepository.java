package com.brightlearn.repository;

import com.brightlearn.entity.Feedback;
import com.brightlearn.entity.FeedbackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByType(FeedbackType type);

    @Query("SELECT f FROM Feedback f WHERE f.type = 'COURSE' AND f.course.instructor.username = :username ORDER BY f.createdAt DESC")
    List<Feedback> findCourseFeedbackByInstructor(@Param("username") String instructorUsername);

    @Query("SELECT f FROM Feedback f WHERE f.type = 'COURSE' AND f.course.id = :courseId ORDER BY f.createdAt DESC")
    List<Feedback> findCourseFeedbackByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllOrderByCreatedAtDesc();

    @Query("DELETE FROM Feedback f WHERE f.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    @Query("DELETE FROM Feedback f WHERE f.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
