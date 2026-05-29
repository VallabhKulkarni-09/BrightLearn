package com.brightlearn.dto.audit;

import com.brightlearn.entity.AuditLog;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long id;
    private String adminUsername;
    private String action;
    private String target;
    private String description;
    private LocalDateTime timestamp;

    public AuditLogResponse(
            Long id,
            String adminUsername,
            String action,
            String target,
            String description,
            LocalDateTime timestamp) {
        this.id = id;
        this.adminUsername = adminUsername;
        this.action = action;
        this.target = target;
        this.description = description;
        this.timestamp = timestamp;
    }

    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAdminUsername(),
                log.getAction(),
                log.getTarget(),
                log.getDescription(),
                log.getTimestamp()
        );
    }

    public Long getId() { return id; }
    public String getAdminUsername() { return adminUsername; }
    public String getAction() { return action; }
    public String getTarget() { return target; }
    public String getDescription() { return description; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
