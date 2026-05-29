package com.brightlearn.dto.auth;

import com.brightlearn.entity.User;

import java.util.Set;
import java.util.stream.Collectors;

public class UserProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String mobileNumber;
    private boolean active;
    private Set<String> roles;
    private String bio;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;
    private String skills;
    private String specialization;
    private String experience;

    public UserProfileResponse(
            Long id,
            String username,
            String email,
            String mobileNumber,
            boolean active,
            Set<String> roles,
            String bio,
            String avatarUrl,
            String githubUrl,
            String linkedinUrl,
            String twitterUrl,
            String skills,
            String specialization,
            String experience) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.active = active;
        this.roles = roles;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.twitterUrl = twitterUrl;
        this.skills = skills;
        this.specialization = specialization;
        this.experience = experience;
    }

    public static UserProfileResponse from(User user) {
        Set<String> roleNames = user.getRoles()
                .stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                roleNames,
                user.getBio(),
                user.getAvatarUrl(),
                user.getGithubUrl(),
                user.getLinkedinUrl(),
                user.getTwitterUrl(),
                user.getSkills(),
                user.getSpecialization(),
                user.getExperience()
        );
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getMobileNumber() { return mobileNumber; }
    public boolean isActive() { return active; }
    public Set<String> getRoles() { return roles; }
    public String getBio() { return bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getGithubUrl() { return githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getTwitterUrl() { return twitterUrl; }
    public String getSkills() { return skills; }
    public String getSpecialization() { return specialization; }
    public String getExperience() { return experience; }
}
