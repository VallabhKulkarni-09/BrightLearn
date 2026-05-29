package com.brightlearn.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(request -> {
					var config = new org.springframework.web.cors.CorsConfiguration();
					config.setAllowedOrigins(java.util.List.of("http://localhost:4173", "http://localhost:5173", "http://localhost:3000", "http://localhost:4174"));
					config.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
					config.setAllowedHeaders(java.util.List.of("*"));
					config.setAllowCredentials(true);
					return config;
				}))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// ✅ ADD THIS BLOCK
				.exceptionHandling(exception -> exception

						// 401 - Authentication required / invalid token
						.authenticationEntryPoint((request, response, authException) -> {
							response.setStatus(HttpStatus.UNAUTHORIZED.value());
							response.setContentType("application/json");
							response.getWriter().write("""
									{
									  "status": 401,
									  "error": "Unauthorized",
									  "message": "Authentication required",
									  "path": "%s"
									}
									""".formatted(request.getRequestURI()));
						})

						// 403 - Role not allowed
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							response.setStatus(HttpStatus.FORBIDDEN.value());
							response.setContentType("application/json");
							response.getWriter().write("""
									{
									  "status": 403,
									  "error": "Forbidden",
									  "message": "Access denied",
									  "path": "%s"
									}
									""".formatted(request.getRequestURI()));
						}))

				.authorizeHttpRequests(auth -> auth.requestMatchers("/auth/**", "/swagger-ui/**", "/v3/api-docs/**")
						.permitAll().anyRequest().authenticated())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}