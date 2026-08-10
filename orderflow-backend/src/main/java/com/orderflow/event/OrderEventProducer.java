package com.orderflow.event;

import com.lmax.disruptor.RingBuffer;
import com.orderflow.model.Order;

public class OrderEventProducer {

    private final RingBuffer<OrderEvent> ringBuffer;

    public OrderEventProducer(RingBuffer<OrderEvent> ringBuffer) {
        this.ringBuffer = ringBuffer;
    }

    public void publish(Order order) {

        long sequence = ringBuffer.next();

        try {

            OrderEvent event = ringBuffer.get(sequence);

            event.setOrderId(order.getOrderId());
            event.setSymbol(order.getSymbol());
            event.setSide(order.getSide());
            event.setOrderType(order.getOrderType());
            event.setPrice(order.getPrice());
            event.setQuantity(order.getQuantity());
            event.setTimestamp(order.getTimestamp());

        } finally {

            ringBuffer.publish(sequence);
        }
    }
}