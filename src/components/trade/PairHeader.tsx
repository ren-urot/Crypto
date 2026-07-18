"use client";

import { ExternalLink, Star } from "lucide-react";
import { generateCandles } from "@/lib/candles";
import { formatUsd, formatPercent, formatCompactUsd, type Coin, type CoinId } from "@/lib/dashboard-data";
import CoinSwitcher from "./CoinSwitcher";

export default function PairHeader({
  coin,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: {
  coin: Coin;
  onSelect: (coinId: CoinId) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const isUp = coin.change24h >= 0;
  const candles = generateCandles(coin.id, coin.price, 24, coin.volume24h);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[20px] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb506] text-sm font-bold text-[#39079e]">
          {coin.symbol[0]}
        </span>
        <CoinSwitcher selectedCoinId={coin.id} onSelect={onSelect} />
        <span className="rounded-md bg-[#f2f2f4] px-2 py-0.5 text-xs font-semibold text-[#929292]">10x</span>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label="Toggle favorite"
          className={isFavorite ? "text-[#ffb506]" : "text-[#c9c9c9] hover:text-[#929292]"}
        >
          <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
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
        <p className="flex items-center gap-1 text-xs text-[#929292]">
          Index <ExternalLink size={11} />
        </p>
        <p className="text-sm text-[#2d2d2d]">{formatUsd(coin.price)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">Mark price</p>
        <p className="text-sm text-[#2d2d2d]">{formatUsd(coin.price)}</p>
      </div>

      <div>
        <p className="flex items-center gap-1 text-xs text-[#929292]">
          {coin.name} price <ExternalLink size={11} />
        </p>
        <p className="text-sm text-[#2d2d2d]">{formatUsd(coin.price)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h low</p>
        <p className="text-sm text-[#2d2d2d]">{formatUsd(low)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h high</p>
        <p className="text-sm text-[#2d2d2d]">{formatUsd(high)}</p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h volume ({coin.symbol})</p>
        <p className="text-sm text-[#2d2d2d]">
          {(coin.volume24h / coin.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#929292]">24h turnover (USDT)</p>
        <p className="text-sm text-[#2d2d2d]">{formatCompactUsd(coin.volume24h)}</p>
      </div>
    </div>
  );
}
