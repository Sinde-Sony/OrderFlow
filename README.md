\# OrderFlow



\## High-Performance Trading Terminal



OrderFlow is a high-throughput electronic trading system that demonstrates how a low-latency trading platform can receive orders, match buy and sell orders using price-time priority, and stream real-time market data to a React trading terminal.



The project combines a Java matching engine with LMAX Disruptor and a React + Canvas frontend connected through WebSockets.



\---



\## Project Overview



Traditional request-processing applications can introduce latency when handling a large number of concurrent requests.



OrderFlow is designed around a low-latency architecture:



```text

Trader

&#x20;  │

&#x20;  ▼

React Trading Terminal

&#x20;  │

&#x20;  │ WebSocket

&#x20;  ▼

Spring WebFlux

&#x20;  │

&#x20;  ▼

LMAX Disruptor

&#x20;  │

&#x20;  ▼

Matching Engine

&#x20;  │

&#x20;  ▼

Price-Time Priority Order Book

&#x20;  │

&#x20;  ├── Trade Execution

&#x20;  │

&#x20;  └── Market Data

&#x20;         │

&#x20;         ▼

&#x20;    React + Canvas

