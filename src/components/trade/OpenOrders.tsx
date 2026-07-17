import { formatUsd, getCoin } from "@/lib/dashboard-data";
import type { Order } from "@/lib/orders";

export default function OpenOrders({
  orders,
  onCancel,
}: {
  orders: Order[];
  onCancel: (orderId: string) => void;
}) {
  const openOrders = orders.filter((order) => order.status === "open");

  return (
    <div className="rounded-[40px] bg-white p-6 md:p-8">
      <h3 className="font-semibold text-lg text-[#39079e]">Open Orders</h3>
      {openOrders.length === 0 ? (
        <p className="mt-4 text-sm text-[#929292]">No open orders.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {openOrders.map((order) => {
            const coin = getCoin(order.coinId);
            return (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-[#2d2d2d]">
                    {order.side === "buy" ? "Buy" : "Sell"} {order.amount}{" "}
                    {coin.symbol}
                  </p>
                  <p className="text-sm text-[#929292]">
                    Limit @ {formatUsd(order.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(order.id)}
                  className="rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-[#39079e] uppercase hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
