package com.orderflow.service;

import com.orderflow.event.OrderEventProducer;
import com.orderflow.model.Order;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderEventProducer orderEventProducer;

    public OrderService(OrderEventProducer orderEventProducer) {
        this.orderEventProducer = orderEventProducer;
    }

    public Order submitOrder(Order order) {

        if (order.getTimestamp() == 0) {
            order.setTimestamp(System.nanoTime());
        }

        orderEventProducer.publish(order);

        return order;
    }
}