import { useEffect, useRef } from "react";
import type { OrderBook as OrderBookData } from "../hooks/useMarketSocket";

interface Props {
    orderBook: OrderBookData;
}

export default function OrderBookCanvas({ orderBook }: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const container = canvas.parentElement;
        if (!container) return;

        /* ---------- RESPONSIVE CANVAS ---------- */

        const dpr = window.devicePixelRatio || 1;

        const width = container.clientWidth;
        const height = 520;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        /* ---------- BACKGROUND ---------- */

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#080d13";
        ctx.fillRect(0, 0, width, height);

        const asks = orderBook.asks.slice(0, 6);
        const bids = orderBook.bids.slice(0, 6);

        const levels = [...asks, ...bids];

        const maxQuantity = Math.max(
            1,
            ...levels.map(level => level.quantity)
        );

        const leftPadding = 14;
        const rightPadding = 14;

        /* ---------- HEADERS ---------- */

        ctx.fillStyle = "#5f6b7c";
        ctx.font = "bold 9px Arial";

        ctx.textAlign = "left";
        ctx.fillText("PRICE", leftPadding, 20);

        ctx.textAlign = "right";

        ctx.fillText(
            "QUANTITY",
            width - rightPadding,
            20
        );

        ctx.strokeStyle = "#1b2430";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(leftPadding, 30);
        ctx.lineTo(width - rightPadding, 30);
        ctx.stroke();

        /* ---------- ROW FUNCTION ---------- */

        const drawLevel = (
            price: number,
            quantity: number,
            y: number,
            type: "ask" | "bid",
            best: boolean
        ) => {

            const rowHeight = 30;

            const barWidth =
                ((width - 28) * quantity) /
                maxQuantity;

            /* Depth bar */

            ctx.fillStyle =
                type === "ask"
                    ? "rgba(240, 91, 104, 0.12)"
                    : "rgba(50, 213, 131, 0.12)";

            ctx.shadowBlur = 8;

        ctx.shadowColor =
        type==="ask"
        ? "#ff5b6e"
        : "#21d07a";

        ctx.fillRect(
        width-rightPadding-barWidth,
        y-15,
        barWidth,
        rowHeight
        );

        ctx.shadowBlur = 0;
            /* Best bid / ask highlight */

            if (best) {

                ctx.fillStyle =
                    type === "ask"
                        ? "rgba(240, 91, 104, 0.08)"
                        : "rgba(50, 213, 131, 0.08)";

                ctx.fillRect(
                    0,
                    y - 15,
                    width,
                    rowHeight
                );
            }

            /* Price */

            ctx.font = best
            ? "bold 14px Inter"
            : "13px Inter";

            ctx.textAlign = "left";

            ctx.fillStyle =
            type === "ask"
            ? "#ff7384"
            : "#38d978";

            ctx.fillText(
                `$${(price / 100).toFixed(2)}`,
                leftPadding,
                y
            );

            /* Quantity */

            ctx.textAlign = "right";

            ctx.fillStyle = "#b9c3d0";

            ctx.fillStyle="#ffffff";

            ctx.fillText(
            quantity.toLocaleString(),
            width-rightPadding,
            y
            );
        };

        /* ---------- ASKS ---------- */

        let y = 55;

        ctx.textAlign = "left";
        ctx.font = "bold 8px Arial";
        ctx.fillStyle = "#a34853";
        ctx.fillText("ASKS", leftPadding, y);

        y += 25;

        if (asks.length === 0) {

            ctx.fillStyle = "#465162";
            ctx.font = "10px Arial";

            ctx.fillText(
                "No resting asks",
                leftPadding,
                y
            );

            y += 25;

        } else {

            /*
             * Reverse display so the best ask is closest
             * to the market separator.
             */
            [...asks].reverse().forEach(
                (level, index, array) => {

                    drawLevel(
                        level.price,
                        level.quantity,
                        y,
                        "ask",
                        index === array.length - 1
                    );

                    y += 27;
                }
            );
        }

        /* ---------- MARKET SEPARATOR ---------- */

        const bestAsk =
            asks.length > 0
                ? asks[0].price / 100
                : null;

        const bestBid =
            bids.length > 0
                ? bids[0].price / 100
                : null;

        let marketText = "MARKET";

        if (bestAsk !== null && bestBid !== null) {

            const spread =
                bestAsk - bestBid;

            marketText =
                `SPREAD $${spread.toFixed(2)}`;
        }

        y += 4;

        ctx.strokeStyle = "#2a3442";

        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();

        ctx.fillStyle = "#7d899b";
        ctx.font = "bold 8px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            marketText,
            width / 2,
            y + 17
        );

        y += 35;

        /* ---------- BIDS ---------- */

        ctx.textAlign = "left";
        ctx.fillStyle = "#328c63";
        ctx.font = "bold 8px Arial";

        ctx.fillText("BIDS", leftPadding, y);

        y += 25;

        if (bids.length === 0) {

            ctx.fillStyle = "#465162";
            ctx.font = "10px Arial";

            ctx.fillText(
                "No resting bids",
                leftPadding,
                y
            );

        } else {

            bids.forEach((level, index) => {

                drawLevel(
                    level.price,
                    level.quantity,
                    y,
                    "bid",
                    index === 0
                );

                y += 27;
            });
        }

    }, [orderBook]);

    return (
        <canvas
            ref={canvasRef}
            className="orderbook-canvas"
        />
    );
}