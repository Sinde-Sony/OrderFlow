package com.orderflow.controller;

import com.orderflow.model.Order;
import com.orderflow.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> submitOrder(@RequestBody Order order) {

        Order submittedOrder = orderService.submitOrder(order);

        return ResponseEntity.accepted().body(submittedOrder);
    }
}