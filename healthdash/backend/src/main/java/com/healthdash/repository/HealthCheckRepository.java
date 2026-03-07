package com.healthdash.repository;

import com.healthdash.model.HealthCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCheckRepository extends JpaRepository<HealthCheck, Long> {
    List<HealthCheck> findByServiceIdOrderByCheckedAtDesc(Long serviceId, Pageable pageable);
    List<HealthCheck> findByServiceIdOrderByCheckedAtDesc(Long serviceId);
    long countByServiceId(Long serviceId);
}
