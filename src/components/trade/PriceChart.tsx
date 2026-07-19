"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { generateCandles, type Candle } from "@/lib/candles";
import { formatUsd, type CoinId } from "@/lib/dashboard-data";

const MA_PERIODS = [
  { period: 5, color: "#f5a623" },
  { period: 10, color: "#7b61ff" },
  { period: 20, color: "#22b8cf" },
] as const;

function computeMA(candles: Candle[], period: number) {
  const points: { time: UTCTimestamp; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    points.push({ time: candles[i].time as UTCTimestamp, value: sum / period });
  }
  return points;
}

type Legend = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  rangePercent: number;
  ma: Record<number, number | undefined>;
};

function buildLegend(candle: Candle, ma: Record<number, number | undefined>): Legend {
  return {
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    change: candle.close - candle.open,
    changePercent: candle.open ? ((candle.close - candle.open) / candle.open) * 100 : 0,
    rangePercent: candle.low ? ((candle.high - candle.low) / candle.low) * 100 : 0,
    ma,
  };
}

export default function PriceChart({
  coinId,
  currentPrice,
  candleCount = 60,
  dailyVolume,
}: {
  coinId: CoinId;
  currentPrice: number;
  candleCount?: number;
  dailyVolume?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [legend, setLegend] = useState<Legend | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const candles = generateCandles(coinId, currentPrice, candleCount, dailyVolume);

    const chart: IChartApi = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#2d2d2d",
        panes: { separatorColor: "#e5e5e5" },
      },
      grid: {
        vertLines: { color: "#f2f2f4" },
        horzLines: { color: "#f2f2f4" },
      },
      timeScale: { timeVisible: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });
    candleSeries.setData(
      candles.map((candle) => ({ ...candle, time: candle.time as UTCTimestamp })),
    );

    const maSeriesByPeriod = new Map<number, ISeriesApi<"Line">>();
    for (const { period, color } of MA_PERIODS) {
      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      series.setData(computeMA(candles, period));
      maSeriesByPeriod.set(period, series);
    }

    const volumeSeries = chart.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" }, priceLineVisible: false, lastValueVisible: false },
      1,
    );
    volumeSeries.setData(
      candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        value: candle.volume,
        color: candle.close >= candle.open ? "#16a34a80" : "#dc262680",
      })),
    );

    const panes = chart.panes();
    panes[0]?.setStretchFactor(4);
    panes[1]?.setStretchFactor(1);

    function maAtIndex(index: number): Record<number, number | undefined> {
      const result: Record<number, number | undefined> = {};
      for (const { period } of MA_PERIODS) {
        result[period] =
          index >= period - 1
            ? candles.slice(index - period + 1, index + 1).reduce((sum, c) => sum + c.close, 0) / period
            : undefined;
      }
      return result;
    }

    const lastIndex = candles.length - 1;
    if (lastIndex >= 0) {
      setLegend(buildLegend(candles[lastIndex], maAtIndex(lastIndex)));
    }

    function handleCrosshairMove(param: MouseEventParams) {
      const hoverTime = param.time as UTCTimestamp | undefined;
      if (!hoverTime) {
        if (lastIndex >= 0) {
          setLegend(buildLegend(candles[lastIndex], maAtIndex(lastIndex)));
        }
        return;
      }
      const index = candles.findIndex((candle) => candle.time === hoverTime);
      if (index === -1) return;
      setLegend(buildLegend(candles[index], maAtIndex(index)));
    }
    chart.subscribeCrosshairMove(handleCrosshairMove);

    function handleResize() {
      if (container) {
        chart.applyOptions({ width: container.clientWidth });
      }
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [coinId, currentPrice, candleCount, dailyVolume]);

  return (
    <div className="rounded-[20px] bg-white p-[10px] md:p-6">
      {legend && (
        <div className="mb-2 hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs md:flex">
          <span className="text-[#929292]">
            {new Date(legend.time * 1000).toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-[#929292]">
            O <span className="text-[#2d2d2d]">{formatUsd(legend.open)}</span>
          </span>
          <span className="text-[#929292]">
            H <span className="text-[#2d2d2d]">{formatUsd(legend.high)}</span>
          </span>
          <span className="text-[#929292]">
            L <span className="text-[#2d2d2d]">{formatUsd(legend.low)}</span>
          </span>
          <span className="text-[#929292]">
            C <span className="text-[#2d2d2d]">{formatUsd(legend.close)}</span>
          </span>
          <span className="text-[#929292]">
            Change{" "}
            <span className={legend.change >= 0 ? "text-green-600" : "text-red-600"}>
              {legend.change >= 0 ? "+" : ""}
              {legend.change.toFixed(2)} ({legend.changePercent >= 0 ? "+" : ""}
              {legend.changePercent.toFixed(2)}%)
            </span>
          </span>
          <span className="text-[#929292]">
            Range <span className="text-[#2d2d2d]">{legend.rangePercent.toFixed(2)}%</span>
          </span>
          {MA_PERIODS.map(({ period, color }) => (
            <span key={period} style={{ color }}>
              MA({period}){" "}
              {legend.ma[period] !== undefined ? formatUsd(legend.ma[period]!) : "--"}
            </span>
          ))}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
