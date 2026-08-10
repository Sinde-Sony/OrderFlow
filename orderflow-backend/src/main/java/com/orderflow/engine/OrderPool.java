package com.orderflow.engine;

import com.orderflow.model.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;

@Component
public class OrderPool {

    private static final int INITIAL_SIZE = 100_000;

    private final Deque<Order> pool =
            new ArrayDeque<>(INITIAL_SIZE);

    public OrderPool() {
        for (int i = 0; i < INITIAL_SIZE; i++) {
            pool.push(new Order());
        }
    }

    public Order acquire() {

        Order order = pool.pollFirst();

        return order != null
                ? order
                : new Order();
    }

    public void release(Order order) {

        if (order == null) {
            return;
        }

        pool.offerFirst(order);
    }

    public int available() {
        return pool.size();
    }
}