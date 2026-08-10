package com.orderflow.risk;

public class RiskResult {

    private final boolean approved;

    private final String reason;

    public RiskResult(boolean approved, String reason) {
        this.approved = approved;
        this.reason = reason;
    }

    public boolean isApproved() {
        return approved;
    }

    public String getReason() {
        return reason;
    }

    public static RiskResult approved() {
        return new RiskResult(true, "APPROVED");
    }

    public static RiskResult rejected(String reason) {
        return new RiskResult(false, reason);
    }
}