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
import PairHeader from "./PairHeader";
import AccountPanel from "./AccountPanel";
import QuickSelectBar from "./QuickSelectBar";

const TIME_RANGES = [
  { label: "15m", count: 48 },
  { label: "1H", count: 72 },
  { label: "4H", count: 120 },
  { label: "1D", count: 24 * 30 },
] as const;

const BOTTOM_TABS = ["Open orders", "Order history", "Assets", "Bots"] as const;

export default function TradeView() {
  const { wallet, totalValue, onTrade } = useWallet();
  const [selectedCoinId, setSelectedCoinId] = useState<CoinId>("BTC");
  const [limitPrice, setLimitPrice] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit" | "tpsl">("market");
  const [orders, setOrders] = useState<Order[]>(SEED_ORDER_HISTORY);
  const [rangeIndex, setRangeIndex] = useState(1);
  const [bottomTab, setBottomTab] = useState<(typeof BOTTOM_TABS)[number]>("Open orders");
  const [currentSymbolOnly, setCurrentSymbolOnly] = useState(false);

  const coin = getCoin(selectedCoinId);
  const visibleOrders = currentSymbolOnly
    ? orders.filter((order) => order.coinId === selectedCoinId)
    : orders;

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
        order.id === orderId ? { ...order, status: "cancelled" as const } : order,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PairHeader coin={coin} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
        <MarketList selectedCoinId={selectedCoinId} onSelect={handleSelectCoin} />

        <div className="space-y-8">
          <div>
            <div className="flex gap-2">
              {TIME_RANGES.map((range, index) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => setRangeIndex(index)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    rangeIndex === index
                      ? "bg-[#39079e] text-white"
                      : "bg-[#f2f2f4] text-[#2a2a2a] hover:bg-[#e5e5e5]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <PriceChart
                coinId={selectedCoinId}
                currentPrice={coin.price}
                candleCount={TIME_RANGES[rangeIndex].count}
                dailyVolume={coin.volume24h}
              />
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-sm font-semibold">
                {BOTTOM_TABS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setBottomTab(label)}
                    className={
                      bottomTab === label
                        ? "text-[#39079e]"
                        : "text-[#929292] hover:text-[#2a2a2a]"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(bottomTab === "Open orders" || bottomTab === "Order history") && (
                <label className="flex items-center gap-2 text-xs text-[#929292]">
                  <input
                    type="checkbox"
                    checked={currentSymbolOnly}
                    onChange={(e) => setCurrentSymbolOnly(e.target.checked)}
                  />
                  Current symbol
                </label>
              )}
            </div>

            <div className="mt-4">
              {bottomTab === "Open orders" && (
                <OpenOrders orders={visibleOrders} onCancel={handleCancelOrder} />
              )}
              {bottomTab === "Order history" && <OrderHistory orders={visibleOrders} />}
              {bottomTab === "Assets" && (
                <div className="space-y-2">
                  <div className="flex justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3">
                    <span className="font-semibold text-[#2d2d2d]">USD</span>
                    <span className="text-[#2d2d2d]">{wallet.usd.toFixed(2)}</span>
                  </div>
                  {Object.entries(wallet.holdings)
                    .filter(([, amount]) => amount > 0)
                    .map(([id, amount]) => (
                      <div
                        key={id}
                        className="flex justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
                      >
                        <span className="font-semibold text-[#2d2d2d]">{id}</span>
                        <span className="text-[#2d2d2d]">{amount}</span>
                      </div>
                    ))}
                </div>
              )}
              {bottomTab === "Bots" && (
                <p className="text-sm text-[#929292]">Trading bots are coming soon.</p>
              )}
            </div>
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
            wallet={wallet}
          />
          <AccountPanel wallet={wallet} totalValue={totalValue} coinId={selectedCoinId} />
        </div>
      </div>

      <QuickSelectBar selectedCoinId={selectedCoinId} onSelect={handleSelectCoin} />
    </div>
  );
}
