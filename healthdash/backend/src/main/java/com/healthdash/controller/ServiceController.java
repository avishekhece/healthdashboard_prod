package com.healthdash.controller;

import com.healthdash.model.HealthCheck;
import com.healthdash.repository.HealthCheckRepository;
import com.healthdash.service.HealthCheckService;
import com.healthdash.service.MonitoredServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final MonitoredServiceService monitoredServiceService;
    private final HealthCheckRepository healthCheckRepository;
    private final HealthCheckService healthCheckService;

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> list() {
        return ResponseEntity.ok(monitoredServiceService.getAll());
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@RequestBody ServiceRequest req) {
        return ResponseEntity.ok(monitoredServiceService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> update(@PathVariable Long id, @RequestBody ServiceRequest req) {
        return ResponseEntity.ok(monitoredServiceService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        monitoredServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<HistoryResponse>> history(@PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit) {
        // Verify ownership
        monitoredServiceService.getOwnedService(id);
        List<HistoryResponse> history = healthCheckRepository
                .findByServiceIdOrderByCheckedAtDesc(id, PageRequest.of(0, limit))
                .stream()
                .map(HistoryResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    @PostMapping("/{id}/check-now")
    public ResponseEntity<ServiceResponse> checkNow(@PathVariable Long id) {
        var svc = monitoredServiceService.getOwnedService(id);
        healthCheckService.checkService(svc);
        return ResponseEntity.ok(ServiceResponse.from(svc));
    }

    // Inner DTO
    @lombok.Data
    static class HistoryResponse {
        private Long id;
        private String status;
        private Long responseTimeMs;
        private String errorMessage;
        private LocalDateTime checkedAt;

        static HistoryResponse from(HealthCheck hc) {
            HistoryResponse r = new HistoryResponse();
            r.setId(hc.getId());
            r.setStatus(hc.getStatus().name());
            r.setResponseTimeMs(hc.getResponseTimeMs());
            r.setErrorMessage(hc.getErrorMessage());
            r.setCheckedAt(hc.getCheckedAt());
            return r;
        }
    }
}
