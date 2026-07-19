"use client";

import { useState } from "react";
import { getCoin } from "@/lib/dashboard-data";
import { getDemoTraders, type DemoTrader } from "@/lib/trading-bots-data";
import { useWallet } from "@/lib/wallet-context";
import { useBots } from "@/lib/bots-context";

function TraderCard({ trader }: { trader: DemoTrader }) {
  const { reserveUsd } = useWallet();
  const { addBot } = useBots();
  const coin = getCoin(trader.coinId);

  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleCopy(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setResult({ ok: false, message: "Enter an amount greater than zero." });
      return;
    }
    const reserveResult = reserveUsd(parsed);
    if (!reserveResult.ok) {
      setResult({ ok: false, message: reserveResult.reason });
      return;
    }
    addBot({
      type: "copy",
      coinId: trader.coinId,
      investment: parsed,
      summary: `Copying ${trader.name} (mirrors ${coin.symbol})`,
    });
    setResult({ ok: true, message: `Copying ${trader.name}. See it under Trading bots.` });
    setAmount("");
  }

  const isUp = trader.return30d >= 0;

  return (
    <div className="rounded-[20px] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#2a2a2a]">{trader.name}</p>
          <p className="text-xs text-[#929292]">Demo profile — not a real trader</p>
        </div>
        <span className={`font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "+" : ""}
          {trader.return30d.toFixed(1)}% (30d)
        </span>
      </div>
      <p className="mt-2 text-sm text-[#929292]">
        {trader.followers.toLocaleString()} followers · mirrors {coin.symbol} price action
      </p>

      {result?.ok ? (
        <p className="mt-4 text-sm text-[#2d2d2d]">{result.message}</p>
      ) : (
        <form onSubmit={handleCopy} className="mt-4 flex gap-2">
          <input
            type="number"
            step="any"
            min="0"
            placeholder="Amount (USDT)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-full border border-[#e5e5e5] px-4 py-2 text-sm text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#ffb506] px-5 py-2 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Copy
          </button>
        </form>
      )}
      {result && !result.ok && <p className="mt-2 text-sm text-red-600">{result.message}</p>}
    </div>
  );
}

export default function SpotCopyTradingView() {
  const traders = getDemoTraders();

  return (
    <div>
      <p className="mx-auto max-w-[700px] text-center text-sm text-[#929292]">
        These are simulated demo profiles for this app only — not real people, and their returns
        are deterministic dummy figures, not real trading history.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {traders.map((trader) => (
          <TraderCard key={trader.id} trader={trader} />
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-[#929292]">
        Copying reserves the amount you enter from your USDT balance for demo purposes.
      </p>
    </div>
  );
}
