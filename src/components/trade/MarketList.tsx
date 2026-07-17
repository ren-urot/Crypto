"use client";

import { useState } from "react";
import {
  COINS,
  formatUsd,
  formatPercent,
  type CoinId,
} from "@/lib/dashboard-data";

export default function MarketList({
  selectedCoinId,
  onSelect,
}: {
  selectedCoinId: CoinId;
  onSelect: (coinId: CoinId) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="rounded-[20px] bg-white p-6">
      <input
        type="text"
        placeholder="Search markets"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
      />

      <div className="mt-4 max-h-[420px] space-y-1 overflow-y-auto">
        {filtered.map((coin) => (
          <button
            key={coin.id}
            type="button"
            onClick={() => onSelect(coin.id)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
              coin.id === selectedCoinId
                ? "bg-[#f2f2f4]"
                : "hover:bg-[#f2f2f4]"
            }`}
          >
            <div>
              <p className="font-semibold text-[#39079e]">{coin.symbol}</p>
              <p className="text-sm text-[#929292]">{coin.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[#2d2d2d]">{formatUsd(coin.price)}</p>
              <p
                className={
                  coin.change24h >= 0
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {formatPercent(coin.change24h)}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-sm text-[#929292]">
            No markets match &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
