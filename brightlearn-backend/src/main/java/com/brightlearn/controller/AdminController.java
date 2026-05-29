package com.brightlearn.controller;

import com.brightlearn.dto.admin.CreateInstructorRequest;
import com.brightlearn.dto.admin.UpdateUserRoleRequest;
import com.brightlearn.dto.admin.UpdateUserStatusRequest;
import com.brightlearn.dto.admin.UserResponse;
import com.brightlearn.service.AdminService;
import com.brightlearn.entity.PasswordResetRequest;
import com.brightlearn.dto.admin.PasswordResetResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/instructor")
    public ResponseEntity<String> createInstructor(
            @RequestBody CreateInstructorRequest request,
            Authentication authentication) {

        adminService.createInstructor(request, authentication.getName());
        return ResponseEntity.ok("Instructor created successfully");
    }

    @PutMapping("/role/{userId}")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UpdateUserRoleRequest request,
            Authentication authentication) {

        adminService.updateUserRole(userId, request, authentication.getName());
        return ResponseEntity.ok("User role updated");
    }

    @PutMapping("/status/{userId}")
    public ResponseEntity<String> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request,
            Authentication authentication) {

        adminService.updateUserStatus(userId, request, authentication.getName());
        return ResponseEntity.ok("User status updated");
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsersAsResponses());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserAsResponse(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {

        adminService.deleteUser(userId, authentication.getName());
        return ResponseEntity.ok("User deleted");
    }

    @GetMapping("/password-resets")
    public ResponseEntity<List<PasswordResetRequest>> getPasswordResets() {
        return ResponseEntity.ok(adminService.getAllPasswordResetRequests());
    }

    @PostMapping("/password-resets/{requestId}/resolve")
    public ResponseEntity<PasswordResetResponse> resolvePasswordReset(
            @PathVariable Long requestId,
            Authentication authentication) {
        PasswordResetResponse response = adminService.resolvePasswordResetRequest(requestId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
