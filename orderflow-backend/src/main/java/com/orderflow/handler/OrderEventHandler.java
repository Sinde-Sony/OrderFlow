package com.orderflow.handler;

import com.lmax.disruptor.EventHandler;
import com.orderflow.benchmark.BenchmarkMetrics;
import com.orderflow.engine.MatchingEngine;
import com.orderflow.engine.OrderPool;
import com.orderflow.event.OrderEvent;
import com.orderflow.model.Order;

public class OrderEventHandler implements EventHandler<OrderEvent> {

    private final MatchingEngine matchingEngine;
    private final OrderPool orderPool;
    private final BenchmarkMetrics benchmarkMetrics;

    public OrderEventHandler(
            MatchingEngine matchingEngine,
            OrderPool orderPool) {

        this(matchingEngine, orderPool, null);
    }

    public OrderEventHandler(
            MatchingEngine matchingEngine,
            OrderPool orderPool,
            BenchmarkMetrics benchmarkMetrics) {

        this.matchingEngine = matchingEngine;
        this.orderPool = orderPool;
        this.benchmarkMetrics = benchmarkMetrics;
    }

    @Override
    public void onEvent(
            OrderEvent event,
            long sequence,
            boolean endOfBatch) {

        Order order = orderPool.acquire();

        order.setOrderId(event.getOrderId());
        order.setSymbol(event.getSymbol());
        order.setSide(event.getSide());
        order.setOrderType(event.getOrderType());
        order.setPrice(event.getPrice());
        order.setQuantity(event.getQuantity());
        order.setTimestamp(event.getTimestamp());

        long orderId = event.getOrderId();

        if (benchmarkMetrics != null) {

            long start = System.nanoTime();

            matchingEngine.processOrder(order);

            long latency = System.nanoTime() - start;

            benchmarkMetrics.record(orderId, latency);

        } else {

            matchingEngine.processOrder(order);
        }
    }
}