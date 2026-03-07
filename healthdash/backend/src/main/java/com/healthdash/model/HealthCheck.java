package com.healthdash.model;

import jakarta.persistence.*;
//import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_checks")
//@Data
@NoArgsConstructor
public class HealthCheck {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public MonitoredService getService() {
		return service;
	}

	public void setService(MonitoredService service) {
		this.service = service;
	}

	public MonitoredService.ServiceStatus getStatus() {
		return status;
	}

	public void setStatus(MonitoredService.ServiceStatus status) {
		this.status = status;
	}

	public Long getResponseTimeMs() {
		return responseTimeMs;
	}

	public void setResponseTimeMs(Long responseTimeMs) {
		this.responseTimeMs = responseTimeMs;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public LocalDateTime getCheckedAt() {
		return checkedAt;
	}

	public void setCheckedAt(LocalDateTime checkedAt) {
		this.checkedAt = checkedAt;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private MonitoredService service;

    @Enumerated(EnumType.STRING)
    private MonitoredService.ServiceStatus status;

    private Long responseTimeMs;

    private String errorMessage;

    private LocalDateTime checkedAt = LocalDateTime.now();
}
