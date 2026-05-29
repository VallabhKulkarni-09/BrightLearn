package com.brightlearn.service;

import com.brightlearn.entity.AuditLog;
import com.brightlearn.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String admin, String action, String target, String description) {
        auditLogRepository.save(
                new AuditLog(admin, action, target, description));
    }
}
