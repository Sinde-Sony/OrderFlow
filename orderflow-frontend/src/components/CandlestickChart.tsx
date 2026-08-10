import { useEffect, useRef } from "react";
import type { Trade } from "../hooks/useMarketSocket";

interface Props {
    trades: Trade[];
}

interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
}

export default function CandlestickChart({ trades }: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        const draw = () => {

            const rect = container.getBoundingClientRect();

            const width = Math.max(300, rect.width);
            const height = Math.max(300, rect.height);

            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = "#111722";
            ctx.fillRect(0, 0, width, height);

            // Title
            ctx.fillStyle = "#e8edf5";
            ctx.font = "bold 18px Arial";
            ctx.fillText(
                "AAPL Candlestick Chart",
                20,
                30
            );

            // No trades yet
            if (trades.length === 0) {

                ctx.fillStyle = "#707c90";
                ctx.font = "14px Arial";

                ctx.fillText(
                    "Waiting for trade data...",
                    20,
                    65
                );

                return;
            }

            // Trades are newest first
            const chronologicalTrades =
                [...trades].reverse();

            // Create one candle from every 5 trades
            const candles: Candle[] = [];

            for (
                let i = 0;
                i < chronologicalTrades.length;
                i += 5
            ) {

                const group =
                    chronologicalTrades.slice(i, i + 5);

                const prices =
                    group.map(
                        trade => trade.price / 100
                    );

                candles.push({
                    open: prices[0],
                    high: Math.max(...prices),
                    low: Math.min(...prices),
                    close:
                        prices[prices.length - 1]
                });
            }

            // Show latest 15 candles
            const visibleCandles =
                candles.slice(-15);

            const highs =
                visibleCandles.map(
                    candle => candle.high
                );

            const lows =
                visibleCandles.map(
                    candle => candle.low
                );

            let maxPrice = Math.max(...highs);
            let minPrice = Math.min(...lows);

            // Prevent division by zero
            if (maxPrice === minPrice) {
                maxPrice += 0.05;
                minPrice -= 0.05;
            }

            // Chart dimensions
            const chartLeft = 25;
            const chartRight = width - 60;
            const chartTop = 55;
            const chartBottom = height - 30;

            const chartWidth =
                chartRight - chartLeft;

            const chartHeight =
                chartBottom - chartTop;

            // =========================
            // GRID
            // =========================

            ctx.strokeStyle = "#1d2632";
            ctx.lineWidth = 1;

            for (let i = 0; i <= 6; i++) {

                const y =
                    chartTop +
                    (chartHeight / 6) * i;

                ctx.beginPath();

                ctx.moveTo(
                    chartLeft,
                    y
                );

                ctx.lineTo(
                    chartRight,
                    y
                );

                ctx.stroke();

                const price =
                    maxPrice -
                    ((maxPrice - minPrice) / 6) * i;

                ctx.fillStyle = "#596678";
                ctx.font = "10px monospace";

                ctx.fillText(
                    `$${price.toFixed(2)}`,
                    chartRight + 5,
                    y + 3
                );
            }

            // =========================
            // PRICE → Y POSITION
            // =========================

            const priceToY = (price: number) =>
                chartTop +
                ((maxPrice - price) /
                    (maxPrice - minPrice)) *
                chartHeight;

            // =========================
            // CANDLE SIZE
            // =========================

            const spacing =
                chartWidth /
                Math.max(
                    visibleCandles.length,
                    1
                );

            const candleWidth =
                Math.min(
                    24,
                    spacing * 0.55
                );

            // =========================
            // DRAW CANDLES
            // =========================

            visibleCandles.forEach(
                (candle, index) => {

                    const x =
                        chartLeft +
                        index * spacing +
                        spacing / 2;

                    const openY =
                        priceToY(candle.open);

                    const closeY =
                        priceToY(candle.close);

                    const highY =
                        priceToY(candle.high);

                    const lowY =
                        priceToY(candle.low);

                    const rising =
                        candle.close >= candle.open;

                    const color =
                        rising
                            ? "#31d07c"
                            : "#ff6675";

                    // Wick
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;

                    ctx.beginPath();

                    ctx.moveTo(
                        x,
                        highY
                    );

                    ctx.lineTo(
                        x,
                        lowY
                    );

                    ctx.stroke();

                    // Candle body
                    ctx.fillStyle = color;

                    const bodyTop =
                        Math.min(
                            openY,
                            closeY
                        );

                    const bodyHeight =
                        Math.max(
                            Math.abs(
                                closeY - openY
                            ),
                            3
                        );

                    ctx.fillRect(
                        x - candleWidth / 2,
                        bodyTop,
                        candleWidth,
                        bodyHeight
                    );
                }
            );

            // =========================
            // CURRENT PRICE
            // =========================

            const currentPrice =
                visibleCandles[
                    visibleCandles.length - 1
                ].close;

            const currentY =
                priceToY(currentPrice);

            // Current price line
            ctx.strokeStyle = "#31d07c";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();

            ctx.moveTo(
                chartLeft,
                currentY
            );

            ctx.lineTo(
                chartRight,
                currentY
            );

            ctx.stroke();

            ctx.setLineDash([]);

            // Current price label
            ctx.fillStyle = "#31d07c";

            ctx.fillRect(
                chartRight - 2,
                currentY - 10,
                55,
                20
            );

            ctx.fillStyle = "#07140e";
            ctx.font = "bold 10px monospace";

            ctx.fillText(
                `$${currentPrice.toFixed(2)}`,
                chartRight + 3,
                currentY + 3
            );
        };

        // Initial drawing
        draw();

        // Redraw whenever the panel changes size
        const observer =
            new ResizeObserver(draw);

        observer.observe(container);

        return () => {
            observer.disconnect();
        };

    }, [trades]);

    return (
        <canvas
            ref={canvasRef}
            className="candlestick-canvas"
        />
    );
}