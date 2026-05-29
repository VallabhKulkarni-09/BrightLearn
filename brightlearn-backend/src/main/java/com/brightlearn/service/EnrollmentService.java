package com.brightlearn.service;

import com.brightlearn.dto.course.EnrolledCourseResponse;
import com.brightlearn.dto.admin.UserResponse;
import com.brightlearn.entity.Course;
import com.brightlearn.repository.CourseRepository;
import com.brightlearn.entity.Enrollment;
import com.brightlearn.repository.EnrollmentRepository;
import com.brightlearn.entity.User;
import com.brightlearn.repository.UserRepository;
import com.brightlearn.exception.ForbiddenException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final com.brightlearn.repository.LessonProgressRepository lessonProgressRepository;
    private final AuditService auditService;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            com.brightlearn.repository.LessonProgressRepository lessonProgressRepository,
            AuditService auditService) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.auditService = auditService;
    }

    public void enrollStudent(Long courseId, String username) {

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        enrollmentRepository.save(new Enrollment(student, course));
    }

    public List<Course> getMyCourses(String username) {

        User student = userRepository.findByUsername(username)
                .orElseThrow();

        return enrollmentRepository.findByStudentId(student.getId())
                .stream()
                .map(Enrollment::getCourse)
                .toList();
    }

    public List<EnrolledCourseResponse> getMyCoursesAsResponses(String username) {

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return enrollmentRepository.findByStudentId(student.getId())
                .stream()
                .map(enrollment -> {
                    EnrolledCourseResponse res = EnrolledCourseResponse.from(enrollment);
                    
                    List<com.brightlearn.entity.Lesson> allLessons = courseRepository.findById(enrollment.getCourse().getId()).get().getLessons();
                    if (allLessons.isEmpty()) {
                        res.setProgress(0);
                    } else {
                        long completedCount = lessonProgressRepository.findByEnrollmentId(enrollment.getId())
                                .stream()
                                .filter(com.brightlearn.entity.LessonProgress::isCompleted)
                                .count();
                        res.setProgress((int) ((completedCount * 100) / allLessons.size()));
                    }
                    return res;
                })
                .toList();
    }

    public List<UserResponse> getEnrolledStudents(Long courseId, String username, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isInstructor = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR"));

        if (!isAdmin) {
            if (isInstructor) {
                if (!course.getInstructor().getUsername().equals(username)) {
                    throw new ForbiddenException("You do not teach this course");
                }
            } else {
                throw new ForbiddenException("Unauthorized access");
            }
        }

        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(Enrollment::getStudent)
                .map(UserResponse::from)
                .toList();
    }

    public void enrollStudentByAdmin(Long courseId, Long studentId, String adminUsername) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        enrollmentRepository.save(new Enrollment(student, course));

        auditService.log(
                adminUsername,
                "ENROLL_STUDENT",
                student.getUsername(),
                "Enrolled in course: " + course.getTitle()
        );
    }

    @Transactional
    public void removeStudentByAuthorizedUser(Long courseId, Long studentId, String username, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isInstructor = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR"));

        if (!isAdmin) {
            if (isInstructor) {
                if (!course.getInstructor().getUsername().equals(username)) {
                    throw new ForbiddenException("You do not teach this course");
                }
            } else {
                throw new ForbiddenException("Unauthorized action");
            }
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Delete progress records
        lessonProgressRepository.deleteByEnrollmentId(enrollment.getId());

        // Delete enrollment record
        enrollmentRepository.delete(enrollment);

        // Audit the action
        String actionType = isAdmin ? "ADMIN_UNENROLL_STUDENT" : "INSTRUCTOR_UNENROLL_STUDENT";
        auditService.log(
                username,
                actionType,
                student.getUsername(),
                "Removed from course: " + course.getTitle()
        );
    }

    @Transactional
    public void unenrollSelf(Long courseId, String studentUsername) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Delete progress records
        lessonProgressRepository.deleteByEnrollmentId(enrollment.getId());

        // Delete enrollment record
        enrollmentRepository.delete(enrollment);
    }
}
