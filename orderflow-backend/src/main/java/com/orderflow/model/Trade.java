package com.orderflow.model;

public class Trade {

    private final long buyOrderId;
    private final long sellOrderId;
    private final String symbol;
    private final long price;
    private final long quantity;
    private final long timestamp;

    public Trade(long buyOrderId,
                 long sellOrderId,
                 String symbol,
                 long price,
                 long quantity) {

        this.buyOrderId = buyOrderId;
        this.sellOrderId = sellOrderId;
        this.symbol = symbol;
        this.price = price;
        this.quantity = quantity;
        this.timestamp = System.nanoTime();
    }

    public long getBuyOrderId() {
        return buyOrderId;
    }

    public long getSellOrderId() {
        return sellOrderId;
    }

    public String getSymbol() {
        return symbol;
    }

    public long getPrice() {
        return price;
    }

    public long getQuantity() {
        return quantity;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "TRADE -> " +
                symbol +
                " | BUY #" + buyOrderId +
                " | SELL #" + sellOrderId +
                " | Price: " + price +
                " | Quantity: " + quantity;
    }
}