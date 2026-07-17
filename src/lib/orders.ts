import type { CoinId } from "./dashboard-data";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "filled" | "cancelled";

export type Order = {
  id: string;
  coinId: CoinId;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number;
  status: OrderStatus;
  createdAt: number;
};

let orderCounter = 0;

export function createOrder(fields: Omit<Order, "id" | "createdAt">): Order {
  orderCounter += 1;
  return {
    ...fields,
    id: `order-${orderCounter}`,
    createdAt: Date.now(),
  };
}

// Fixed, hardcoded seed rows (NOT created via createOrder/Date.now()) so
// Order History isn't empty on first load, without introducing any
// server/client hydration mismatch from a time-based value.
export const SEED_ORDER_HISTORY: Order[] = [
  {
    id: "seed-1",
    coinId: "BTC",
    side: "buy",
    type: "market",
    amount: 0.05,
    price: 60500,
    status: "filled",
    createdAt: 0,
  },
  {
    id: "seed-2",
    coinId: "ETH",
    side: "sell",
    type: "limit",
    amount: 0.8,
    price: 3550,
    status: "filled",
    createdAt: 0,
  },
];
