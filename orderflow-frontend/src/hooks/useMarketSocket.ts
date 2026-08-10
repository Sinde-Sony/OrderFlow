import { useEffect, useState } from "react";

export interface Level {
    price: number;
    quantity: number;
}

export interface OrderBook {
    symbol: string;
    bids: Level[];
    asks: Level[];
}

export interface Trade {
    buyOrderId: number;
    sellOrderId: number;
    symbol: string;
    price: number;
    quantity: number;
    timestamp: number;
}
export interface RiskEvent {
    approved: boolean;
    reason: string;
}

interface MarketMessage {
    type: "TRADE" | "ORDER_BOOK" ;
    data: Trade | OrderBook | RiskEvent;
}

export function useMarketSocket() {

    const [trades, setTrades] = useState<Trade[]>([]);

    const [orderBook, setOrderBook] = useState<OrderBook>({
        symbol: "AAPL",
        bids: [],
        asks: []
    });

    const [connected, setConnected] = useState(false);
    const [account] = useState({
    cash: 10000,
    buyingPower: 20000,
    position: 100
});
    
    useEffect(() => {

        const socket =
            new WebSocket("ws://localhost:8080/ws/market");

        socket.onopen = () => {
    console.log("✅ OPEN");
    setConnected(true);
};

socket.onclose = (event) => {
    console.log("❌ CLOSED", event.code, event.reason);
    setConnected(false);
};

socket.onerror = (event) => {
    console.error("❌ ERROR", event);
};

        socket.onmessage = (event) => {
            

            try {

                const message: MarketMessage =
                    JSON.parse(event.data);

                if (message.type === "TRADE") {

                    const trade = message.data as Trade;

                    setTrades(previous =>
                        [trade, ...previous].slice(0, 100)
                    );

                }

                if (message.type === "ORDER_BOOK") {

                    setOrderBook(
                        message.data as OrderBook
                    );

                }
                

            } catch (error) {

                console.error(
                    "Invalid market message:",
                    error
                );
                

            }
            
        };

        return () => socket.close();

    }, []);

    return {
    trades,
    orderBook,
    connected,
    account
};
}

