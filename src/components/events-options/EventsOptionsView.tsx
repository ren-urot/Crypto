"use client";

import { useState } from "react";
import { getCoin, formatUsd, type CoinId } from "@/lib/dashboard-data";
import { getEventTarget, getYesPriceCents } from "@/lib/events-data";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

const EVENT_COIN_IDS: CoinId[] = ["BTC", "ETH", "SOL", "XRP"];

function EventCard({ coinId }: { coinId: CoinId }) {
  const coin = getCoin(coinId);
  const target = getEventTarget(coinId, coin.price);
  const yesCents = getYesPriceCents(coinId, coin.price, target);
  const noCents = 100 - yesCents;

  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Number(amount) > 0);
  }

  return (
    <div className="rounded-[20px] bg-white p-6">
      <p className="text-sm text-[#929292]">{coin.name} price event</p>
      <h3 className="mt-1 font-semibold text-lg text-[#2d2d2d]">
        Will {coin.symbol} close above {formatUsd(target)} this week?
      </h3>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSide("yes")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            side === "yes" ? "bg-green-600 text-white" : "bg-[#f2f2f4] text-[#2a2a2a]"
          }`}
        >
          Yes {yesCents}¢
        </button>
        <button
          type="button"
          onClick={() => setSide("no")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            side === "no" ? "bg-red-600 text-white" : "bg-[#f2f2f4] text-[#2a2a2a]"
          }`}
        >
          No {noCents}¢
        </button>
      </div>

      {status === "success" ? (
        <p className="mt-4 text-sm text-[#2d2d2d]">
          Demo position opened: {amount} shares of {side === "yes" ? "Yes" : "No"} @{" "}
          {side === "yes" ? yesCents : noCents}¢. No real funds were moved.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="number"
            step="any"
            min="0"
            placeholder="Shares"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-full border border-[#e5e5e5] px-4 py-2 text-sm text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="shrink-0 rounded-full bg-[#ffb506] px-5 py-2 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205] disabled:opacity-60"
          >
            {status === "submitting" ? "..." : "Place demo position"}
          </button>
        </form>
      )}

      {status === "success" && (
        <button
          type="button"
          onClick={() => {
            reset();
            setAmount("");
          }}
          className="mt-2 text-xs font-semibold text-[#39079e] hover:underline"
        >
          Place another
        </button>
      )}
    </div>
  );
}

export default function EventsOptionsView() {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {EVENT_COIN_IDS.map((coinId) => (
          <EventCard key={coinId} coinId={coinId} />
        ))}
      </div>
      <p className="mt-6 text-xs text-[#929292]">
        Event targets and Yes/No prices are simulated demo figures with no real settlement.
        Placing a position here does not move any funds in your wallet.
      </p>
    </div>
  );
}
