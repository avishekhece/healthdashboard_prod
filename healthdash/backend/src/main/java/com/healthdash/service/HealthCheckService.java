package com.healthdash.service;

import com.healthdash.model.HealthCheck;
import com.healthdash.model.MonitoredService;
import com.healthdash.repository.HealthCheckRepository;
import com.healthdash.repository.MonitoredServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthCheckService {

    private final MonitoredServiceRepository serviceRepository;
    private final HealthCheckRepository healthCheckRepository;
    private final RestTemplate restTemplate;

    public void checkService(MonitoredService monitoredService) {
        String url = monitoredService.getBaseUrl().trim();
        if (!url.endsWith("/actuator/health")) {
            url = url.replaceAll("/$", "") + "/actuator/health";
        }

        HealthCheck check = new HealthCheck();
        check.setService(monitoredService);
        check.setCheckedAt(LocalDateTime.now());

        long start = System.currentTimeMillis();
        try {
            String response = restTemplate.getForObject(url, String.class);
            long elapsed = System.currentTimeMillis() - start;

            boolean isUp = response != null && response.contains("\"UP\"");
            check.setStatus(isUp ? MonitoredService.ServiceStatus.UP : MonitoredService.ServiceStatus.DOWN);
            check.setResponseTimeMs(elapsed);

            monitoredService.setCurrentStatus(check.getStatus());
            monitoredService.setLastResponseTimeMs(elapsed);
            monitoredService.setLastCheckedAt(LocalDateTime.now());
            if (!isUp) {
                monitoredService.setLastFailureAt(LocalDateTime.now());
                monitoredService.setLastErrorMessage("Service returned status: DOWN");
            }
            log.info("✔ Checked [{}] → {} in {}ms", monitoredService.getName(), check.getStatus(), elapsed);

        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            check.setStatus(MonitoredService.ServiceStatus.DOWN);
            check.setResponseTimeMs(elapsed);
            check.setErrorMessage(e.getMessage());

            monitoredService.setCurrentStatus(MonitoredService.ServiceStatus.DOWN);
            monitoredService.setLastCheckedAt(LocalDateTime.now());
            monitoredService.setLastFailureAt(LocalDateTime.now());
            monitoredService.setLastErrorMessage(e.getMessage());
            log.warn("✘ Failed [{}] → {} ({}ms): {}", monitoredService.getName(), "DOWN", elapsed, e.getMessage());
        }

        healthCheckRepository.save(check);
        serviceRepository.save(monitoredService);
    }
}
