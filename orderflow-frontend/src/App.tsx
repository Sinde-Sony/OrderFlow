import "./App.css";

import OrderEntry from "./components/OrderEntry";
import OrderBookCanvas from "./components/OrderBookCanvas";
import RecentTrades from "./components/RecentTrades";
import CandlestickChart from "./components/CandlestickChart";
import { useMarketSocket } from "./hooks/useMarketSocket";

function App() {
    const {
        trades,
        orderBook,
        connected,
        account
    } = useMarketSocket();

    const latestTrade = trades[0];

    const lastPrice = latestTrade
        ? latestTrade.price / 100
        : 150.25;

    const bestBid =
        orderBook.bids.length > 0
            ? orderBook.bids[0].price / 100
            : lastPrice - 0.05;

    const bestAsk =
        orderBook.asks.length > 0
            ? orderBook.asks[0].price / 100
            : lastPrice + 0.05;

    const spread = bestAsk - bestBid;

    const totalVolume = trades.reduce(
        (total, trade) => total + trade.quantity,
        0
    );

    const priceChange =
        trades.length > 1
            ? lastPrice - trades[trades.length - 1].price / 100
            : 0;

    const changePercent =
        trades.length > 1 &&
        trades[trades.length - 1].price !== 0
            ? (priceChange /
                (trades[trades.length - 1].price / 100)) *
              100
            : 0;

    return (
        <main className="terminal">

            {/* ================= TOP BAR ================= */}

            <header className="topbar">

                <div className="brand">

                    <div className="brand-mark">
                        OF
                    </div>

                    <div>
                        <h1>OrderFlow</h1>
                        <p>
                            High-Performance Trading Terminal
                        </p>
                    </div>

                </div>

                <div className="top-market">

                    <div className="top-symbol">
                        <strong>AAPL</strong>
                        <span>NASDAQ</span>
                    </div>

                    <div className="top-price">
                        <strong>
                            ${lastPrice.toFixed(2)}
                        </strong>

                        <span
                            className={
                                changePercent >= 0
                                    ? "positive"
                                    : "negative"
                            }
                        >
                            {changePercent >= 0 ? "▲" : "▼"}{" "}
                            {Math.abs(changePercent).toFixed(2)}%
                        </span>
                    </div>

                </div>

                <div
                    className={`connection ${
                        connected ? "connected" : ""
                    }`}
                >

                    <span
                        className={`status ${
                            connected
                                ? "online"
                                : "offline"
                        }`}
                    />

                    {connected
                        ? "MARKET CONNECTED"
                        : "DISCONNECTED"}

                </div>

            </header>


            {/* ================= MARKET STRIP ================= */}

            <section className="market-strip">

                <div className="market-stat">

                    <span>LAST</span>

                    <strong>
                        ${lastPrice.toFixed(2)}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>BID</span>

                    <strong className="bid-text">
                        ${bestBid.toFixed(2)}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>ASK</span>

                    <strong className="ask-text">
                        ${bestAsk.toFixed(2)}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>SPREAD</span>

                    <strong>
                        ${spread.toFixed(2)}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>VOLUME</span>

                    <strong>
                        {totalVolume.toLocaleString()}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>POSITION</span>

                    <strong>
                        {account.position}
                    </strong>

                </div>

                <div className="market-stat">

                    <span>BUYING POWER</span>

                    <strong>
                        ${account.buyingPower.toLocaleString()}
                    </strong>

                </div>

            </section>


            {/* ================= MAIN WORKSPACE ================= */}

            <section className="workspace">

                {/* ORDER ENTRY */}

                <aside className="panel order-entry-panel">

                    <div className="panel-heading">

                        <div>
                            <span className="eyebrow">
                                EXECUTION
                            </span>

                            <h2>
                                Order Entry
                            </h2>
                        </div>

                        <span className="panel-tag">
                            AAPL
                        </span>

                    </div>

                    <OrderEntry />

                </aside>


                {/* CHART */}

                <section className="panel chart-panel">

                    <div className="panel-heading">

                        <div>

                            <span className="eyebrow">
                                MARKET
                            </span>

                            <h2>
                                AAPL / USD
                            </h2>

                        </div>

                        <div className="chart-status">

                            <span className="chart-live-dot" />

                            LIVE

                        </div>

                    </div>

                    <div className="chart-area">

                        <CandlestickChart
                            trades={trades}
                        />

                    </div>

                </section>


                {/* ORDER BOOK */}

                <aside className="panel book-panel">

                    <div className="panel-heading">

                        <div>

                            <span className="eyebrow">
                                MARKET DEPTH
                            </span>

                            <h2>
                                Level 2
                            </h2>

                        </div>

                        <span className="live-label">
                            LIVE
                        </span>

                    </div>

                    <OrderBookCanvas
                        orderBook={orderBook}
                    />

                </aside>

            </section>


            {/* ================= RECENT TRADES ================= */}

            <section className="panel trades-panel">

                <div className="panel-heading">

                    <div>

                        <span className="eyebrow">
                            EXECUTION TAPE
                        </span>

                        <h2>
                            Recent Trades
                        </h2>

                    </div>

                    <span className="trade-count">

                        {trades.length} executions

                    </span>

                </div>

                <RecentTrades
                    trades={trades}
                />

            </section>


            {/* ================= FOOTER ================= */}

            <footer className="performance-bar">

                <div className="engine-status">

                    <span className="metric-dot" />

                    LMAX DISRUPTOR

                </div>

                <div>

                    <span>
                        BENCHMARK
                    </span>

                    <strong>
                        2.58M orders/s
                    </strong>

                </div>

                <div>

                    <span>
                        P99
                    </span>

                    <strong>
                        0.40 μs
                    </strong>

                </div>

                <div>

                    <span>
                        MATCHING
                    </span>

                    <strong>
                        PRICE-TIME
                    </strong>

                </div>

                <div
                    className={
                        connected
                            ? "positive"
                            : "negative"
                    }
                >

                    ●{" "}
                    {connected
                        ? "WEBSOCKET LIVE"
                        : "WEBSOCKET OFFLINE"}

                </div>

            </footer>

        </main>
    );
}

export default App;