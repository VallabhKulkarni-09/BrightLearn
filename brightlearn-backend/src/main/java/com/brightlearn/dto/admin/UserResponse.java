package com.brightlearn.dto.admin;

import com.brightlearn.entity.Role;
import com.brightlearn.entity.User;

import java.util.Set;
import java.util.stream.Collectors;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String mobileNumber;
    private boolean active;
    private Set<String> roles;

    public UserResponse(Long id, String username, String email,
                        String mobileNumber, boolean active, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.active = active;
        this.roles = roles;
    }

    /** Convenience factory — converts a User entity without exposing the password. */
    public static UserResponse from(User user) {
        Set<String> roleNames = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                roleNames
        );
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getMobileNumber() { return mobileNumber; }
    public boolean isActive() { return active; }
    public Set<String> getRoles() { return roles; }
}
