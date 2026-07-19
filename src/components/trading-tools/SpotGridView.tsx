"use client";

import { useState } from "react";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";
import { backtestGrid } from "@/lib/trading-bots-data";
import { useWallet } from "@/lib/wallet-context";
import { useBots } from "@/lib/bots-context";

export default function SpotGridView() {
  const { reserveUsd } = useWallet();
  const { addBot } = useBots();

  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const coin = getCoin(coinId);

  const [lower, setLower] = useState(String((coin.price * 0.9).toFixed(2)));
  const [upper, setUpper] = useState(String((coin.price * 1.1).toFixed(2)));
  const [gridCount, setGridCount] = useState("10");
  const [investment, setInvestment] = useState("1000");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleCoinChange(nextId: CoinId) {
    const nextCoin = getCoin(nextId);
    setCoinId(nextId);
    setLower(String((nextCoin.price * 0.9).toFixed(2)));
    setUpper(String((nextCoin.price * 1.1).toFixed(2)));
    setResult(null);
  }

  const parsedLower = Number(lower);
  const parsedUpper = Number(upper);
  const parsedGridCount = Number(gridCount);
  const parsedInvestment = Number(investment);

  const backtest = backtestGrid(coin, parsedLower, parsedUpper, parsedGridCount, parsedInvestment);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedInvestment) || parsedInvestment <= 0) {
      setResult({ ok: false, message: "Enter an investment amount greater than zero." });
      return;
    }
    const reserveResult = reserveUsd(parsedInvestment);
    if (!reserveResult.ok) {
      setResult({ ok: false, message: reserveResult.reason });
      return;
    }
    addBot({
      type: "grid",
      coinId,
      investment: parsedInvestment,
      summary: `${coin.symbol} grid ${formatUsd(parsedLower)}–${formatUsd(parsedUpper)}, ${parsedGridCount} grids`,
    });
    setResult({ ok: true, message: "Grid bot created. See it under Trading bots." });
  }

  return (
    <div className="mx-auto max-w-[700px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Set up a spot grid</h2>
        <p className="mt-1 text-sm text-[#929292]">
          Buy low, sell high automatically within a price range you choose.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#2a2a2a]">Coin</label>
            <select
              value={coinId}
              onChange={(e) => handleCoinChange(e.target.value as CoinId)}
              className="mt-2 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            >
              {COINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name} ({formatUsd(c.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Lower price (USD)</label>
              <input
                type="number"
                step="any"
                value={lower}
                onChange={(e) => setLower(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Upper price (USD)</label>
              <input
                type="number"
                step="any"
                value={upper}
                onChange={(e) => setUpper(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Number of grids</label>
              <input
                type="number"
                step="1"
                min="1"
                value={gridCount}
                onChange={(e) => setGridCount(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Investment (USDT)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <p className="text-sm font-semibold text-[#2a2a2a]">
              Backtest over the last 90 hours of {coin.symbol} price action
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#929292]">Grid line crossings</p>
                <p className="font-semibold text-[#2d2d2d]">{backtest.crossings}</p>
              </div>
              <div>
                <p className="text-[#929292]">Estimated profit</p>
                <p
                  className={`font-semibold ${
                    backtest.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatUsd(backtest.estimatedProfit)} ({backtest.estimatedProfitPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#929292]">
              Simulated against this app&apos;s dummy price history, not a prediction of future
              performance.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Create grid bot
          </button>

          {result && (
            <p className={`text-sm ${result.ok ? "text-[#2d2d2d]" : "text-red-600"}`}>
              {result.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
