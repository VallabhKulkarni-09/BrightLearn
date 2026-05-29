package com.brightlearn.service;

import com.brightlearn.dto.admin.CreateInstructorRequest;
import com.brightlearn.dto.admin.UpdateUserRoleRequest;
import com.brightlearn.dto.admin.UpdateUserStatusRequest;
import com.brightlearn.dto.admin.UserResponse;
import com.brightlearn.entity.Role;
import com.brightlearn.entity.User;
import com.brightlearn.repository.RoleRepository;
import com.brightlearn.repository.UserRepository;
import com.brightlearn.repository.RefreshTokenRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Lazy;
import com.brightlearn.entity.PasswordResetRequest;
import com.brightlearn.repository.PasswordResetRequestRepository;
import com.brightlearn.dto.admin.PasswordResetResponse;
import java.time.LocalDateTime;
import java.util.UUID;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final JdbcTemplate jdbcTemplate;
    private final CourseService courseService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;

    public AdminService(UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        AuditService auditService,
                        RefreshTokenRepository refreshTokenRepository,
                        JdbcTemplate jdbcTemplate,
                        @Lazy CourseService courseService,
                        PasswordResetRequestRepository passwordResetRequestRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.jdbcTemplate = jdbcTemplate;
        this.courseService = courseService;
        this.passwordResetRequestRepository = passwordResetRequestRepository;
    }

    // ✔ 1. Create Instructor (with real admin username)
    public void createInstructor(CreateInstructorRequest request, String adminUsername) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findByName("INSTRUCTOR")
                .orElseThrow(() -> new RuntimeException("INSTRUCTOR role not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(role);

        userRepository.save(user);

        // 🔥 AUDIT LOG — REAL ADMIN USER
        auditService.log(
                adminUsername,
                "CREATE_INSTRUCTOR",
                user.getUsername(),
                "Instructor account created"
        );
    }

    // ✔ 2. Change User Role
    public void updateUserRole(Long userId, UpdateUserRoleRequest request, String adminUsername) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().clear();
        user.getRoles().add(newRole);

        userRepository.save(user);

        // 🔥 AUDIT LOG
        auditService.log(
                adminUsername,
                "CHANGE_ROLE",
                user.getUsername(),
                "Role changed to " + newRole.getName()
        );
    }

    // ✔ 3. Activate / Deactivate User
    public void updateUserStatus(Long userId, UpdateUserStatusRequest request, String adminUsername) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(request.isActive());
        userRepository.save(user);

        // 🔥 AUDIT LOG
        auditService.log(
                adminUsername,
                "UPDATE_STATUS",
                user.getUsername(),
                "User active = " + request.isActive()
        );
    }

    // ✔ 4. View Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✔ 4b. View Users as Response DTOs
    public List<UserResponse> getAllUsersAsResponses() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    // ✔ 5. View One User
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✔ 5b. View One User as Response DTO
    public UserResponse getUserAsResponse(Long id) {
        return UserResponse.from(getUser(id));
    }

    // ✔ 6. Delete User
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id, String adminUsername) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If user is an instructor, delete all their courses first
        List<Long> courseIds = jdbcTemplate.queryForList(
                "SELECT id FROM courses WHERE instructor_id = ?", Long.class, id);
        for (Long courseId : courseIds) {
            courseService.deleteCourse(courseId, adminUsername, true);
        }

        // Clean up student-specific references using SQL to avoid constraint violations
        jdbcTemplate.update("DELETE FROM comment_upvotes WHERE user_id = ?", id);
        jdbcTemplate.update("DELETE FROM refresh_tokens WHERE user_id = ?", id);
        jdbcTemplate.update("DELETE FROM student_notes WHERE user_id = ?", id);
        jdbcTemplate.update("DELETE FROM reviews WHERE student_id = ?", id);
        jdbcTemplate.update("DELETE FROM lesson_progress WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id = ?)", id);
        jdbcTemplate.update("DELETE FROM enrollments WHERE student_id = ?", id);
        
        // Clean up discussion comments authored by this user (including replies first, to satisfy self-referencing constraints)
        jdbcTemplate.update("DELETE FROM discussion_comments WHERE parent_id IN (SELECT id FROM (SELECT id FROM discussion_comments WHERE author_id = ?) as temp)", id);
        jdbcTemplate.update("DELETE FROM discussion_comments WHERE author_id = ? AND parent_id IS NOT NULL", id);
        jdbcTemplate.update("DELETE FROM discussion_comments WHERE author_id = ? AND parent_id IS NULL", id);

        userRepository.deleteById(id);

        // 🔥 AUDIT LOG
        auditService.log(
                adminUsername,
                "DELETE_USER",
                user.getUsername(),
                "User account deleted"
        );
    }

    public List<PasswordResetRequest> getAllPasswordResetRequests() {
        return passwordResetRequestRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public PasswordResetResponse resolvePasswordResetRequest(Long requestId, String adminUsername) {
        PasswordResetRequest request = passwordResetRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Reset request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is already resolved");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found for request"));

        // Generate temporary password
        String tempPassword = "temp_" + UUID.randomUUID().toString().substring(0, 6);

        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate existing sessions
        userRepository.save(user);

        request.setStatus("RESOLVED");
        request.setResolvedAt(LocalDateTime.now());
        request.setResolvedBy(adminUsername);
        passwordResetRequestRepository.save(request);

        // 🔥 AUDIT LOG
        auditService.log(
                adminUsername,
                "RESOLVE_PASSWORD_RESET",
                user.getUsername(),
                "Password reset request resolved. Temp password generated."
        );

        return new PasswordResetResponse(tempPassword);
    }
}
