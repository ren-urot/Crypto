"use client";

import { generateOrderBook } from "@/lib/order-book";
import { formatUsd, type CoinId } from "@/lib/dashboard-data";

export default function OrderBook({
  coinId,
  currentPrice,
  onSelectPrice,
}: {
  coinId: CoinId;
  currentPrice: number;
  onSelectPrice: (price: number) => void;
}) {
  const { bids, asks } = generateOrderBook(coinId, currentPrice);

  return (
    <div className="rounded-[20px] bg-white p-6">
      <h3 className="font-semibold text-lg text-[#39079e]">Order Book</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-[#929292]">Bids</p>
          <div className="mt-2 space-y-1">
            {bids.map((row) => (
              <button
                key={row.price}
                type="button"
                onClick={() => onSelectPrice(row.price)}
                className="flex w-full justify-between rounded-lg px-2 py-1 text-sm hover:bg-[#f2f2f4]"
              >
                <span className="text-green-600">{formatUsd(row.price)}</span>
                <span className="text-[#2d2d2d]">{row.amount.toFixed(3)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-[#929292]">Asks</p>
          <div className="mt-2 space-y-1">
            {asks.map((row) => (
              <button
                key={row.price}
                type="button"
                onClick={() => onSelectPrice(row.price)}
                className="flex w-full justify-between rounded-lg px-2 py-1 text-sm hover:bg-[#f2f2f4]"
              >
                <span className="text-red-600">{formatUsd(row.price)}</span>
                <span className="text-[#2d2d2d]">{row.amount.toFixed(3)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
