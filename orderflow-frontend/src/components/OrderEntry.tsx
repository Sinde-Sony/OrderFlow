import { useState } from "react";

export default function OrderEntry() {

    const [side, setSide] = useState<"BUY" | "SELL">("BUY");
    const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
    const [price, setPrice] = useState("150.25");
    const [quantity, setQuantity] = useState("10");

    const submitOrder = async () => {

        const order = {
            orderId: Date.now(),
            symbol: "AAPL",
            side,
            orderType,

            // $150.25 -> 15025
            price: Math.round(Number(price) * 100),

            quantity: Number(quantity)
        };

        try {

            const response = await fetch(
                "http://localhost:8080/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(order)
                }
            );

            if (!response.ok) {
                throw new Error("Order submission failed");
            }

            console.log("Order submitted:", order);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="panel">

            

            <div className="side-buttons">

                <button
                    className={side === "BUY" ? "buy active" : "buy"}
                    onClick={() => setSide("BUY")}
                >
                    BUY
                </button>

                <button
                    className={side === "SELL" ? "sell active" : "sell"}
                    onClick={() => setSide("SELL")}
                >
                    SELL
                </button>

            </div>

            <label>Order Type</label>

            <select
                value={orderType}
                onChange={(e) =>
                    setOrderType(e.target.value as "LIMIT" | "MARKET")
                }
            >
                <option value="LIMIT">Limit</option>
                <option value="MARKET">Market</option>
            </select>

            <label>Price</label>

            <input
                type="number"
                step="0.01"
                value={price}
                disabled={orderType === "MARKET"}
                onChange={(e) => setPrice(e.target.value)}
            />

            <label>Quantity</label>

            <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(e.target.value)}
            />

            <button
                className={`submit ${side.toLowerCase()}`}
                onClick={submitOrder}
            >
                {side} AAPL
            </button>

        </section>
    );
}