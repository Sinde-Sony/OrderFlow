package com.orderflow.benchmark;

import com.lmax.disruptor.BusySpinWaitStrategy;
import com.lmax.disruptor.dsl.Disruptor;
import com.orderflow.engine.MatchingEngine;
import com.orderflow.engine.OrderPool;
import com.orderflow.event.OrderEvent;
import com.orderflow.event.OrderEventFactory;
import com.orderflow.event.OrderEventProducer;
import com.orderflow.handler.OrderEventHandler;
import com.orderflow.model.Order;
import com.orderflow.model.OrderSide;
import com.orderflow.model.OrderType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.concurrent.ThreadFactory;

@Component
public class MatchingEngineBenchmark implements CommandLineRunner {

    private static final int ORDER_COUNT = 100_000;
    private static final int BUFFER_SIZE = 65_536;

    private final MatchingEngine matchingEngine;
    private final OrderPool orderPool;

    public MatchingEngineBenchmark(
            MatchingEngine matchingEngine,
            OrderPool orderPool) {

        this.matchingEngine = matchingEngine;
        this.orderPool = orderPool;
    }

    @Override
    public void run(String... args) throws Exception {

        boolean runBenchmark =
                Arrays.asList(args).contains("--benchmark");

        if (!runBenchmark) {
            return;
        }

        System.out.println();
        System.out.println("ORDERFLOW LATENCY AUDIT");
        System.out.println("=======================");

        matchingEngine.setBenchmarkMode(true);

        BenchmarkMetrics metrics =
                new BenchmarkMetrics(ORDER_COUNT);

        ThreadFactory threadFactory = runnable -> {
            Thread thread = new Thread(runnable);
            thread.setName("orderflow-benchmark");
            thread.setDaemon(true);
            return thread;
        };

        Disruptor<OrderEvent> benchmarkDisruptor =
                new Disruptor<>(
                        new OrderEventFactory(),
                        BUFFER_SIZE,
                        threadFactory,
                        com.lmax.disruptor.dsl.ProducerType.SINGLE,
                        new BusySpinWaitStrategy()
                );

        benchmarkDisruptor.handleEventsWith(
                new OrderEventHandler(
                        matchingEngine,
                        orderPool,
                        metrics
                )
        );

        benchmarkDisruptor.start();

        OrderEventProducer producer =
                new OrderEventProducer(
                        benchmarkDisruptor.getRingBuffer()
                );

        // Warm up JVM/JIT before measuring.
        for (int i = 0; i < 10_000; i++) {

            Order warmup = new Order();

            warmup.setOrderId(i);
            warmup.setSymbol("AAPL");
            warmup.setSide(
                    i % 2 == 0
                            ? OrderSide.BUY
                            : OrderSide.SELL
            );
            warmup.setOrderType(OrderType.MARKET);
            warmup.setPrice(15_000);
            warmup.setQuantity(1);
            warmup.setTimestamp(System.nanoTime());

            // Process directly only for JVM warm-up.
            matchingEngine.processOrder(warmup);
        }

        long benchmarkStart = System.nanoTime();

        for (int i = 0; i < ORDER_COUNT; i++) {

            Order order = new Order();

            order.setOrderId(i);
            order.setSymbol("AAPL");

            // Alternating orders provide matching workload.
            order.setSide(
                    i % 2 == 0
                            ? OrderSide.BUY
                            : OrderSide.SELL
            );

            order.setOrderType(OrderType.LIMIT);

            // Same price ensures orders can cross.
            order.setPrice(15_000);

            order.setQuantity(1);

            // Timestamp immediately before publication.
            order.setTimestamp(System.nanoTime());

            producer.publish(order);
        }

        metrics.await();

        long benchmarkEnd = System.nanoTime();

        benchmarkDisruptor.shutdown();

        matchingEngine.setBenchmarkMode(false);

        printResults(
                metrics.getLatencies(),
                benchmarkEnd - benchmarkStart
        );
    }

    private void printResults(
            long[] latencies,
            long totalNanos) {

        long[] sorted =
                Arrays.copyOf(
                        latencies,
                        latencies.length
                );

        Arrays.sort(sorted);

        double seconds =
                totalNanos / 1_000_000_000.0;

        double throughput =
                ORDER_COUNT / seconds;

        double p50 =
                percentile(sorted, 0.50) / 1_000.0;

        double p95 =
                percentile(sorted, 0.95) / 1_000.0;

        double p99 =
                percentile(sorted, 0.99) / 1_000.0;

        double max =
                sorted[sorted.length - 1] / 1_000.0;

        System.out.println();
        System.out.println("Orders processed : " + ORDER_COUNT);

        System.out.printf(
                "Duration         : %.3f s%n",
                seconds
        );

        System.out.printf(
                "Throughput       : %,.0f orders/sec%n",
                throughput
        );

        System.out.printf("p50 latency      : %.2f us%n", p50);
        System.out.printf("p95 latency      : %.2f us%n", p95);
        System.out.printf("p99 latency      : %.2f us%n", p99);
        System.out.printf("Max latency      : %.2f us%n", max);

        System.out.println();

        System.out.println(
                "Throughput >= 100,000/sec : " +
                        (throughput >= 100_000
                                ? "PASS"
                                : "FAIL")
        );

        System.out.println(
                "p99 < 100 us              : " +
                        (p99 < 100
                                ? "PASS"
                                : "FAIL")
        );

        System.out.println("=======================");
    }

    private long percentile(
            long[] sorted,
            double percentile) {

        int index =
                (int) Math.ceil(
                        percentile * sorted.length
                ) - 1;

        index = Math.max(
                0,
                Math.min(index, sorted.length - 1)
        );

        return sorted[index];
    }
}