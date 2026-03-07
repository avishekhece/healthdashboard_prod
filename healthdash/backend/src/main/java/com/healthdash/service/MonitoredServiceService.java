package com.healthdash.service;

import com.healthdash.controller.ServiceRequest;
import com.healthdash.controller.ServiceResponse;
import com.healthdash.model.MonitoredService;
import com.healthdash.model.User;
import com.healthdash.repository.MonitoredServiceRepository;
import com.healthdash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoredServiceService {

    private final MonitoredServiceRepository serviceRepository;
    private final UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public List<ServiceResponse> getAll() {
        return serviceRepository.findByUserId(currentUser().getId())
                .stream().map(ServiceResponse::from).collect(Collectors.toList());
    }

    public ServiceResponse create(ServiceRequest req) {
        MonitoredService svc = new MonitoredService();
        svc.setUser(currentUser());
        svc.setName(req.getName());
        svc.setBaseUrl(req.getBaseUrl());
        svc.setEnvironment(req.getEnvironment() != null ? req.getEnvironment() : "production");
        svc.setCheckIntervalSec(req.getCheckIntervalSec() > 0 ? req.getCheckIntervalSec() : 60);
        return ServiceResponse.from(serviceRepository.save(svc));
    }

    public ServiceResponse update(Long id, ServiceRequest req) {
        MonitoredService svc = getOwnedService(id);
        if (req.getName() != null)
            svc.setName(req.getName());
        if (req.getBaseUrl() != null)
            svc.setBaseUrl(req.getBaseUrl());
        if (req.getEnvironment() != null)
            svc.setEnvironment(req.getEnvironment());
        if (req.getCheckIntervalSec() > 0)
            svc.setCheckIntervalSec(req.getCheckIntervalSec());
        svc.setActive(req.isActive());
        return ServiceResponse.from(serviceRepository.save(svc));
    }

    public void delete(Long id) {
        MonitoredService svc = getOwnedService(id);
        serviceRepository.delete(svc);
    }

    public MonitoredService getOwnedService(Long id) {
        MonitoredService svc = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!svc.getUser().getId().equals(currentUser().getId())) {
            throw new RuntimeException("Access denied");
        }
        return svc;
    }
}
