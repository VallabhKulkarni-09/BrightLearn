package com.brightlearn.repository;

import com.brightlearn.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateCode(String code);
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);

    @Query("SELECT c FROM Certificate c WHERE c.enrollment.student.id = :studentId ORDER BY c.issuedAt DESC")
    List<Certificate> findByStudentId(@Param("studentId") Long studentId);

    @Query("DELETE FROM Certificate c WHERE c.enrollment.id = :enrollmentId")
    void deleteByEnrollmentId(@Param("enrollmentId") Long enrollmentId);
}
