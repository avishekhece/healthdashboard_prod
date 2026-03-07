package com.healthdash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthDashApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthDashApplication.class, args);
    }
}
