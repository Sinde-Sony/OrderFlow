import type { OrderBook as OrderBookData } from "../hooks/useMarketSocket";

interface Props {
    orderBook: OrderBookData;
}

export default function OrderBook({ orderBook }: Props) {

    const formatPrice = (price: number) =>
        (price / 100).toFixed(2);

    return (
        <section className="panel">

            <h2>Order Book</h2>

            <div className="book-header">
                <span>Price</span>
                <span>Quantity</span>
            </div>

            <div className="asks">

                {orderBook.asks.map((level) => (
                    <div
                        className="book-row ask"
                        key={level.price}
                    >
                        <span>${formatPrice(level.price)}</span>
                        <span>{level.quantity}</span>
                    </div>
                ))}

            </div>

            <div className="spread">
                MARKET
            </div>

            <div className="bids">

                {orderBook.bids.map((level) => (
                    <div
                        className="book-row bid"
                        key={level.price}
                    >
                        <span>${formatPrice(level.price)}</span>
                        <span>{level.quantity}</span>
                    </div>
                ))}

            </div>

        </section>
    );
}