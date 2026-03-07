package com.healthdash.scheduler;

import com.healthdash.model.MonitoredService;
import com.healthdash.repository.MonitoredServiceRepository;
import com.healthdash.service.HealthCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class HealthCheckScheduler {

    private final MonitoredServiceRepository serviceRepository;
    private final HealthCheckService healthCheckService;

    // Runs every 60 seconds — checks all active services
    @Scheduled(fixedRate = 60000)
    public void runHealthChecks() {
        List<MonitoredService> activeServices = serviceRepository.findByActiveTrue();
        if (activeServices.isEmpty()) {
            return;
        }
        log.info("🔄 Running health checks for {} service(s)...", activeServices.size());
        activeServices.parallelStream().forEach(service -> {
            try {
                healthCheckService.checkService(service);
            } catch (Exception e) {
                log.error("Error checking service {}: {}", service.getName(), e.getMessage());
            }
        });
        log.info("✅ Health checks complete.");
    }
}
