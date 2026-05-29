package com.brightlearn.repository;

import com.brightlearn.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    List<PasswordResetRequest> findByStatus(String status);
    List<PasswordResetRequest> findByUsernameOrderByCreatedAtDesc(String username);
}
