import { formatUsd, getCoin } from "@/lib/dashboard-data";
import type { Order } from "@/lib/orders";

export default function OrderHistory({ orders }: { orders: Order[] }) {
  const history = orders.filter((order) => order.status !== "open");

  return (
    <div className="rounded-[40px] bg-white p-6 md:p-8">
      <h3 className="font-semibold text-lg text-[#39079e]">Order History</h3>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-[#929292]">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {history.map((order, index) => {
            const coin = getCoin(order.coinId);
            return (
              <div
                key={order.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index > 0 ? "border-t border-[#e5e5e5]" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-[#2d2d2d]">
                    {order.side === "buy" ? "Buy" : "Sell"} {order.amount}{" "}
                    {coin.symbol}
                  </p>
                  <p className="text-sm text-[#929292]">
                    {order.type === "market" ? "Market" : "Limit"} @{" "}
                    {formatUsd(order.price)}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase ${
                    order.status === "filled"
                      ? "text-green-600"
                      : "text-[#929292]"
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
  );
}
