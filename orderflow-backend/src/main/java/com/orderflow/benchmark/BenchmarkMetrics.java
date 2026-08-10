package com.orderflow.benchmark;

import java.util.concurrent.CountDownLatch;

public class BenchmarkMetrics {

    private final long[] latencies;
    private final CountDownLatch latch;

    public BenchmarkMetrics(int orderCount) {
        this.latencies = new long[orderCount];
        this.latch = new CountDownLatch(orderCount);
    }

    public void record(long orderId, long latency) {

        int index = (int) orderId;

        if (index >= 0 && index < latencies.length) {
            latencies[index] = latency;
        }

        latch.countDown();
    }

    public void await() throws InterruptedException {
        latch.await();
    }

    public long[] getLatencies() {
        return latencies;
    }
}