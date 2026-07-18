"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";

type Result = { ok: true; message: string } | { ok: false; reason: string };

export default function DexSwapView() {
  const { wallet, onTrade } = useWallet();
  const [fromCoinId, setFromCoinId] = useState<CoinId>("BTC");
  const [toCoinId, setToCoinId] = useState<CoinId>("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const fromCoin = getCoin(fromCoinId);
  const toCoin = getCoin(toCoinId);
  const parsedFromAmount = Number(fromAmount);
  const toAmount =
    Number.isFinite(parsedFromAmount) && parsedFromAmount > 0
      ? (parsedFromAmount * fromCoin.price) / toCoin.price
      : 0;

  function handleFromCoinChange(nextId: CoinId) {
    setFromCoinId(nextId);
    if (nextId === toCoinId) {
      setToCoinId(fromCoinId);
    }
  }

  function handleToCoinChange(nextId: CoinId) {
    setToCoinId(nextId);
    if (nextId === fromCoinId) {
      setFromCoinId(toCoinId);
    }
  }

  function flipDirection() {
    setFromCoinId(toCoinId);
    setToCoinId(fromCoinId);
    setFromAmount("");
    setResult(null);
  }

  function handleMax() {
    setFromAmount(String(wallet.holdings[fromCoinId]));
  }

  function handleSwap(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedFromAmount) || parsedFromAmount <= 0) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }

    const sellResult = onTrade(fromCoinId, "sell", parsedFromAmount);
    if (!sellResult.ok) {
      setResult(sellResult);
      return;
    }

    const buyResult = onTrade(toCoinId, "buy", toAmount);
    if (!buyResult.ok) {
      setResult(buyResult);
      return;
    }

    setResult({
      ok: true,
      message: `Swapped ${parsedFromAmount} ${fromCoin.symbol} for ${toAmount.toFixed(6)} ${toCoin.symbol}.`,
    });
    setFromAmount("");
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Swap</h2>
        <p className="mt-1 text-sm text-[#929292]">
          Trade tokens using your Exchange balance — no wallet connection needed.
        </p>

        <form onSubmit={handleSwap} className="mt-6 space-y-2">
          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <div className="flex items-center justify-between text-sm text-[#929292]">
              <span>From</span>
              <span>
                Balance: {wallet.holdings[fromCoinId].toFixed(4)} {fromCoin.symbol}{" "}
                <button
                  type="button"
                  onClick={handleMax}
                  className="font-semibold text-[#39079e] hover:underline"
                >
                  Max
                </button>
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-2xl text-[#2a2a2a] focus:outline-none"
              />
              <select
                value={fromCoinId}
                onChange={(e) => handleFromCoinChange(e.target.value as CoinId)}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#39079e] focus:outline-none"
              >
                {COINS.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={flipDirection}
              aria-label="Flip swap direction"
              className="-my-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#f2f2f4] text-[#39079e] hover:bg-[#e5e5e5]"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <div className="flex items-center justify-between text-sm text-[#929292]">
              <span>To</span>
              <span>
                Balance: {wallet.holdings[toCoinId].toFixed(4)} {toCoin.symbol}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <p className="w-full text-2xl text-[#2a2a2a]">
                {toAmount > 0 ? toAmount.toFixed(6) : "0.0"}
              </p>
              <select
                value={toCoinId}
                onChange={(e) => handleToCoinChange(e.target.value as CoinId)}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#39079e] focus:outline-none"
              >
                {COINS.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {parsedFromAmount > 0 && (
            <p className="px-1 text-xs text-[#929292]">
              1 {fromCoin.symbol} = {(fromCoin.price / toCoin.price).toFixed(6)} {toCoin.symbol}{" "}
              ({formatUsd(fromCoin.price)})
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Swap
          </button>

          {result && (
            <p className={`text-sm ${result.ok ? "text-[#2d2d2d]" : "text-red-600"}`}>
              {result.ok ? result.message : result.reason}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
