package com.orderflow.engine;

import com.orderflow.model.Order;
import com.orderflow.model.OrderBookSnapshot;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.TreeMap;

public class OrderBook {

    // BUY side:
    // Highest price first.
    // At the same price, oldest order first.
    private final PriorityQueue<Order> buyOrders =
            new PriorityQueue<>(
                    Comparator.comparingLong(Order::getPrice)
                            .reversed()
                            .thenComparingLong(Order::getTimestamp)
            );

    // SELL side:
    // Lowest price first.
    // At the same price, oldest order first.
    private final PriorityQueue<Order> sellOrders =
            new PriorityQueue<>(
                    Comparator.comparingLong(Order::getPrice)
                            .thenComparingLong(Order::getTimestamp)
            );

    public PriorityQueue<Order> getBuyOrders() {
        return buyOrders;
    }

    public PriorityQueue<Order> getSellOrders() {
        return sellOrders;
    }

    // Creates Level 2 market-data snapshot.
    // Orders at the same price are aggregated into one price level.
    public OrderBookSnapshot snapshot(String symbol) {

        // Bids: highest price -> lowest price
        Map<Long, Long> bidLevels =
                new TreeMap<>(Comparator.reverseOrder());

        // Asks: lowest price -> highest price
        Map<Long, Long> askLevels =
                new TreeMap<>();

        // Aggregate BUY quantities by price
        for (Order order : buyOrders) {

            bidLevels.merge(
                    order.getPrice(),
                    order.getQuantity(),
                    Long::sum
            );
        }

        // Aggregate SELL quantities by price
        for (Order order : sellOrders) {

            askLevels.merge(
                    order.getPrice(),
                    order.getQuantity(),
                    Long::sum
            );
        }

        List<OrderBookSnapshot.Level> bids =
                new ArrayList<>();

        List<OrderBookSnapshot.Level> asks =
                new ArrayList<>();

        bidLevels.forEach(
                (price, quantity) ->
                        bids.add(
                                new OrderBookSnapshot.Level(
                                        price,
                                        quantity
                                )
                        )
        );

        askLevels.forEach(
                (price, quantity) ->
                        asks.add(
                                new OrderBookSnapshot.Level(
                                        price,
                                        quantity
                                )
                        )
        );

        return new OrderBookSnapshot(
                symbol,
                bids,
                asks
        );
    }
}