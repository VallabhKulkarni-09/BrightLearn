package com.brightlearn.service;

import com.brightlearn.dto.auth.AuthResponse;
import com.brightlearn.dto.auth.LoginRequest;
import com.brightlearn.dto.auth.SignupRequest;
import com.brightlearn.security.JwtService;
import com.brightlearn.entity.RefreshToken;
import com.brightlearn.entity.Role;
import com.brightlearn.entity.User;
import com.brightlearn.repository.RoleRepository;
import com.brightlearn.repository.UserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.brightlearn.repository.RefreshTokenRepository;
import com.brightlearn.repository.PasswordResetRequestRepository;
import com.brightlearn.dto.auth.UpdateProfileRequest;
import com.brightlearn.dto.auth.UserProfileResponse;
import com.brightlearn.dto.auth.ChangePasswordRequest;
import com.brightlearn.dto.auth.CreateResetRequest;
import com.brightlearn.entity.PasswordResetRequest;

@Service
public class AuthService {

	private final RefreshTokenService refreshTokenService;
	private final RefreshTokenRepository refreshTokenRepository;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final PasswordResetRequestRepository passwordResetRequestRepository;

	public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
			UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
			RefreshTokenService refreshTokenService, RefreshTokenRepository refreshTokenRepository,
			PasswordResetRequestRepository passwordResetRequestRepository) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.refreshTokenService = refreshTokenService;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordResetRequestRepository = passwordResetRequestRepository;
	}

	public AuthResponse loginWithRefresh(LoginRequest request) {

		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

		User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

		String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

		// Increment version to invalidate old sessions
		user.setTokenVersion(user.getTokenVersion() + 1);
		userRepository.save(user);

		String accessToken = jwtService.generateToken(user.getUsername(), role, user.getTokenVersion());

		RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

		return new AuthResponse(accessToken, refreshToken.getToken());
	}

	public String login(String username, String password) {
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(username, password));

		String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

		User user = userRepository.findByUsername(username).orElseThrow();
		user.setTokenVersion(user.getTokenVersion() + 1);
		userRepository.save(user);

		return jwtService.generateToken(username, role, user.getTokenVersion());
	}

	public AuthResponse refreshAccessToken(String refreshTokenValue) {

		RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);

		User user = refreshToken.getUser();

		String role = user.getRoles().iterator().next().getName();

		// rotate refresh token
		refreshTokenService.revokeToken(refreshToken);

		user.setTokenVersion(user.getTokenVersion() + 1);
		userRepository.save(user);

		RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

		String newAccessToken = jwtService.generateToken(user.getUsername(), role, user.getTokenVersion());

		return new AuthResponse(newAccessToken, newRefreshToken.getToken());
	}

	public void logout(String refreshTokenValue) {

		RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue).orElseThrow();

		refreshTokenService.revokeToken(refreshToken);
	}

	public void signupStudent(SignupRequest request) {

		if (userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("Username already exists");
		}

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("Email already exists");
		}

		Role studentRole = roleRepository.findByName("STUDENT")
				.orElseThrow(() -> new RuntimeException("STUDENT role not found"));

		User user = new User();
		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());
		user.setMobileNumber(request.getMobileNumber());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.getRoles().add(studentRole);

		userRepository.save(user);
	}

	public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Allow changing email/mobile only if not conflicting with others
		if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
			if (userRepository.existsByEmail(request.getEmail())) {
				throw new RuntimeException("Email already exists");
			}
			user.setEmail(request.getEmail());
		}
		if (request.getMobileNumber() != null) {
			user.setMobileNumber(request.getMobileNumber());
		}
		user.setBio(request.getBio());
		user.setAvatarUrl(request.getAvatarUrl());
		user.setGithubUrl(request.getGithubUrl());
		user.setLinkedinUrl(request.getLinkedinUrl());
		user.setTwitterUrl(request.getTwitterUrl());
		user.setSkills(request.getSkills());
		user.setSpecialization(request.getSpecialization());
		user.setExperience(request.getExperience());

		User saved = userRepository.save(user);
		return UserProfileResponse.from(saved);
	}

	public void changePassword(String username, ChangePasswordRequest request) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new RuntimeException("Incorrect current password");
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate active sessions
		userRepository.save(user);
	}

	public void createPasswordResetRequest(CreateResetRequest request) {
		if (!userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("User does not exist");
		}
		PasswordResetRequest resetRequest = new PasswordResetRequest(request.getUsername(), request.getNote());
		passwordResetRequestRepository.save(resetRequest);
	}
}
