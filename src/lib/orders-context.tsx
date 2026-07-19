"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_ORDER_HISTORY, type Order } from "./orders";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safe-storage";

type OrdersContextValue = {
  orders: Order[];
  placeOrder: (order: Order) => void;
  cancelOrder: (orderId: string) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "crypto-demo-orders";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDER_HISTORY);

  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (!stored) return;
    try {
      setOrders(JSON.parse(stored) as Order[]);
    } catch {
      safeRemoveItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  function placeOrder(order: Order) {
    setOrders((current) => [order, ...current]);
  }

  function cancelOrder(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" as const } : order,
      ),
    );
  }

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return ctx;
}
