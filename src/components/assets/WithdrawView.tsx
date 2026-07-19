"use client";

import { useState } from "react";
import { formatUsd } from "@/lib/dashboard-data";
import { useWallet } from "@/lib/wallet-context";

export default function WithdrawView() {
  const { wallet, reserveUsd } = useWallet();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setResult({ ok: false, message: "Enter an amount greater than zero." });
      return;
    }
    if (!address.trim()) {
      setResult({ ok: false, message: "Enter a destination address." });
      return;
    }
    const reserveResult = reserveUsd(parsed);
    if (!reserveResult.ok) {
      setResult({ ok: false, message: reserveResult.reason });
      return;
    }
    setResult({
      ok: true,
      message: `Withdrew ${formatUsd(parsed)} to ${address.trim()}. No real funds moved — this is a demo balance.`,
    });
    setAmount("");
    setAddress("");
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Withdraw USDT</h2>
        <p className="mt-1 text-sm text-[#929292]">
          This app has no real blockchain or bank connection — withdrawing deducts from your demo
          USDT balance only.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#2a2a2a]">Amount (USDT)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
            <p className="mt-2 text-xs text-[#929292]">
              Available: {formatUsd(wallet.usd)}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#2a2a2a]">Destination address</label>
            <input
              type="text"
              placeholder="Demo address, e.g. 0xDemo..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-2 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Withdraw
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
