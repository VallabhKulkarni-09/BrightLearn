package com.brightlearn.dto.course;

public class CreateCourseRequest {

    private String title;
    private String description;
    private String thumbnailUrl;
    private String learningOutcomes;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getLearningOutcomes() {
        return learningOutcomes;
    }
}
