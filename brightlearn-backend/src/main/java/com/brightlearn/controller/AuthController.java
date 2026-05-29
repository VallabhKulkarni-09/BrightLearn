package com.brightlearn.controller;

import com.brightlearn.dto.auth.AuthResponse;
import com.brightlearn.dto.auth.LoginRequest;
import com.brightlearn.dto.auth.LoginResponse;
import com.brightlearn.dto.auth.RefreshTokenRequest;
import com.brightlearn.dto.auth.SignupRequest;
import com.brightlearn.dto.auth.UserProfileResponse;
import com.brightlearn.entity.User;
import com.brightlearn.repository.UserRepository;
import com.brightlearn.service.AuthService;
import com.brightlearn.dto.auth.UpdateProfileRequest;
import com.brightlearn.dto.auth.ChangePasswordRequest;
import com.brightlearn.dto.auth.CreateResetRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;

	public AuthController(AuthService authService, UserRepository userRepository) {
		this.authService = authService;
		this.userRepository = userRepository;
	}

	// Fix: now calls loginWithRefresh() so a refresh token is issued at login
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
		AuthResponse auth = authService.loginWithRefresh(request);
		return ResponseEntity.ok(new LoginResponse(auth.getAccessToken(), auth.getRefreshToken()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
		return ResponseEntity.ok(authService.refreshAccessToken(request.getRefreshToken()));
	}

	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestBody RefreshTokenRequest request) {
		authService.logout(request.getRefreshToken());
		return ResponseEntity.ok("Logged out");
	}

	@PostMapping("/signup")
	public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
		authService.signupStudent(request);
		return ResponseEntity.status(HttpStatus.CREATED).body("Student registered successfully");
	}

	@GetMapping("/me")
	public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
		User user = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found"));
		return ResponseEntity.ok(UserProfileResponse.from(user));
	}

	@PutMapping("/profile")
	public ResponseEntity<UserProfileResponse> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
		UserProfileResponse updated = authService.updateProfile(authentication.getName(), request);
		return ResponseEntity.ok(updated);
	}

	@PostMapping("/change-password")
	public ResponseEntity<String> changePassword(Authentication authentication, @RequestBody ChangePasswordRequest request) {
		authService.changePassword(authentication.getName(), request);
		return ResponseEntity.ok("Password changed successfully");
	}

	@PostMapping("/reset-request")
	public ResponseEntity<String> createResetRequest(@RequestBody CreateResetRequest request) {
		authService.createPasswordResetRequest(request);
		return ResponseEntity.ok("Password reset request submitted successfully");
	}
}
