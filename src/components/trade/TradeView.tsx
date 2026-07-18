"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { COINS, getCoin, type CoinId } from "@/lib/dashboard-data";
import { SEED_ORDER_HISTORY, type Order } from "@/lib/orders";
import PriceChart from "./PriceChart";
import OrderBook from "./OrderBook";
import OrderForm from "./OrderForm";
import PairHeader from "./PairHeader";
import AccountPanel from "./AccountPanel";
import FavoritesBar from "./FavoritesBar";

const TIME_RANGES = [
  { label: "15m", count: 48 },
  { label: "1H", count: 72 },
  { label: "4H", count: 120 },
  { label: "1D", count: 24 * 30 },
] as const;

const CHART_TABS = ["Chart", "Info", "Trading data", "Feed"] as const;
const BOTTOM_TABS = ["Open orders", "Order history", "Assets", "Bots"] as const;
const ORDER_SUBTABS = ["Limit | Market", "Advanced limit", "TP/SL", "Trailing stop", "Trigger"] as const;

export default function TradeView() {
  const { wallet, totalValue, onTrade } = useWallet();
  const [selectedCoinId, setSelectedCoinId] = useState<CoinId>("BTC");
  const [limitPrice, setLimitPrice] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit" | "tpsl">("market");
  const [orders, setOrders] = useState<Order[]>(SEED_ORDER_HISTORY);
  const [rangeIndex, setRangeIndex] = useState(1);
  const [chartTab, setChartTab] = useState<(typeof CHART_TABS)[number]>("Chart");
  const [bottomTab, setBottomTab] = useState<(typeof BOTTOM_TABS)[number]>("Open orders");
  const [orderSubTab, setOrderSubTab] = useState<(typeof ORDER_SUBTABS)[number]>("Limit | Market");
  const [currentSymbolOnly, setCurrentSymbolOnly] = useState(false);
  const [favorites, setFavorites] = useState<CoinId[]>([]);

  const coin = getCoin(selectedCoinId);
  const isFavorite = favorites.includes(selectedCoinId);

  function toggleFavorite() {
    setFavorites((prev) =>
      prev.includes(selectedCoinId)
        ? prev.filter((id) => id !== selectedCoinId)
        : [...prev, selectedCoinId],
    );
  }

  let visibleOrders = currentSymbolOnly
    ? orders.filter((order) => order.coinId === selectedCoinId)
    : orders;
  if (orderSubTab !== "Limit | Market") {
    visibleOrders = [];
  }

  const openOrders = visibleOrders.filter((order) => order.status === "open");
  const historyOrders = visibleOrders.filter((order) => order.status !== "open");

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
    <div className="space-y-4">
      <PairHeader
        coin={coin}
        onSelect={handleSelectCoin}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-[20px] bg-white p-6">
            <div className="flex gap-6 border-b border-[#e5e5e5] text-sm font-semibold">
              {CHART_TABS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setChartTab(label)}
                  className={`pb-2 ${
                    chartTab === label
                      ? "border-b-2 border-[#39079e] text-[#39079e]"
                      : "text-[#929292] hover:text-[#2a2a2a]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {chartTab === "Chart" ? (
              <>
                <div className="mt-4 flex gap-2">
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
              </>
            ) : (
              <p className="mt-6 text-sm text-[#929292]">{chartTab} coming soon.</p>
            )}
          </div>

          <div className="rounded-[20px] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-sm font-semibold">
                {BOTTOM_TABS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setBottomTab(label)}
                    className={
                      bottomTab === label ? "text-[#39079e]" : "text-[#929292] hover:text-[#2a2a2a]"
                    }
                  >
                    {label === "Open orders" ? `Open orders (${openOrders.length})` : label}
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

            {(bottomTab === "Open orders" || bottomTab === "Order history") && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {ORDER_SUBTABS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setOrderSubTab(label)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      orderSubTab === label
                        ? "bg-[#f2f2f4] text-[#39079e]"
                        : "text-[#929292] hover:text-[#2a2a2a]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              {bottomTab === "Open orders" &&
                (openOrders.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {openOrders.map((order) => {
                      const orderCoin = getCoin(order.coinId);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-[#2d2d2d]">
                              {order.side === "buy" ? "Buy" : "Sell"} {order.amount} {orderCoin.symbol}
                            </p>
                            <p className="text-sm text-[#929292]">
                              Limit @ {order.price.toLocaleString("en-US")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-[#39079e] uppercase hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {bottomTab === "Order history" &&
                (historyOrders.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {historyOrders.map((order) => {
                      const orderCoin = getCoin(order.coinId);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-[#2d2d2d]">
                              {order.side === "buy" ? "Buy" : "Sell"} {order.amount} {orderCoin.symbol}
                            </p>
                            <p className="text-sm text-[#929292]">
                              {order.type === "market" ? "Market" : "Limit"} @{" "}
                              {order.price.toLocaleString("en-US")}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold uppercase ${
                              order.status === "filled" ? "text-green-600" : "text-[#929292]"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {bottomTab === "Assets" && (
                <div className="space-y-2">
                  <div className="flex justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3">
                    <span className="font-semibold text-[#2d2d2d]">USDT</span>
                    <span className="text-[#2d2d2d]">{wallet.usd.toFixed(2)}</span>
                  </div>
                  {COINS.filter((c) => wallet.holdings[c.id] > 0).map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3"
                    >
                      <span className="font-semibold text-[#2d2d2d]">{c.id}</span>
                      <span className="text-[#2d2d2d]">{wallet.holdings[c.id]}</span>
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

        <div className="space-y-4">
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

      <FavoritesBar
        selectedCoinId={selectedCoinId}
        onSelect={handleSelectCoin}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Inbox size={40} className="text-[#c9c9c9]" />
      <p className="text-sm text-[#929292]">No records found</p>
    </div>
  );
}
