"use client";

import { useState } from "react";
import { generateOrderBook, type OrderBookRow } from "@/lib/order-book";
import { getRecentTrades } from "@/lib/trade-feed";
import { formatUsd, type CoinId } from "@/lib/dashboard-data";

const PRECISION_STEPS = [0.01, 0.1, 1, 10];

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export default function OrderBook({
  coinId,
  currentPrice,
  onSelectPrice,
}: {
  coinId: CoinId;
  currentPrice: number;
  onSelectPrice: (price: number) => void;
}) {
  const [tab, setTab] = useState<"book" | "trades">("book");
  const [precision, setPrecision] = useState(PRECISION_STEPS[1]);
  const { bids, asks } = generateOrderBook(coinId, currentPrice);
  const trades = getRecentTrades(coinId, currentPrice);

  const totalBidVolume = bids.reduce((sum, row) => sum + row.amount, 0);
  const totalAskVolume = asks.reduce((sum, row) => sum + row.amount, 0);
  const totalVolume = totalBidVolume + totalAskVolume;
  const bidPercent = totalVolume > 0 ? (totalBidVolume / totalVolume) * 100 : 50;
  const maxAmount = Math.max(...bids.map((row) => row.amount), ...asks.map((row) => row.amount));

  function DepthRow({ row, side }: { row: OrderBookRow; side: "bid" | "ask" }) {
    const barWidth = maxAmount > 0 ? (row.amount / maxAmount) * 100 : 0;
    return (
      <button
        type="button"
        onClick={() => onSelectPrice(row.price)}
        className="relative flex w-full justify-between overflow-hidden rounded-md px-2 py-1 text-sm hover:bg-[#f2f2f4]"
      >
        <span
          className={`absolute inset-y-0 right-0 ${side === "bid" ? "bg-green-100" : "bg-red-100"}`}
          style={{ width: `${barWidth}%` }}
        />
        <span className={`relative z-10 ${side === "bid" ? "text-green-600" : "text-red-600"}`}>
          {formatUsd(roundToStep(row.price, precision))}
        </span>
        <span className="relative z-10 text-[#2d2d2d]">{row.amount.toFixed(3)}</span>
      </button>
    );
  }

  return (
    <div className="rounded-[20px] bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setTab("book")}
            className={`text-sm font-semibold ${
              tab === "book" ? "text-[#39079e]" : "text-[#929292] hover:text-[#2a2a2a]"
            }`}
          >
            Order Book
          </button>
          <button
            type="button"
            onClick={() => setTab("trades")}
            className={`text-sm font-semibold ${
              tab === "trades" ? "text-[#39079e]" : "text-[#929292] hover:text-[#2a2a2a]"
            }`}
          >
            Last Trades
          </button>
        </div>
        {tab === "book" && (
          <select
            value={precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1 text-xs text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          >
            {PRECISION_STEPS.map((step) => (
              <option key={step} value={step}>
                {step}
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === "book" ? (
        <>
          <div className="mt-4 flex justify-between px-2 text-xs text-[#929292]">
            <span>Price</span>
            <span>Amount</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {[...asks].reverse().map((row) => (
              <DepthRow key={row.price} row={row} side="ask" />
            ))}
          </div>

          <div className="mt-2 rounded-lg bg-[#f2f2f4] px-3 py-2 text-center text-sm font-semibold text-[#2d2d2d]">
            {formatUsd(currentPrice)}
          </div>

          <div className="mt-2 space-y-0.5">
            {bids.map((row) => (
              <DepthRow key={row.price} row={row} side="bid" />
            ))}
          </div>

          <div className="mt-4">
            <div className="flex h-2 overflow-hidden rounded-full">
              <div className="bg-green-500" style={{ width: `${bidPercent}%` }} />
              <div className="bg-red-500" style={{ width: `${100 - bidPercent}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="font-semibold text-green-600">{bidPercent.toFixed(1)}% B</span>
              <span className="font-semibold text-red-600">{(100 - bidPercent).toFixed(1)}% S</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 flex justify-between px-2 text-xs text-[#929292]">
            <span>Price</span>
            <span>Amount</span>
            <span>Time</span>
          </div>
          <div className="mt-1 max-h-[360px] space-y-0.5 overflow-y-auto">
            {trades.map((trade, index) => (
              <div key={index} className="flex justify-between px-2 py-1 text-sm">
                <span className={trade.side === "buy" ? "text-green-600" : "text-red-600"}>
                  {formatUsd(trade.price)}
                </span>
                <span className="text-[#2d2d2d]">{trade.amount.toFixed(3)}</span>
                <span className="text-[#929292]">{trade.secondsAgo}s ago</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
