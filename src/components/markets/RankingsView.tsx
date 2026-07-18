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

const RANKING_TABS = [
  "Top Gainers",
  "Top Losers",
  "Top Volume",
  "Top Market Cap",
] as const;
type RankingTab = (typeof RANKING_TABS)[number];

function sortForTab(coins: Coin[], tab: RankingTab): Coin[] {
  const sorted = [...coins];
  switch (tab) {
    case "Top Gainers":
      return sorted.sort((a, b) => b.change24h - a.change24h);
    case "Top Losers":
      return sorted.sort((a, b) => a.change24h - b.change24h);
    case "Top Volume":
      return sorted.sort((a, b) => b.volume24h - a.volume24h);
    case "Top Market Cap":
      return sorted.sort((a, b) => b.marketCap - a.marketCap);
  }
}

const RANK_BADGE_COLORS = ["bg-[#ffd54a] text-[#5a4300]", "bg-[#d9d9d9] text-[#2d2d2d]", "bg-[#e8b98a] text-[#4a2c0f]"];

export default function RankingsView() {
  const [tab, setTab] = useState<RankingTab>("Top Gainers");
  const ranked = sortForTab(COINS, tab);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto">
        {RANKING_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-[#39079e] text-white"
                : "bg-white text-[#2a2a2a] hover:bg-[#e5e5e5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-[20px] bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs text-[#929292] uppercase">
              <th className="px-6 py-4">#</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">24h Change</th>
              <th className="px-4 py-4">24h Volume</th>
              <th className="px-4 py-4">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((coin, index) => {
              const isUp = coin.change24h >= 0;
              return (
                <tr key={coin.id} className="border-b border-[#f2f2f4] last:border-0">
                  <td className="px-6 py-4">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        RANK_BADGE_COLORS[index] ?? "bg-[#f2f2f4] text-[#929292]"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/markets/${coin.id.toLowerCase()}`}
                      className="font-semibold text-[#39079e] hover:underline"
                    >
                      {coin.symbol}
                    </Link>
                    <span className="ml-2 text-sm text-[#929292]">{coin.name}</span>
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatUsd(coin.price)}</td>
                  <td className={`px-4 py-4 font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(coin.change24h)}
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatCompactUsd(coin.volume24h)}</td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatCompactUsd(coin.marketCap)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
