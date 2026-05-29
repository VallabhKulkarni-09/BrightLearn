package com.brightlearn.controller;

import com.brightlearn.dto.certificate.CertificateResponse;
import com.brightlearn.entity.Certificate;
import com.brightlearn.entity.User;
import com.brightlearn.repository.CertificateRepository;
import com.brightlearn.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;

    public CertificateController(CertificateRepository certificateRepository, UserRepository userRepository) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(Authentication authentication) {
        User student = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<CertificateResponse> certificates = certificateRepository.findByStudentId(student.getId())
                .stream()
                .map(CertificateResponse::from)
                .toList();
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<CertificateResponse> getCertificateByEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication) {
        // Find certificate
        Certificate certificate = certificateRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Certificate not found for enrollment: " + enrollmentId));

        // Check if student matches or is admin/instructor
        boolean isAdminOrInstructor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_INSTRUCTOR"));
        
        if (!isAdminOrInstructor && !certificate.getEnrollment().getStudent().getUsername().equals(authentication.getName())) {
            throw new RuntimeException("Access denied to certificate");
        }

        return ResponseEntity.ok(CertificateResponse.from(certificate));
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid certificate code"));
        return ResponseEntity.ok(CertificateResponse.from(certificate));
    }
}
