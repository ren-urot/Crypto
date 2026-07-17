"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function BuyCryptoView() {
  const { wallet, onTrade } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = getCoin(coinId);
  const parsedAmount = Number(amount);
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const estimate = isValidAmount
    ? side === "buy"
      ? parsedAmount / coin.price
      : parsedAmount * coin.price
    : 0;

  function switchSide(next: "buy" | "sell") {
    setSide(next);
    setAmount("");
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidAmount) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }
    // "amount" is USD for Buy, coin quantity for Sell — onTrade always
    // expects a coin quantity, so Buy converts USD -> coin qty first.
    const coinAmount = side === "buy" ? parsedAmount / coin.price : parsedAmount;
    const tradeResult = onTrade(coinId, side, coinAmount);
    setResult(tradeResult);
    if (tradeResult.ok) {
      setAmount("");
    }
  }

  return (
    <div className="mx-auto max-w-[560px] rounded-[20px] bg-white p-10 md:p-16">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => switchSide("buy")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "buy" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => switchSide("sell")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "sell" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="buy-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            {side === "buy" ? "You pay (USD)" : "You sell"}
          </label>
          <input
            id="buy-amount"
            type="number"
            step="any"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="buy-coin"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            {side === "buy" ? "You get" : "Coin"}
          </label>
          <select
            id="buy-coin"
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
          <p className="mt-2 text-sm text-[#929292]">
            {side === "buy"
              ? `≈ ${estimate.toFixed(6)} ${coin.symbol}`
              : `≈ ${formatUsd(estimate)}`}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3 text-sm">
          <span className="text-[#929292]">Wallet balance</span>
          <span className="font-semibold text-[#2d2d2d]">
            {formatUsd(wallet.usd)}
          </span>
        </div>

        <button
          type="submit"
          disabled={!isValidAmount}
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {side === "buy" ? `Buy ${coin.symbol}` : `Sell ${coin.symbol}`}
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
