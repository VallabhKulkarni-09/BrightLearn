package com.brightlearn.service;

import com.brightlearn.entity.Course;
import com.brightlearn.repository.CourseRepository;
import com.brightlearn.repository.EnrollmentRepository;
import com.brightlearn.entity.Review;
import com.brightlearn.repository.ReviewRepository;
import com.brightlearn.entity.User;
import com.brightlearn.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository) {
        this.reviewRepository = reviewRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public void submitReview(Long courseId, String username, int rating, String comment) {

        User student = userRepository.findByUsername(username).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("You must enroll before reviewing");
        }

        reviewRepository.save(new Review(student, course, rating, comment));
    }
}
