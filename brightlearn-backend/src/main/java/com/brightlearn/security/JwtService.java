package com.brightlearn.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private static final long ACCESS_TOKEN_VALIDITY = 60 * 60 * 1000; // 1 hour

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String username, String role, int version) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("version", version)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public Integer extractVersion(String token) {
        return getClaims(token).get("version", Integer.class);
    }

    public boolean isTokenValid(String token) {
        return getClaims(token)
                .getExpiration()
                .after(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}