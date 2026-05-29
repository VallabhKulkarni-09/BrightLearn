package com.brightlearn.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brightlearn.entity.RefreshToken;
import com.brightlearn.entity.User;
import com.brightlearn.repository.RefreshTokenRepository;
import com.brightlearn.repository.UserRepository;

@Service
public class RefreshTokenService {

	private static final long REFRESH_TOKEN_DURATION_MS = 15L * 24 * 60 * 60 * 1000; // 15 days

	private final RefreshTokenRepository refreshTokenRepository;
	public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
		this.refreshTokenRepository = refreshTokenRepository;
	}

	@Transactional
	public RefreshToken createRefreshToken(User user) {

		// Enforce single active session by updating existing token if it exists
		RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
				.orElse(new RefreshToken());

		refreshToken.setUser(user);
		refreshToken.setToken(UUID.randomUUID().toString());
		refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_DURATION_MS));
		refreshToken.setRevoked(false);

		return refreshTokenRepository.save(refreshToken);
	}

	public RefreshToken validateRefreshToken(String token) {

		RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
				.orElseThrow(() -> new RuntimeException("Invalid refresh token"));

		if (refreshToken.isRevoked()) {
			throw new RuntimeException("Refresh token revoked");
		}

		if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
			throw new RuntimeException("Refresh token expired");
		}

		return refreshToken;
	}

	@Transactional
	public void revokeToken(RefreshToken refreshToken) {
		refreshToken.setRevoked(true);
		refreshTokenRepository.save(refreshToken);
	}
}
