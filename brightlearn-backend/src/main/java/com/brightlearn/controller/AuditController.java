package com.brightlearn.controller;

import com.brightlearn.dto.audit.AuditLogResponse;
import com.brightlearn.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository repo;

    public AuditController(AuditLogRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getLogs() {
        return ResponseEntity.ok(repo.findAll()
                .stream()
                .map(AuditLogResponse::from)
                .toList());
    }
}
