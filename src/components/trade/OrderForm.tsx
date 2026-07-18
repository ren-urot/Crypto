"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatUsd, getCoin, type CoinId, type Wallet } from "@/lib/dashboard-data";
import { createOrder, type Order } from "@/lib/orders";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

type OrderType = "market" | "limit" | "tpsl";

const PERCENT_STEPS = [0, 25, 50, 75, 100];

export default function OrderForm({
  coinId,
  currentPrice,
  orderType,
  onOrderTypeChange,
  limitPrice,
  onLimitPriceChange,
  onMarketOrder,
  onPlaceOrder,
  wallet,
  marginEnabled = false,
}: {
  coinId: CoinId;
  currentPrice: number;
  orderType: OrderType;
  onOrderTypeChange: (value: OrderType) => void;
  limitPrice: string;
  onLimitPriceChange: (value: string) => void;
  onMarketOrder: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
  onPlaceOrder: (order: Order) => void;
  wallet: Wallet;
  marginEnabled?: boolean;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = getCoin(coinId);
  const parsedAmount = Number(amount);
  const effectivePrice =
    orderType === "market" ? currentPrice : Number(limitPrice) || currentPrice;
  const total = Number.isFinite(parsedAmount) ? parsedAmount * effectivePrice : 0;

  const buyingPower = side === "buy" && marginEnabled ? wallet.usd * 10 : wallet.usd;
  const available = side === "buy" ? buyingPower : wallet.holdings[coinId];
  const maxAmount = side === "buy" ? buyingPower / effectivePrice : wallet.holdings[coinId];

  function applyPercent(percent: number) {
    const next = (maxAmount * percent) / 100;
    setAmount(next > 0 ? next.toFixed(6) : "");
  }

  function nudgePrice(direction: 1 | -1) {
    const tick = Math.max(effectivePrice * 0.0005, 0.01);
    const base = Number(limitPrice) || currentPrice;
    onLimitPriceChange((base + tick * direction).toFixed(2));
  }

  function handleTotalChange(value: string) {
    const parsedTotal = Number(value);
    if (!Number.isFinite(parsedTotal) || effectivePrice <= 0) {
      setAmount("");
      return;
    }
    setAmount((parsedTotal / effectivePrice).toFixed(6));
  }

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
    <div className="rounded-[20px] bg-white p-6 md:p-8">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "buy" ? "bg-green-600 text-white" : "text-[#2a2a2a]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "sell" ? "bg-red-600 text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-4 flex gap-5 border-b border-[#e5e5e5] text-sm font-semibold">
        {(["limit", "market", "tpsl"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onOrderTypeChange(type)}
            className={`pb-2 ${
              orderType === type
                ? "border-b-2 border-[#39079e] text-[#39079e]"
                : "text-[#929292] hover:text-[#2a2a2a]"
            }`}
          >
            {type === "market" ? "Market" : type === "limit" ? "Limit" : "TP/SL"}
          </button>
        ))}
      </div>

      {orderType === "tpsl" ? (
        <p className="mt-6 text-sm text-[#929292]">
          Take-profit / stop-loss orders are coming soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {orderType === "limit" && (
            <div>
              <label htmlFor="order-price" className="text-sm font-semibold text-[#2a2a2a]">
                Price (USDT)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 items-center border-b border-[#e5e5e5]">
                  <input
                    id="order-price"
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={limitPrice}
                    onChange={(e) => onLimitPriceChange(e.target.value)}
                    className="w-full bg-transparent pb-3 text-base text-[#2a2a2a] focus:outline-none"
                  />
                  <div className="flex flex-col pb-1">
                    <button
                      type="button"
                      onClick={() => nudgePrice(1)}
                      aria-label="Increase price"
                      className="text-[#929292] hover:text-[#39079e]"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgePrice(-1)}
                      aria-label="Decrease price"
                      className="text-[#929292] hover:text-[#39079e]"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLimitPriceChange(currentPrice.toFixed(2))}
                  className="shrink-0 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#39079e] hover:bg-[#f2f2f4]"
                >
                  BBO
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="order-amount" className="text-sm font-semibold text-[#2a2a2a]">
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
          </div>

          {side === "buy" && marginEnabled && (
            <p className="text-xs text-[#929292]">
              Margin buying power shown for demo purposes — orders still settle against your real
              USDT balance.
            </p>
          )}

          <div className="flex gap-2">
            {PERCENT_STEPS.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => applyPercent(percent)}
                className="flex-1 rounded-full bg-[#f2f2f4] py-1.5 text-xs font-semibold text-[#2a2a2a] hover:bg-[#e5e5e5]"
              >
                {percent}%
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="order-total" className="text-sm font-semibold text-[#2a2a2a]">
              Total (USDT)
            </label>
            <input
              id="order-total"
              type="number"
              step="any"
              min="0"
              value={total ? total.toFixed(2) : ""}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#929292]">
            <span>
              Available: {side === "buy" ? formatUsd(available) : `${available.toFixed(4)} ${coin.symbol}`}
            </span>
            <span>
              Max {side === "buy" ? "buy" : "sell"}: {maxAmount > 0 ? maxAmount.toFixed(6) : "0.000000"}{" "}
              {coin.symbol}
            </span>
          </div>

          {orderType === "limit" && (
            <div className="flex justify-between text-xs text-[#929292]">
              <span>Max price</span>
              <span>{formatUsd(currentPrice * 1.05)}</span>
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded-full px-10 py-4 text-sm font-bold tracking-[0.05em] text-white uppercase transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg ${
              side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {side === "buy" ? "Buy" : "Sell"} {coin.symbol}
          </button>

          <p className="text-center text-xs text-[#929292]">Taker fee 0.10% (demo figure)</p>

          {result && (
            <p className={`text-sm ${result.ok ? "text-[#2d2d2d]" : "text-red-600"}`}>
              {result.ok ? result.message : result.reason}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
