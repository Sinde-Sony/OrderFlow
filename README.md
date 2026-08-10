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



#### Key Features



###### Matching Engine

* Java-based order matching engine
* Buy and sell order processing
* Limit and Market order support
* Price-time priority matching
* Partial order execution
* Trade generation
* In-memory order book





###### High-Performance Processing

* LMAX Disruptor architecture
* Lock-free event processing
* Ring-buffer based order pipeline
* Low allocation processing
* Microsecond-level latency measurement





###### Market Data Gateway

* Spring WebFlux
* WebSocket-based market data streaming
* Real-time trade updates
* Real-time Level 2 order book updates

###### 



###### Trading Terminal

* React + TypeScript
* Professional trading-terminal UI
* Buy/Sell order entry
* Live market connection indicator
* Level 2 market depth
* Recent trade execution tape
* Candlestick visualization
* Trading statistics





###### Canvas Rendering



High-frequency market data is rendered using HTML5 Canvas instead of relying completely on DOM elements.

This helps reduce unnecessary DOM updates when market data changes rapidly.





###### Order Matching Example ->



Suppose order book contains:



SELL

$150.40 × 40

$150.35 × 30

\----------- MARKET -----------

BUY

$150.25 × 20

$150.20 × 50



A trader submits:



BUY

Price: $150.40

Quantity: 20



The matching engine sees that:



BUY $150.40 >= SELL $150.35



Therefore the orders can match.



A trade is generated:



TRADE

Price: $150.35

Quantity: 20



The order book is then updated and the trade is immediately broadcast to connected clients.





###### Performance Benchmark

###### 

The matching engine was benchmarked with:



Orders processed : 100,000

Throughput        : 2,577,160 orders/sec

p99 latency       : 0.40 μs



Benchmark criteria:



Throughput >= 100,000 orders/sec : PASS

p99 latency < 100 μs             : PASS



These measurements demonstrate the performance of the matching-engine benchmark under the test workload.





###### Technology Stack



###### Backend

* Java 21
* Spring Boot
* Spring WebFlux
* LMAX Disruptor
* Maven
* Jackson
* WebSockets



###### Frontend

* React
* TypeScript
* Vite
* HTML5 Canvas
* CSS



###### Architecture

* Event-driven processing
* Ring buffer
* Price-time priority matching
* WebSocket market data
* In-memory order book





##### Project Structure

OrderFlow/

│

├── orderflow-backend/

│   ├── src/

│   │   ├── main/

│   │   └── test/

│   └── pom.xml

│

├── orderflow-frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── hooks/

│   │   └── types/

│   ├── package.json

│   └── vite.config.ts

│

├── .gitignore

└── README.md





##### Running the Backend

##### 

Open a terminal:



cd orderflow-backend



Compile:



mvn clean compile



Start the backend:



mvn spring-boot:run



The WebSocket market-data endpoint is:



ws://localhost:8080/ws/market





##### Running the Frontend



Open another terminal:



cd orderflow-frontend



Install dependencies:



npm install



Start the development server:



npm run dev



Then open the local URL displayed by Vite.





###### Trading Terminal == The frontend provides:



┌─────────────────────────────────────────────┐

│              ORDERFLOW TERMINAL             │

├─────────────────────────────────────────────┤

│ LAST │ BID │ ASK │ SPREAD │ VOLUME │ POWER  │

├──────────────┬────────────────┬─────────────┤

│ ORDER ENTRY  │ AAPL CHART     │ LEVEL 2     │

│              │                │             │

│ BUY / SELL   │ CANDLES        │ ASKS        │

│ PRICE        │                │ MARKET      │

│ QUANTITY     │                │ BIDS        │

├──────────────┴────────────────┴─────────────┤

│              RECENT TRADES                  │

├─────────────────────────────────────────────┤

│ LMAX │ THROUGHPUT │ P99 │ WEBSOCKET LIVE    │

└─────────────────────────────────────────────┘

###### 

###### Core Workflow

1\. Trader enters an order

&#x20;       ↓

2\. Order is submitted to backend

&#x20;       ↓

3\. LMAX Disruptor processes the event

&#x20;       ↓

4\. Matching Engine evaluates the order

&#x20;       ↓

5\. Order Book applies price-time priority

&#x20;       ↓

6\. Matching orders generate a Trade

&#x20;       ↓

7\. Updated Order Book is generated

&#x20;       ↓

8\. WebSocket broadcasts market data

&#x20;       ↓

9\. React receives the update

&#x20;       ↓

10\. Canvas and trading panels update

##### 

##### What This Project Demonstrates

OrderFlow demonstrates practical concepts used in high-performance financial systems:



* Low-latency event processing
* Lock-free messaging concepts
* Order matching algorithms
* Price-time priority
* Market depth representation
* Real-time WebSocket streaming
* High-frequency UI rendering
* Performance benchmarking
* Java backend engineering
* React and TypeScript frontend development

##### 

##### Future Improvements

Possible production-level extensions include:



* Aeron/Kafka market-data distribution
* Risk-management service
* Clearing service
* Persistent trade storage
* Authentication and authorization
* Multiple financial instruments
* Advanced order types
* FIX protocol integration
* Distributed matching-engine architecture
* Production-grade market-data feed

##### 

##### Project Status:- Completed



The current implementation includes the core matching engine, high-throughput benchmark, WebSocket market-data gateway, React trading terminal, Level 2 order book, trade execution feed, and Canvas-based market visualization.





###### Author



Sinde-Sony

