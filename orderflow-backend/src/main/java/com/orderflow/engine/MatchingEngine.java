package com.orderflow.engine;
import com.orderflow.risk.Account;
import com.orderflow.risk.RiskManager;
import com.orderflow.risk.RiskResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.model.MarketMessage;
import com.orderflow.model.Order;
import com.orderflow.model.OrderBookSnapshot;
import com.orderflow.model.OrderSide;
import com.orderflow.model.OrderType;
import com.orderflow.model.Trade;
import com.orderflow.websocket.MarketWebSocketHandler;
import org.springframework.stereotype.Component;

@Component
public class MatchingEngine {

    private final OrderBook orderBook = new OrderBook();
    private final MarketWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;
    private final OrderPool orderPool;
    private final RiskManager riskManager;
    // Disables UI/network overhead during latency benchmark.
    private volatile boolean benchmarkMode = false;
    public MatchingEngine(
            MarketWebSocketHandler webSocketHandler,
            ObjectMapper objectMapper,
            OrderPool orderPool,
            RiskManager riskManager) {

        this.webSocketHandler = webSocketHandler;
        this.objectMapper = objectMapper;
        this.orderPool = orderPool;
        this.riskManager = riskManager;
    }

    public void processOrder(Order order) {

        Account account = new Account(
                "ACC-001",
                1_000_000,
                1_000
        );

        RiskResult result = riskManager.validate(account, order);

        if (!result.isApproved()) {

            System.out.println(
                    "ORDER REJECTED: " + result.getReason()
            );

            return;
        }

        String symbol = order.getSymbol();

        if (order.getSide() == OrderSide.BUY) {
            processBuy(order);
        } else {
            processSell(order);
        }

        if (!benchmarkMode) {
            broadcastOrderBook(symbol);
        }
    }


    private void processBuy(Order buyOrder) {

        while (buyOrder.getQuantity() > 0 &&
                !orderBook.getSellOrders().isEmpty()) {

            Order sellOrder =
                    orderBook.getSellOrders().peek();

            // LIMIT BUY cannot execute above its limit price.
            // MARKET BUY accepts the best available ASK.
            if (buyOrder.getOrderType() == OrderType.LIMIT &&
                    buyOrder.getPrice() < sellOrder.getPrice()) {

                break;
            }

            long tradedQuantity =
                    Math.min(
                            buyOrder.getQuantity(),
                            sellOrder.getQuantity()
                    );

            /*
             * During benchmark mode we deliberately avoid creating
             * Trade objects because no WebSocket event is required.
             */
            if (!benchmarkMode) {

                Trade trade = new Trade(
                        buyOrder.getOrderId(),
                        sellOrder.getOrderId(),
                        buyOrder.getSymbol(),
                        sellOrder.getPrice(),
                        tradedQuantity
                );

                System.out.println(trade);
                broadcastTrade(trade);
            }

            buyOrder.setQuantity(
                    buyOrder.getQuantity() - tradedQuantity
            );

            sellOrder.setQuantity(
                    sellOrder.getQuantity() - tradedQuantity
            );

            // Resting SELL has been completely filled.
            if (sellOrder.getQuantity() == 0) {

                orderBook.getSellOrders().poll();

                // It is no longer referenced by the Order Book.
                orderPool.release(sellOrder);
            }
        }

        if (buyOrder.getQuantity() > 0 &&
                buyOrder.getOrderType() == OrderType.LIMIT) {

            // Unmatched LIMIT order must remain in the book.
            orderBook.getBuyOrders().add(buyOrder);

        } else {

            // Fully filled order or unused MARKET remainder.
            orderPool.release(buyOrder);
        }
    }

    private void processSell(Order sellOrder) {

        while (sellOrder.getQuantity() > 0 &&
                !orderBook.getBuyOrders().isEmpty()) {

            Order buyOrder =
                    orderBook.getBuyOrders().peek();

            // LIMIT SELL cannot execute below its limit price.
            // MARKET SELL accepts the best available BID.
            if (sellOrder.getOrderType() == OrderType.LIMIT &&
                    sellOrder.getPrice() > buyOrder.getPrice()) {

                break;
            }

            long tradedQuantity =
                    Math.min(
                            sellOrder.getQuantity(),
                            buyOrder.getQuantity()
                    );

            /*
             * No Trade allocation during the latency benchmark.
             */
            if (!benchmarkMode) {

                Trade trade = new Trade(
                        buyOrder.getOrderId(),
                        sellOrder.getOrderId(),
                        sellOrder.getSymbol(),
                        buyOrder.getPrice(),
                        tradedQuantity
                );

                System.out.println(trade);
                broadcastTrade(trade);
            }

            sellOrder.setQuantity(
                    sellOrder.getQuantity() - tradedQuantity
            );

            buyOrder.setQuantity(
                    buyOrder.getQuantity() - tradedQuantity
            );

            // Resting BUY has been completely filled.
            if (buyOrder.getQuantity() == 0) {

                orderBook.getBuyOrders().poll();

                // Safe to reuse.
                orderPool.release(buyOrder);
            }
        }

        if (sellOrder.getQuantity() > 0 &&
                sellOrder.getOrderType() == OrderType.LIMIT) {

            // Order Book owns this object until it is filled.
            orderBook.getSellOrders().add(sellOrder);

        } else {

            // Fully filled or unused MARKET remainder.
            orderPool.release(sellOrder);
        }
    }

    private void broadcastOrderBook(String symbol) {

        try {

            OrderBookSnapshot snapshot =
                    orderBook.snapshot(symbol);

            String json =
                    objectMapper.writeValueAsString(
                            new MarketMessage(
                                    "ORDER_BOOK",
                                    snapshot
                            )
                    );

            webSocketHandler.broadcast(json);

        } catch (JsonProcessingException e) {

            throw new RuntimeException(
                    "Failed to serialize order book snapshot",
                    e
            );
        }
    }

    private void broadcastTrade(Trade trade) {

        try {

            String json =
                    objectMapper.writeValueAsString(
                            new MarketMessage(
                                    "TRADE",
                                    trade
                            )
                    );

            webSocketHandler.broadcast(json);

        } catch (JsonProcessingException e) {

            throw new RuntimeException(
                    "Failed to serialize trade",
                    e
            );
        }
    }

    public void setBenchmarkMode(boolean benchmarkMode) {
        this.benchmarkMode = benchmarkMode;
    }

    public boolean isBenchmarkMode() {
        return benchmarkMode;
    }
}