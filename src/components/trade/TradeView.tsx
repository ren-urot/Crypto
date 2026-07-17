"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { getCoin, type CoinId } from "@/lib/dashboard-data";
import { SEED_ORDER_HISTORY, type Order } from "@/lib/orders";
import MarketList from "./MarketList";
import PriceChart from "./PriceChart";
import OrderBook from "./OrderBook";
import OrderForm from "./OrderForm";
import OpenOrders from "./OpenOrders";
import OrderHistory from "./OrderHistory";

export default function TradeView() {
  const { onTrade } = useWallet();
  const [selectedCoinId, setSelectedCoinId] = useState<CoinId>("BTC");
  const [limitPrice, setLimitPrice] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orders, setOrders] = useState<Order[]>(SEED_ORDER_HISTORY);

  const coin = getCoin(selectedCoinId);

  function handleSelectCoin(coinId: CoinId) {
    setSelectedCoinId(coinId);
    setLimitPrice("");
  }

  function handlePlaceOrder(order: Order) {
    setOrders((prev) => [order, ...prev]);
  }

  function handleCancelOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "cancelled" as const }
          : order,
      ),
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
      <MarketList selectedCoinId={selectedCoinId} onSelect={handleSelectCoin} />

      <div className="space-y-8">
        <PriceChart coinId={selectedCoinId} currentPrice={coin.price} />
        <div className="grid gap-8 md:grid-cols-2">
          <OpenOrders orders={orders} onCancel={handleCancelOrder} />
          <OrderHistory orders={orders} />
        </div>
      </div>

      <div className="space-y-8">
        <OrderBook
          coinId={selectedCoinId}
          currentPrice={coin.price}
          onSelectPrice={(price) => {
            setLimitPrice(price.toFixed(2));
            setOrderType("limit");
          }}
        />
        <OrderForm
          coinId={selectedCoinId}
          currentPrice={coin.price}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          limitPrice={limitPrice}
          onLimitPriceChange={setLimitPrice}
          onMarketOrder={onTrade}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
}
