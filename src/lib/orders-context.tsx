"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_ORDER_HISTORY, type Order } from "./orders";

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
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      setOrders(JSON.parse(stored) as Order[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persistOrders(next: Order[]) {
    setOrders(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function placeOrder(order: Order) {
    persistOrders([order, ...orders]);
  }

  function cancelOrder(orderId: string) {
    persistOrders(
      orders.map((order) =>
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
