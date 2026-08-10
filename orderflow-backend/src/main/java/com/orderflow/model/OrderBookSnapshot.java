package com.orderflow.model;

import java.util.List;

public class OrderBookSnapshot {

    private final String symbol;
    private final List<Level> bids;
    private final List<Level> asks;

    public OrderBookSnapshot(
            String symbol,
            List<Level> bids,
            List<Level> asks) {

        this.symbol = symbol;
        this.bids = bids;
        this.asks = asks;
    }

    public String getSymbol() {
        return symbol;
    }

    public List<Level> getBids() {
        return bids;
    }

    public List<Level> getAsks() {
        return asks;
    }

    public record Level(long price, long quantity) {
    }
}