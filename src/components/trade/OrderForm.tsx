"use client";

import { useState } from "react";
import { formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";
import { createOrder, type Order } from "@/lib/orders";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function OrderForm({
  coinId,
  currentPrice,
  orderType,
  onOrderTypeChange,
  limitPrice,
  onLimitPriceChange,
  onMarketOrder,
  onPlaceOrder,
}: {
  coinId: CoinId;
  currentPrice: number;
  orderType: "market" | "limit";
  onOrderTypeChange: (value: "market" | "limit") => void;
  limitPrice: string;
  onLimitPriceChange: (value: string) => void;
  onMarketOrder: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
  onPlaceOrder: (order: Order) => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = getCoin(coinId);
  const parsedAmount = Number(amount);
  const effectivePrice =
    orderType === "market" ? currentPrice : Number(limitPrice) || currentPrice;
  const estimate = Number.isFinite(parsedAmount)
    ? parsedAmount * effectivePrice
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }

    if (orderType === "market") {
      const tradeResult = onMarketOrder(coinId, side, parsedAmount);
      setResult(tradeResult);
      if (tradeResult.ok) {
        setAmount("");
        onPlaceOrder(
          createOrder({
            coinId,
            side,
            type: "market",
            amount: parsedAmount,
            price: currentPrice,
            status: "filled",
          }),
        );
      }
      return;
    }

    const parsedLimitPrice = Number(limitPrice);
    if (!Number.isFinite(parsedLimitPrice) || parsedLimitPrice <= 0) {
      setResult({ ok: false, reason: "Enter a limit price greater than zero." });
      return;
    }

    onPlaceOrder(
      createOrder({
        coinId,
        side,
        type: "limit",
        amount: parsedAmount,
        price: parsedLimitPrice,
        status: "open",
      }),
    );
    setResult({
      ok: true,
      message: `Limit ${side} order placed: ${parsedAmount} ${coin.symbol} at ${formatUsd(
        parsedLimitPrice,
      )}.`,
    });
    setAmount("");
  }

  return (
    <div className="rounded-[40px] bg-white p-6 md:p-8">
      <h3 className="font-semibold text-lg text-[#39079e]">Place Order</h3>

      <div className="mt-4 flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => onOrderTypeChange("market")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            orderType === "market"
              ? "bg-[#39079e] text-white"
              : "text-[#2a2a2a]"
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => onOrderTypeChange("limit")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            orderType === "limit"
              ? "bg-[#39079e] text-white"
              : "text-[#2a2a2a]"
          }`}
        >
          Limit
        </button>
      </div>

      <div className="mt-3 flex gap-2 rounded-full bg-[#f2f2f4] p-1">
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {orderType === "limit" && (
          <div>
            <label
              htmlFor="order-price"
              className="text-sm font-semibold text-[#2a2a2a]"
            >
              Price (USD)
            </label>
            <input
              id="order-price"
              type="number"
              step="any"
              min="0"
              required
              value={limitPrice}
              onChange={(e) => onLimitPriceChange(e.target.value)}
              className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="order-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Amount ({coin.symbol})
          </label>
          <input
            id="order-amount"
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
          {orderType === "market" ? "Place Market Order" : "Place Limit Order"}
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
