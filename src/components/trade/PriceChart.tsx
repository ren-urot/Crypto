"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { generateCandles } from "@/lib/candles";
import type { CoinId } from "@/lib/dashboard-data";

export default function PriceChart({
  coinId,
  currentPrice,
  candleCount = 60,
}: {
  coinId: CoinId;
  currentPrice: number;
  candleCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart: IChartApi = createChart(container, {
      width: container.clientWidth,
      height: 360,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#2d2d2d",
      },
      grid: {
        vertLines: { color: "#f2f2f4" },
        horzLines: { color: "#f2f2f4" },
      },
      timeScale: { timeVisible: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    series.setData(
      generateCandles(coinId, currentPrice, candleCount).map((candle) => ({
        ...candle,
        time: candle.time as UTCTimestamp,
      })),
    );

    function handleResize() {
      if (container) {
        chart.applyOptions({ width: container.clientWidth });
      }
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [coinId, currentPrice, candleCount]);

  return (
    <div className="rounded-[20px] bg-white p-6">
      <div ref={containerRef} />
    </div>
  );
}
