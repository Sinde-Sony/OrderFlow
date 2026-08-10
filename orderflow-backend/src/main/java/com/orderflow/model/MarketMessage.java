package com.orderflow.model;

public class MarketMessage {

    private final String type;
    private final Object data;

    public MarketMessage(String type, Object data) {
        this.type = type;
        this.data = data;
    }

    public String getType() {
        return type;
    }

    public Object getData() {
        return data;
    }
}