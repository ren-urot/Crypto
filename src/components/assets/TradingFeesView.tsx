"use client";

import { formatUsd } from "@/lib/dashboard-data";
import { useOrders } from "@/lib/orders-context";

const TAKER_RATE = 0.001;
const MAKER_RATE = 0.0008;

export default function TradingFeesView() {
  const { orders } = useOrders();

  const filledOrders = orders.filter((order) => order.status === "filled");
  const totalFeesPaid = filledOrders.reduce((sum, order) => {
    const notional = order.amount * order.price;
    const rate = order.type === "market" ? TAKER_RATE : MAKER_RATE;
    return sum + notional * rate;
  }, 0);

  return (
    <div className="mx-auto max-w-[700px] space-y-8">
      <div className="rounded-[20px] bg-white p-6">
        <p className="text-sm text-[#929292]">Total fees paid</p>
        <p className="mt-1 text-2xl font-semibold text-[#2d2d2d]">{formatUsd(totalFeesPaid)}</p>
        <p className="mt-2 text-xs text-[#929292]">
          Computed from {filledOrders.length} filled order{filledOrders.length === 1 ? "" : "s"}{" "}
          in Order Center, using the demo rates below.
        </p>
      </div>

      <div className="rounded-[20px] bg-white p-6 md:p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Spot fee schedule</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-[#929292]">
              <th className="pb-2 font-medium">Tier</th>
              <th className="pb-2 font-medium">Maker</th>
              <th className="pb-2 font-medium">Taker</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#e5e5e5]">
              <td className="py-3 text-[#2d2d2d]">Regular user</td>
              <td className="py-3 text-[#2d2d2d]">{(MAKER_RATE * 100).toFixed(2)}%</td>
              <td className="py-3 text-[#2d2d2d]">{(TAKER_RATE * 100).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-[#929292]">
          Demo fee figures — this app has one flat tier, not real volume-based tiers.
        </p>
      </div>
    </div>
  );
}
