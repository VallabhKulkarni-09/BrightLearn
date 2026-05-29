package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String certificateCode;

    @OneToOne(optional = false)
    @JoinColumn(name = "enrollment_id", unique = true)
    private Enrollment enrollment;

    @Column(nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    public Certificate() {}

    public Certificate(String certificateCode, Enrollment enrollment) {
        this.certificateCode = certificateCode;
        this.enrollment = enrollment;
        this.issuedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCertificateCode() {
        return certificateCode;
    }

    public void setCertificateCode(String certificateCode) {
        this.certificateCode = certificateCode;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }

    public void setEnrollment(Enrollment enrollment) {
        this.enrollment = enrollment;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }
}
