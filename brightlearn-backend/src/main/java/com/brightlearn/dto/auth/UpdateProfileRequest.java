package com.brightlearn.dto.auth;

public class UpdateProfileRequest {
    private String email;
    private String mobileNumber;
    private String bio;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;
    private String skills;
    private String specialization;
    private String experience;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getTwitterUrl() { return twitterUrl; }
    public void setTwitterUrl(String twitterUrl) { this.twitterUrl = twitterUrl; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
}
