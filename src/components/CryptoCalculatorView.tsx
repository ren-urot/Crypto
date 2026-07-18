"use client";

import { useState } from "react";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";

export default function CryptoCalculatorView() {
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [coinAmount, setCoinAmount] = useState("1");
  const [usdAmount, setUsdAmount] = useState(String(getCoin("BTC").price));

  const coin = getCoin(coinId);

  function handleCoinAmountChange(value: string) {
    setCoinAmount(value);
    const parsed = Number(value);
    setUsdAmount(Number.isFinite(parsed) ? (parsed * coin.price).toFixed(2) : "");
  }

  function handleUsdAmountChange(value: string) {
    setUsdAmount(value);
    const parsed = Number(value);
    setCoinAmount(Number.isFinite(parsed) ? (parsed / coin.price).toFixed(8) : "");
  }

  function handleCoinChange(nextCoinId: CoinId) {
    setCoinId(nextCoinId);
    const nextCoin = getCoin(nextCoinId);
    const parsed = Number(coinAmount);
    setUsdAmount(Number.isFinite(parsed) ? (parsed * nextCoin.price).toFixed(2) : "");
  }

  return (
    <div className="mx-auto max-w-[600px] rounded-[20px] bg-white p-8 md:p-10">
      <div>
        <label htmlFor="calc-coin-amount" className="text-sm font-semibold text-[#2a2a2a]">
          Amount
        </label>
        <div className="mt-2 flex items-center gap-3 border-b border-[#e5e5e5] pb-3">
          <input
            id="calc-coin-amount"
            type="number"
            step="any"
            value={coinAmount}
            onChange={(e) => handleCoinAmountChange(e.target.value)}
            className="w-full bg-transparent text-lg text-[#2a2a2a] focus:outline-none"
          />
          <select
            value={coinId}
            onChange={(e) => handleCoinChange(e.target.value as CoinId)}
            className="shrink-0 rounded-full bg-[#f2f2f4] px-3 py-1.5 text-sm font-semibold text-[#39079e] focus:outline-none"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor="calc-usd-amount" className="text-sm font-semibold text-[#2a2a2a]">
          USD value
        </label>
        <div className="mt-2 flex items-center gap-3 border-b border-[#e5e5e5] pb-3">
          <input
            id="calc-usd-amount"
            type="number"
            step="any"
            value={usdAmount}
            onChange={(e) => handleUsdAmountChange(e.target.value)}
            className="w-full bg-transparent text-lg text-[#2a2a2a] focus:outline-none"
          />
          <span className="shrink-0 rounded-full bg-[#f2f2f4] px-3 py-1.5 text-sm font-semibold text-[#929292]">
            USD
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm text-[#929292]">
        1 {coin.symbol} = {formatUsd(coin.price)} — dummy demo price, not real market data.
      </p>
    </div>
  );
}
