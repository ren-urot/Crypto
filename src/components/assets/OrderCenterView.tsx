"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { getCoin } from "@/lib/dashboard-data";
import { useOrders } from "@/lib/orders-context";

const TABS = ["Open orders", "Order history"] as const;

export default function OrderCenterView() {
  const { orders, cancelOrder } = useOrders();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Open orders");

  const openOrders = orders.filter((order) => order.status === "open");
  const historyOrders = orders.filter((order) => order.status !== "open");
  const visible = tab === "Open orders" ? openOrders : historyOrders;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <div className="flex gap-6 border-b border-[#e5e5e5] text-sm font-semibold">
          {TABS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={`pb-3 ${
                tab === label
                  ? "border-b-2 border-[#39079e] text-[#39079e]"
                  : "text-[#929292] hover:text-[#2a2a2a]"
              }`}
            >
              {label === "Open orders" ? `${label} (${openOrders.length})` : label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox size={40} className="text-[#c9c9c9]" />
              <p className="text-sm text-[#929292]">No records found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((order) => {
                const coin = getCoin(order.coinId);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-[#2d2d2d]">
                        {order.side === "buy" ? "Buy" : "Sell"} {order.amount} {coin.symbol}
                      </p>
                      <p className="text-sm text-[#929292]">
                        {order.type === "market" ? "Market" : "Limit"} @{" "}
                        {order.price.toLocaleString("en-US")}
                      </p>
                    </div>
                    {order.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order.id)}
                        className="rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-[#39079e] uppercase hover:bg-white"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span
                        className={`text-xs font-semibold uppercase ${
                          order.status === "filled" ? "text-green-600" : "text-[#929292]"
                        }`}
                      >
                        {order.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
