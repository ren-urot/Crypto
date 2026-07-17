"use client";

import { useState } from "react";
import Link from "next/link";
import {
  COINS,
  formatUsd,
  formatPercent,
  formatCompactUsd,
  type Coin,
} from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import Sparkline from "./Sparkline";

function getSparklineAndRange(coin: Coin) {
  const candles = generateCandles(coin.id, coin.price, 24);
  const closes = candles.map((candle) => candle.close);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  return { closes, low, high };
}

export default function MarketsView() {
  const [query, setQuery] = useState("");

  const filtered = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1228px]">
      <div className="rounded-[20px] bg-white p-6 md:p-10">
        <input
          type="text"
          placeholder="Search markets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-[320px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-sm text-[#929292]">
                <th className="pb-4 font-medium">Name</th>
                <th className="pb-4 font-medium">Price</th>
                <th className="pb-4 font-medium">24h Change</th>
                <th className="pb-4 font-medium">Last 24h</th>
                <th className="pb-4 font-medium">24h Range</th>
                <th className="pb-4 font-medium">Market Cap</th>
                <th className="pb-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin) => {
                const { closes, low, high } = getSparklineAndRange(coin);
                const isUp = coin.change24h >= 0;
                return (
                  <tr key={coin.id} className="border-t border-[#e5e5e5]">
                    <td className="py-4">
                      <p className="font-semibold text-[#39079e]">
                        {coin.symbol}
                      </p>
                      <p className="text-sm text-[#929292]">{coin.name}</p>
                    </td>
                    <td className="py-4 text-[#2d2d2d]">
                      {formatUsd(coin.price)}
                    </td>
                    <td
                      className={`py-4 ${
                        isUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercent(coin.change24h)}
                    </td>
                    <td className="py-4">
                      <Sparkline
                        values={closes}
                        color={isUp ? "#16a34a" : "#dc2626"}
                      />
                    </td>
                    <td className="py-4 text-sm text-[#929292]">
                      {formatUsd(low)} - {formatUsd(high)}
                    </td>
                    <td className="py-4 text-[#2d2d2d]">
                      {formatCompactUsd(coin.marketCap)}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href="/trade"
                        className="rounded-full bg-[#ffb506] px-4 py-2 text-xs font-bold uppercase text-[#39079e] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205]"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-sm text-[#929292]"
                  >
                    No markets match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
