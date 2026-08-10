import type { Trade } from "../hooks/useMarketSocket";

interface Props {
    trades: Trade[];
}

export default function RecentTrades({ trades }: Props) {

    return (
        <div className="trades-table">

            <div className="trade-header">
                <span>SYMBOL</span>
                <span>PRICE</span>
                <span>QUANTITY</span>
                <span>BUY ORDER</span>
                <span>SELL ORDER</span>
            </div>

            {trades.length === 0 ? (

                <div className="trades-empty">
                    <span className="empty-pulse" />
                    Waiting for live executions...
                </div>

            ) : (

                <div className="trade-list">

                    {trades.slice(0, 10).map((trade, index) => {

                        const previousTrade = trades[index + 1];

                        let movement = "neutral";

                        if (previousTrade) {
                            if (trade.price > previousTrade.price) {
                                movement = "up";
                            } else if (trade.price < previousTrade.price) {
                                movement = "down";
                            }
                        }

                        return (
                            <div
                                className="trade-row"
                                key={`${trade.buyOrderId}-${trade.sellOrderId}-${index}`}
                            >
                                <span className="trade-symbol">
                                    <span className="symbol-dot" />
                                    {trade.symbol}
                                </span>

                                <span className={`trade-price ${movement}`}>
                                    ${(trade.price / 100).toFixed(2)}
                                </span>

                                <span>
                                    {trade.quantity}
                                </span>

                                <span className="order-id">
                                    #{trade.buyOrderId}
                                </span>

                                <span className="order-id">
                                    #{trade.sellOrderId}
                                </span>
                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
}