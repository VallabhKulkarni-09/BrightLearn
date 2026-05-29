package com.brightlearn.service;

import com.brightlearn.dto.course.CourseResponse;
import com.brightlearn.dto.course.CreateCourseRequest;
import com.brightlearn.entity.Course;
import com.brightlearn.repository.CourseRepository;
import com.brightlearn.entity.User;
import com.brightlearn.repository.UserRepository;
import com.brightlearn.repository.LessonProgressRepository;
import com.brightlearn.repository.StudentNoteRepository;
import com.brightlearn.repository.DiscussionCommentRepository;
import com.brightlearn.repository.QuizRepository;
import com.brightlearn.repository.EnrollmentRepository;
import com.brightlearn.repository.ReviewRepository;
import com.brightlearn.entity.Lesson;
import com.brightlearn.entity.Quiz;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final StudentNoteRepository studentNoteRepository;
    private final DiscussionCommentRepository discussionCommentRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository,
            LessonProgressRepository lessonProgressRepository,
            StudentNoteRepository studentNoteRepository,
            DiscussionCommentRepository discussionCommentRepository,
            QuizRepository quizRepository,
            EnrollmentRepository enrollmentRepository,
            ReviewRepository reviewRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.studentNoteRepository = studentNoteRepository;
        this.discussionCommentRepository = discussionCommentRepository;
        this.quizRepository = quizRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.reviewRepository = reviewRepository;
    }

    public CourseResponse createCourse(CreateCourseRequest request, String instructorUsername) {

        User instructor = userRepository.findByUsername(instructorUsername)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setLearningOutcomes(request.getLearningOutcomes());
        course.setInstructor(instructor);

        Course saved = courseRepository.save(course);

        return toResponse(saved);
    }

    public CourseResponse updateCourse(
            Long courseId,
            CreateCourseRequest request,
            String username,
            boolean isAdmin) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!isAdmin && !course.getInstructor().getUsername().equals(username)) {
            throw new RuntimeException("You are not allowed to modify this course");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setLearningOutcomes(request.getLearningOutcomes());

        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Transactional
    public void deleteCourse(
            Long courseId,
            String username,
            boolean isAdmin) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!isAdmin && !course.getInstructor().getUsername().equals(username)) {
            throw new RuntimeException("You are not allowed to delete this course");
        }

        // Delete dependencies for all lessons in this course
        for (Lesson lesson : course.getLessons()) {
            Long lessonId = lesson.getId();
            studentNoteRepository.deleteByLessonId(lessonId);
            discussionCommentRepository.deleteByLessonId(lessonId);
            
            List<Quiz> quizzes = quizRepository.findByLessonIdOrderByIdAsc(lessonId);
            for (Quiz quiz : quizzes) {
                quizRepository.delete(quiz);
            }
            quizRepository.flush();
            
            lessonProgressRepository.deleteByLessonId(lessonId);
        }

        // Delete all enrollments for this course
        enrollmentRepository.deleteByCourseId(courseId);

        // Delete all reviews for this course
        reviewRepository.deleteByCourseId(courseId);

        courseRepository.delete(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructor().getUsername(),
                course.getThumbnailUrl(),
                course.getLearningOutcomes()
        );
    }
}
