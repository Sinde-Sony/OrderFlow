package com.orderflow.config;

import com.lmax.disruptor.BusySpinWaitStrategy;
import com.lmax.disruptor.dsl.Disruptor;
import com.orderflow.engine.MatchingEngine;
import com.orderflow.engine.OrderPool;
import com.orderflow.event.OrderEvent;
import com.orderflow.event.OrderEventFactory;
import com.orderflow.event.OrderEventProducer;
import com.orderflow.handler.OrderEventHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ThreadFactory;

@Configuration
public class DisruptorConfig {

    // Power of 2 as required by Disruptor
    private static final int BUFFER_SIZE = 1024;

    @Bean(destroyMethod = "shutdown")
    public Disruptor<OrderEvent> disruptor(
            MatchingEngine matchingEngine,
            OrderPool orderPool) {

        ThreadFactory threadFactory = runnable -> {

            Thread thread = new Thread(runnable);

            thread.setName("orderflow-matching-engine");
            thread.setDaemon(true);

            return thread;
        };

        Disruptor<OrderEvent> disruptor =
                new Disruptor<>(
                        new OrderEventFactory(),
                        BUFFER_SIZE,
                        threadFactory,
                        com.lmax.disruptor.dsl.ProducerType.MULTI,
                        new BusySpinWaitStrategy()
                );

        disruptor.handleEventsWith(
                new OrderEventHandler(
                        matchingEngine,
                        orderPool
                )
        );

        disruptor.start();

        return disruptor;
    }

    @Bean
    public OrderEventProducer orderEventProducer(
            Disruptor<OrderEvent> disruptor) {

        return new OrderEventProducer(
                disruptor.getRingBuffer()
        );
    }
}