package com.healthdash.controller;

import com.healthdash.model.MonitoredService;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ServiceResponse {
    private Long id;
    private String name;
    private String baseUrl;
    private String environment;
    private int checkIntervalSec;
    private boolean active;
    private String currentStatus;
    private Long lastResponseTimeMs;
    private LocalDateTime lastCheckedAt;
    private LocalDateTime lastFailureAt;
    private String lastErrorMessage;
    private LocalDateTime createdAt;

    public static ServiceResponse from(MonitoredService s) {
        ServiceResponse r = new ServiceResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setBaseUrl(s.getBaseUrl());
        r.setEnvironment(s.getEnvironment());
        r.setCheckIntervalSec(s.getCheckIntervalSec());
        r.setActive(s.isActive());
        r.setCurrentStatus(s.getCurrentStatus().name());
        r.setLastResponseTimeMs(s.getLastResponseTimeMs());
        r.setLastCheckedAt(s.getLastCheckedAt());
        r.setLastFailureAt(s.getLastFailureAt());
        r.setLastErrorMessage(s.getLastErrorMessage());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
