package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminUsername;   // who performed the action
    private String action;          // high-level action
    private String target;          // user/course affected
    private String description;     // optional details

    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(String adminUsername, String action, String target, String description) {
        this.adminUsername = adminUsername;
        this.action = action;
        this.target = target;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getAdminUsername() { return adminUsername; }
    public String getAction() { return action; }
    public String getTarget() { return target; }
    public String getDescription() { return description; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
