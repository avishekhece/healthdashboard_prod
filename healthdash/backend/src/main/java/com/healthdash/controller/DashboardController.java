package com.healthdash.controller;

import com.healthdash.model.MonitoredService;
import com.healthdash.repository.MonitoredServiceRepository;
import com.healthdash.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MonitoredServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> summary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(email).orElseThrow().getId();

        List<MonitoredService> services = serviceRepository.findByUserId(userId);

        long up = services.stream().filter(s -> s.getCurrentStatus() == MonitoredService.ServiceStatus.UP).count();
        long down = services.stream().filter(s -> s.getCurrentStatus() == MonitoredService.ServiceStatus.DOWN).count();
        long unknown = services.stream().filter(s -> s.getCurrentStatus() == MonitoredService.ServiceStatus.UNKNOWN)
                .count();

        double avgResponseTime = services.stream()
                .filter(s -> s.getLastResponseTimeMs() != null)
                .mapToLong(MonitoredService::getLastResponseTimeMs)
                .average()
                .orElse(0);

        DashboardSummary summary = new DashboardSummary();
        summary.setTotalServices(services.size());
        summary.setServicesUp((int) up);
        summary.setServicesDown((int) down);
        summary.setServicesUnknown((int) unknown);
        summary.setAvgResponseTimeMs(Math.round(avgResponseTime));

        return ResponseEntity.ok(summary);
    }

    @Data
    static class DashboardSummary {
        private int totalServices;
        private int servicesUp;
        private int servicesDown;
        private int servicesUnknown;
        private long avgResponseTimeMs;
    }
}
