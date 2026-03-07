package com.healthdash.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "monitored_services")
@Data
@NoArgsConstructor
public class MonitoredService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String baseUrl;

    private String environment = "production";

    private int checkIntervalSec = 60;

    private boolean active = true;

    @Enumerated(EnumType.STRING)
    private ServiceStatus currentStatus = ServiceStatus.UNKNOWN;

    private Long lastResponseTimeMs;

    private LocalDateTime lastCheckedAt;

    private LocalDateTime lastFailureAt;

    private String lastErrorMessage;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HealthCheck> healthChecks;

    public enum ServiceStatus {
        UP, DOWN, UNKNOWN
    }
}
