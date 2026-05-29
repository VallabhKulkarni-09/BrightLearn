package com.brightlearn.audit;

import com.brightlearn.service.AuditService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

	private final AuditService auditService;

	public AuditAspect(AuditService auditService) {
		this.auditService = auditService;
	}

	// 🔥 Generic helper to get current username
	private String getCurrentUsername() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return (auth != null) ? auth.getName() : "UNKNOWN_USER";
	}

	@After("execution(* com.brightlearn.service.AdminService.*(..))")
	public void logAdminActions(JoinPoint joinPoint) {

		String admin = getCurrentUsername();
		String method = joinPoint.getSignature().getName();

		auditService.log(admin, "ADMIN_ACTION", method, "Admin executed: " + method);
	}

	@After("execution(* com.brightlearn.service.CourseService.updateCourse(..))")
	public void logCourseUpdate(JoinPoint joinPoint) {
		String user = getCurrentUsername();
		Long courseId = (Long) joinPoint.getArgs()[0];

		auditService.log(user, "COURSE_UPDATE", "CourseID=" + courseId, "Course updated");
	}

	@After("execution(* com.brightlearn.service.CourseService.deleteCourse(..))")
	public void logCourseDelete(JoinPoint joinPoint) {
		String user = getCurrentUsername();
		Long courseId = (Long) joinPoint.getArgs()[0];

		auditService.log(user, "COURSE_DELETE", "CourseID=" + courseId, "Course deleted");
	}

	@After("execution(* com.brightlearn.service.EnrollmentService.enrollStudent(..))")
	public void logEnrollment(JoinPoint joinPoint) {
		String student = getCurrentUsername();
		Long courseId = (Long) joinPoint.getArgs()[0];

		auditService.log(student, "COURSE_ENROLL", "CourseID=" + courseId, "Student enrolled in course");
	}

	@After("execution(* com.brightlearn.service.ReviewService.submitReview(..))")
	public void logReview(JoinPoint joinPoint) {
		String student = getCurrentUsername();
		Long courseId = (Long) joinPoint.getArgs()[0];

		auditService.log(student, "REVIEW_SUBMITTED", "CourseID=" + courseId, "Student submitted a review");
	}

	@AfterThrowing(pointcut = "execution(* com.brightlearn.service.AuthService.login(..))", throwing = "ex")
	public void logLoginFailure(JoinPoint joinPoint, Exception ex) {
		String username = (String) joinPoint.getArgs()[0];

		auditService.log(username, "LOGIN_FAILED", "username=" + username, ex.getMessage());
	}

	@After("execution(* org.springframework.security.web.access.AccessDeniedHandler.*(..))")
	public void logForbidden() {
		String user = getCurrentUsername();
		auditService.log(user, "FORBIDDEN_ACCESS", "403", "User attempted forbidden access");
	}

	@After("execution(* org.springframework.security.web.AuthenticationEntryPoint.commence(..))")
	public void logUnauthorized() {
		auditService.log("UNKNOWN_USER", "UNAUTHORIZED_ACCESS", "401",
				"Access to protected endpoint without authentication");
	}
}
