package com.brightlearn.service;

import com.brightlearn.dto.feedback.FeedbackResponse;
import com.brightlearn.dto.feedback.SubmitFeedbackRequest;
import com.brightlearn.entity.Course;
import com.brightlearn.entity.Feedback;
import com.brightlearn.entity.FeedbackType;
import com.brightlearn.entity.User;
import com.brightlearn.repository.CourseRepository;
import com.brightlearn.repository.FeedbackRepository;
import com.brightlearn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public FeedbackResponse submitFeedback(String studentUsername, SubmitFeedbackRequest request) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        FeedbackType type;
        try {
            type = FeedbackType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid feedback type. Must be COURSE or PLATFORM");
        }

        Course course = null;
        int rating = request.getRating();

        if (type == FeedbackType.COURSE) {
            if (request.getCourseId() == null) {
                throw new RuntimeException("Course ID is required for course feedback");
            }
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            if (rating < 1 || rating > 5) {
                throw new RuntimeException("Rating must be between 1 and 5 for course feedback");
            }
        } else {
            // Platform feedback rating is optional/default to 0
            rating = request.getRating() > 0 ? request.getRating() : 0;
        }

        Feedback feedback = new Feedback(student, type, course, request.getContent(), rating);
        Feedback saved = feedbackRepository.save(feedback);

        return FeedbackResponse.from(saved);
    }

    public List<FeedbackResponse> getFeedbackForInstructor(String instructorUsername) {
        return feedbackRepository.findCourseFeedbackByInstructor(instructorUsername)
                .stream()
                .map(FeedbackResponse::from)
                .toList();
    }

    public List<FeedbackResponse> getAllFeedbackForAdmin() {
        return feedbackRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(FeedbackResponse::from)
                .toList();
    }
}
