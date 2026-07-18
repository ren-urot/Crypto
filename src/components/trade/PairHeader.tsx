"use client";

import { useState } from "react";
import { generateCandles } from "@/lib/candles";
import { formatUsd, formatPercent, formatCompactUsd, type Coin } from "@/lib/dashboard-data";

export default function PairHeader({ coin }: { coin: Coin }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isUp = coin.change24h >= 0;
  const candles = generateCandles(coin.id, coin.price, 24, coin.volume24h);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[20px] bg-white p-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsFavorite((prev) => !prev)}
          aria-label="Toggle favorite"
          className={`text-xl ${isFavorite ? "text-[#ffb506]" : "text-[#c9c9c9]"}`}
        >
          ★
        </button>
        <div>
          <p className="font-semibold text-[#39079e]">
            {coin.symbol}/USDT
          </p>
          <p className="text-xs text-[#929292]">Spot</p>
        </div>
      </div>

      <div>
        <p className={`text-2xl font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
          {formatUsd(coin.price)}
        </p>
        <p className={`text-sm font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
          {formatPercent(coin.change24h)}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h High</p>
        <p className="text-sm font-semibold text-[#2d2d2d]">{formatUsd(high)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h Low</p>
        <p className="text-sm font-semibold text-[#2d2d2d]">{formatUsd(low)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h Volume ({coin.symbol})</p>
        <p className="text-sm font-semibold text-[#2d2d2d]">
          {(coin.volume24h / coin.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h Turnover (USD)</p>
        <p className="text-sm font-semibold text-[#2d2d2d]">{formatCompactUsd(coin.volume24h)}</p>
      </div>
    </div>
  );
}
