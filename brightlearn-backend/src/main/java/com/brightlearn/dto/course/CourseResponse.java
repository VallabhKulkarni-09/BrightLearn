package com.brightlearn.dto.course;

public class CourseResponse {

    private Long id;
    private String title;
    private String description;
    private String instructorUsername;
    private String thumbnailUrl;
    private String learningOutcomes;

    public CourseResponse(Long id, String title, String description, String instructorUsername, String thumbnailUrl, String learningOutcomes) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.instructorUsername = instructorUsername;
        this.thumbnailUrl = thumbnailUrl;
        this.learningOutcomes = learningOutcomes;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getInstructorUsername() {
        return instructorUsername;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getLearningOutcomes() {
        return learningOutcomes;
    }
}
