"use client";

import { useState } from "react";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";
import { backtestDca } from "@/lib/trading-bots-data";
import { useWallet } from "@/lib/wallet-context";
import { useBots } from "@/lib/bots-context";

export default function SpotDcaView() {
  const { reserveUsd } = useWallet();
  const { addBot } = useBots();

  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [baseOrder, setBaseOrder] = useState("100");
  const [deviationPercent, setDeviationPercent] = useState("2");
  const [multiplier, setMultiplier] = useState("1.5");
  const [maxOrders, setMaxOrders] = useState("5");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const coin = getCoin(coinId);
  const parsedBaseOrder = Number(baseOrder);
  const parsedDeviation = Number(deviationPercent);
  const parsedMultiplier = Number(multiplier);
  const parsedMaxOrders = Number(maxOrders);

  const backtest = backtestDca(
    coin,
    parsedBaseOrder,
    parsedDeviation,
    parsedMultiplier,
    parsedMaxOrders,
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedBaseOrder) || parsedBaseOrder <= 0) {
      setResult({ ok: false, message: "Enter a base order amount greater than zero." });
      return;
    }
    const maxExposure = backtest.totalInvested;
    const reserveResult = reserveUsd(maxExposure);
    if (!reserveResult.ok) {
      setResult({ ok: false, message: reserveResult.reason });
      return;
    }
    addBot({
      type: "dca",
      coinId,
      investment: maxExposure,
      summary: `${coin.symbol} DCA, base ${formatUsd(parsedBaseOrder)}, ${parsedMaxOrders} max orders`,
    });
    setResult({ ok: true, message: "DCA bot created. See it under Trading bots." });
  }

  return (
    <div className="mx-auto max-w-[700px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Set up Spot DCA (Martingale)</h2>
        <p className="mt-1 text-sm text-[#929292]">
          Dollar-cost average into a position, sizing each order up after a drop, for volatile
          markets.
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
                  {c.symbol} — {c.name} ({formatUsd(c.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Base order (USDT)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={baseOrder}
                onChange={(e) => setBaseOrder(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Price deviation %</label>
              <input
                type="number"
                step="any"
                min="0"
                value={deviationPercent}
                onChange={(e) => setDeviationPercent(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Martingale multiplier</label>
              <input
                type="number"
                step="any"
                min="1"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2a2a2a]">Max orders</label>
              <input
                type="number"
                step="1"
                min="1"
                value={maxOrders}
                onChange={(e) => setMaxOrders(e.target.value)}
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
                <p className="text-[#929292]">Orders triggered</p>
                <p className="font-semibold text-[#2d2d2d]">
                  {backtest.ordersTriggered} / {parsedMaxOrders}
                </p>
              </div>
              <div>
                <p className="text-[#929292]">Total invested</p>
                <p className="font-semibold text-[#2d2d2d]">{formatUsd(backtest.totalInvested)}</p>
              </div>
              <div>
                <p className="text-[#929292]">Average entry price</p>
                <p className="font-semibold text-[#2d2d2d]">
                  {formatUsd(backtest.averageEntryPrice)}
                </p>
              </div>
              <div>
                <p className="text-[#929292]">Result at final price</p>
                <p
                  className={`font-semibold ${
                    backtest.profitPercent >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {backtest.profitPercent >= 0 ? "+" : ""}
                  {backtest.profitPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#929292]">
              Simulated against this app&apos;s dummy price history, not a prediction of future
              performance. Creating this bot reserves the total invested amount above.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Create DCA bot
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
