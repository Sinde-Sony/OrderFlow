package com.orderflow.model;

public class RiskEvent {

    private final boolean approved;
    private final String reason;

    public RiskEvent(boolean approved, String reason) {
        this.approved = approved;
        this.reason = reason;
    }

    public boolean isApproved() {
        return approved;
    }

    public String getReason() {
        return reason;
    }
}