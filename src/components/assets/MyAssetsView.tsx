"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Inbox } from "lucide-react";
import { COINS, formatUsd, formatPercent, getCoin } from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import { useWallet } from "@/lib/wallet-context";
import { useBots } from "@/lib/bots-context";
import { useOrders } from "@/lib/orders-context";
import Sparkline from "@/components/markets/Sparkline";

export default function MyAssetsView() {
  const { wallet, totalValue } = useWallet();
  const { bots } = useBots();
  const { orders } = useOrders();

  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");

  const holdings = COINS.map((coin) => ({
    coin,
    amount: wallet.holdings[coin.id],
    value: wallet.holdings[coin.id] * coin.price,
  })).filter((h) => h.amount > 0);

  const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const reservedInBots = bots.reduce((sum, bot) => sum + bot.investment, 0);

  const todayChangePercent =
    holdingsValue === 0
      ? 0
      : holdings.reduce((sum, h) => sum + h.coin.change24h * h.value, 0) / holdingsValue;
  const todayChangeAmount = holdingsValue * (todayChangePercent / 100);

  const sparklineValues = generateCandles("PORTFOLIO-INDEX", totalValue, 24).map(
    (candle) => candle.close,
  );

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const filteredHoldings = holdings.filter(
    (h) =>
      h.coin.symbol.toLowerCase().includes(query.toLowerCase()) ||
      h.coin.name.toLowerCase().includes(query.toLowerCase()),
  );

  const mask = (value: string) => (hidden ? "••••••" : value);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-[20px] bg-white p-6 md:p-8">
          <div className="flex items-center gap-2 text-sm text-[#929292]">
            Estimated total value
            <button
              type="button"
              onClick={() => setHidden((prev) => !prev)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="text-[#929292] hover:text-[#2a2a2a]"
            >
              {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-2 text-3xl font-semibold text-[#2d2d2d]">
            {mask(formatUsd(totalValue))} <span className="text-base text-[#929292]">USD</span>
          </p>
          <p className={`mt-1 text-sm font-semibold ${todayChangeAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
            Today&apos;s PnL {mask(formatUsd(todayChangeAmount))} ({formatPercent(todayChangePercent)})
          </p>

          <div className="mt-4">
            <Sparkline
              values={sparklineValues}
              color={todayChangeAmount >= 0 ? "#16a34a" : "#dc2626"}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/buy-crypto"
              className="rounded-full bg-[#39079e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d0680]"
            >
              Deposit
            </Link>
            <Link
              href="/withdraw"
              className="rounded-full border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
            >
              Withdraw
            </Link>
            <Link
              href="/transfer"
              className="rounded-full border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
            >
              Transfer
            </Link>
            <Link
              href="/grow"
              className="rounded-full border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
            >
              Earn
            </Link>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 md:p-8">
          <h3 className="font-semibold text-[#2a2a2a]">Recent activity</h3>
          {recentOrders.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
              <Inbox size={32} className="text-[#c9c9c9]" />
              <p className="text-sm text-[#929292]">No records found</p>
              <p className="text-xs text-[#929292]">Get started with your first transaction</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => {
                const coin = getCoin(order.coinId);
                return (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#2a2a2a]">
                      {order.side === "buy" ? "Buy" : "Sell"} {order.amount} {coin.symbol}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase ${
                        order.status === "filled" ? "text-green-600" : "text-[#929292]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[20px] bg-white p-6 md:p-8">
        <h3 className="font-semibold text-lg text-[#39079e]">Portfolio</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <p className="text-sm text-[#929292]">Available balance</p>
            <p className="mt-1 text-lg font-semibold text-[#2d2d2d]">{mask(formatUsd(wallet.usd))}</p>
          </div>
          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <p className="text-sm text-[#929292]">In holdings</p>
            <p className="mt-1 text-lg font-semibold text-[#2d2d2d]">{mask(formatUsd(holdingsValue))}</p>
          </div>
          <div className="rounded-2xl bg-[#f2f2f4] p-5">
            <p className="text-sm text-[#929292]">Reserved in bots</p>
            <p className="mt-1 text-lg font-semibold text-[#2d2d2d]">{mask(formatUsd(reservedInBots))}</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-6 w-full max-w-[320px] rounded-full border border-[#e5e5e5] px-4 py-2 text-sm text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="text-xs text-[#929292] uppercase">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Valuation / 24h PnL</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-[#929292]">
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredHoldings.map(({ coin, amount, value }) => {
                  const isUp = coin.change24h >= 0;
                  const pnlAmount = value * (coin.change24h / (100 + coin.change24h));
                  return (
                    <tr key={coin.id} className="border-t border-[#f2f2f4]">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb506] text-sm font-bold text-[#39079e]">
                            {coin.symbol[0]}
                          </span>
                          <div>
                            <p className="font-semibold text-[#2a2a2a]">{coin.symbol}</p>
                            <p className="text-xs text-[#929292]">{coin.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-[#2d2d2d]">{mask(String(amount))}</td>
                      <td className="py-4 text-right">
                        <p className="font-semibold text-[#2d2d2d]">{mask(formatUsd(value))}</p>
                        <p className={`text-xs ${isUp ? "text-green-600" : "text-red-600"}`}>
                          {mask(formatUsd(pnlAmount))} ({formatPercent(coin.change24h)})
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-[#929292]">
        All balances, PnL, and activity are simulated demo figures for this app, not real holdings.
      </p>
    </div>
  );
}
