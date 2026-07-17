"use client";

import { useState } from "react";
import { COINS, formatUsd, type CoinId } from "@/lib/dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function TradePanel({
  onTrade,
}: {
  onTrade: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
}) {
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = COINS.find((c) => c.id === coinId)!;
  const parsedAmount = Number(amount);
  const estimate = Number.isFinite(parsedAmount)
    ? parsedAmount * coin.price
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }
    const tradeResult = onTrade(coinId, side, parsedAmount);
    setResult(tradeResult);
    if (tradeResult.ok) {
      setAmount("");
    }
  }

  return (
    <div className="rounded-[40px] bg-white p-8 md:p-10">
      <h2 className="font-semibold text-2xl text-[#39079e]">Trade</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
              side === "buy" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("sell")}
            className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
              side === "sell" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
            }`}
          >
            Sell
          </button>
        </div>

        <div>
          <label
            htmlFor="trade-coin"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Asset
          </label>
          <select
            id="trade-coin"
            value={coinId}
            onChange={(e) => setCoinId(e.target.value as CoinId)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="trade-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Amount ({coin.symbol})
          </label>
          <input
            id="trade-amount"
            type="number"
            step="any"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
          <p className="mt-2 text-sm text-[#929292]">
            Estimated {side === "buy" ? "cost" : "proceeds"}:{" "}
            {formatUsd(estimate)}
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
        >
          {side === "buy" ? "Buy" : "Sell"} {coin.symbol}
        </button>

        {result && (
          <p
            className={`text-sm ${
              result.ok ? "text-[#2d2d2d]" : "text-red-600"
            }`}
          >
            {result.ok ? result.message : result.reason}
          </p>
        )}
      </form>
    </div>
  );
}
