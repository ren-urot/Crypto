"use client";

import { COINS, formatUsd, formatPercent } from "@/lib/dashboard-data";
import { getHistoricalChange } from "@/lib/coin-history";
import { useWallet } from "@/lib/wallet-context";

export default function AnalysisView() {
  const { wallet, totalValue } = useWallet();

  const holdings = COINS.map((coin) => ({
    coin,
    value: wallet.holdings[coin.id] * coin.price,
  })).filter((h) => h.value > 0);

  const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);

  function weightedChange(period: "7d" | "30d" | "1y") {
    if (holdingsValue === 0) return 0;
    return (
      holdings.reduce(
        (sum, h) => sum + getHistoricalChange(h.coin.id, period) * h.value,
        0,
      ) / holdingsValue
    );
  }

  const change7d = weightedChange("7d");
  const change30d = weightedChange("30d");
  const change1y = weightedChange("1y");

  const sorted = [...holdings].sort((a, b) => b.value - a.value);
  const gainers = holdings.filter((h) => h.coin.change24h >= 0).length;
  const losers = holdings.length - gainers;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">Total value</p>
          <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">{formatUsd(totalValue)}</p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">7 day change</p>
          <p className={`mt-1 text-xl font-semibold ${change7d >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(change7d)}
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">30 day change</p>
          <p className={`mt-1 text-xl font-semibold ${change30d >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(change30d)}
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">1 year change</p>
          <p className={`mt-1 text-xl font-semibold ${change1y >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(change1y)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-[20px] bg-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-[#39079e]">Allocation</h2>
          <p className="text-sm text-[#929292]">
            {gainers} up · {losers} down today
          </p>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-4 text-sm text-[#929292]">No holdings yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sorted.map(({ coin, value }) => {
              const percent = (value / holdingsValue) * 100;
              const isUp = coin.change24h >= 0;
              return (
                <div key={coin.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#2a2a2a]">
                      {coin.symbol} <span className="text-[#929292]">{coin.name}</span>
                    </span>
                    <span className="text-[#2d2d2d]">
                      {formatUsd(value)} · {percent.toFixed(1)}%{" "}
                      <span className={isUp ? "text-green-600" : "text-red-600"}>
                        {formatPercent(coin.change24h)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f2f2f4]">
                    <div className="h-full bg-[#39079e]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[#929292]">
        Historical change figures are derived from this app&apos;s deterministic dummy data, not
        real market history.
      </p>
    </div>
  );
}
