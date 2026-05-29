package com.brightlearn.dto.certificate;

import com.brightlearn.entity.Certificate;
import java.time.LocalDateTime;

public class CertificateResponse {
    private String certificateCode;
    private String studentName;
    private String courseTitle;
    private LocalDateTime completionDate;
    private String instructorName;

    public CertificateResponse() {}

    public CertificateResponse(String certificateCode, String studentName, String courseTitle, LocalDateTime completionDate, String instructorName) {
        this.certificateCode = certificateCode;
        this.studentName = studentName;
        this.courseTitle = courseTitle;
        this.completionDate = completionDate;
        this.instructorName = instructorName;
    }

    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getCertificateCode(),
                certificate.getEnrollment().getStudent().getUsername(),
                certificate.getEnrollment().getCourse().getTitle(),
                certificate.getIssuedAt(),
                certificate.getEnrollment().getCourse().getInstructorUsername()
        );
    }

    public String getCertificateCode() {
        return certificateCode;
    }

    public void setCertificateCode(String certificateCode) {
        this.certificateCode = certificateCode;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }
}
