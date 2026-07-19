"use client";

import { useState } from "react";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";
import { getArbitrageSpread } from "@/lib/trading-bots-data";
import { useWallet } from "@/lib/wallet-context";
import { useBots } from "@/lib/bots-context";

const CYCLES_PER_DAY = 6;

export default function SmartArbitrageView() {
  const { reserveUsd } = useWallet();
  const { addBot } = useBots();

  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [investment, setInvestment] = useState("1000");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const coin = getCoin(coinId);
  const spreadPercent = getArbitrageSpread(coinId);
  const dailyYieldPercent = spreadPercent * CYCLES_PER_DAY;

  const parsedInvestment = Number(investment);
  const dailyYield = Number.isFinite(parsedInvestment)
    ? parsedInvestment * (dailyYieldPercent / 100)
    : 0;

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
      type: "arbitrage",
      coinId,
      investment: parsedInvestment,
      summary: `${coin.symbol} smart arbitrage, ${spreadPercent.toFixed(3)}% spread`,
    });
    setResult({ ok: true, message: "Smart arbitrage bot started. See it under Trading bots." });
  }

  return (
    <div className="mx-auto max-w-[600px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Start smart arbitrage</h2>
        <p className="mt-1 text-sm text-[#929292]">
          Captures the simulated spread between this app&apos;s index price and spot price for a
          coin. There&apos;s only one exchange in this demo, so this models an index-vs-spot gap,
          not real cross-exchange arbitrage.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#2a2a2a]">Coin</label>
            <select
              value={coinId}
              onChange={(e) => {
                setCoinId(e.target.value as CoinId);
                setResult(null);
              }}
              className="mt-2 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            >
              {COINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name}
                </option>
              ))}
            </select>
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

          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#929292]">Current spread</p>
                <p className="font-semibold text-[#2d2d2d]">{spreadPercent.toFixed(3)}%</p>
              </div>
              <div>
                <p className="text-[#929292]">Projected daily yield</p>
                <p className="font-semibold text-green-600">
                  {formatUsd(dailyYield)} ({dailyYieldPercent.toFixed(3)}%)
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#929292]">
              Assumes {CYCLES_PER_DAY} arbitrage cycles per day, a simplified demo assumption, not
              a guarantee.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Start smart arbitrage
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
