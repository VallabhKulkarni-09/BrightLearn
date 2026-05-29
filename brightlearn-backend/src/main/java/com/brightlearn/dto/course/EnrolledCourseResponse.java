package com.brightlearn.dto.course;

import com.brightlearn.entity.Enrollment;

public class EnrolledCourseResponse {

    private Long courseId;
    private String title;
    private String description;
    private String instructorUsername;
    private Long enrollmentId;
    private String enrollmentStatus;
    private int progress;
    private String thumbnailUrl;

    public EnrolledCourseResponse() {}

    public EnrolledCourseResponse(
            Long courseId,
            String title,
            String description,
            String instructorUsername,
            Long enrollmentId,
            String enrollmentStatus,
            String thumbnailUrl) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.instructorUsername = instructorUsername;
        this.enrollmentId = enrollmentId;
        this.enrollmentStatus = enrollmentStatus;
        this.thumbnailUrl = thumbnailUrl;
    }

    public static EnrolledCourseResponse from(Enrollment enrollment) {
        EnrolledCourseResponse res = new EnrolledCourseResponse(
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getDescription(),
                enrollment.getCourse().getInstructorUsername(),
                enrollment.getId(),
                enrollment.getStatus(),
                enrollment.getCourse().getThumbnailUrl()
        );
        return res;
    }

    public Long getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getInstructorUsername() { return instructorUsername; }
    public Long getEnrollmentId() { return enrollmentId; }
    public String getEnrollmentStatus() { return enrollmentStatus; }
    
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
}
