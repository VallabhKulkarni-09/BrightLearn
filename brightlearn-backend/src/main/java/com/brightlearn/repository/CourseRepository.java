package com.brightlearn.repository;

import com.brightlearn.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByInstructorId(Long instructorId);
}
