package com.healthdash.controller;

public class ServiceRequest {
    private String name;
    private String baseUrl;
    private String environment;
    private int checkIntervalSec;
    private boolean active = true;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getBaseUrl() {
		return baseUrl;
	}
	public void setBaseUrl(String baseUrl) {
		this.baseUrl = baseUrl;
	}
	public String getEnvironment() {
		return environment;
	}
	public void setEnvironment(String environment) {
		this.environment = environment;
	}
	public int getCheckIntervalSec() {
		return checkIntervalSec;
	}
	public void setCheckIntervalSec(int checkIntervalSec) {
		this.checkIntervalSec = checkIntervalSec;
	}
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
}
