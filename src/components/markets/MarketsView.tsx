"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronsUpDown } from "lucide-react";
import {
  COINS,
  formatUsd,
  formatPercent,
  formatCompactUsd,
  type Coin,
  type CoinId,
} from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import Sparkline from "./Sparkline";

const ASSET_CLASSES = [
  "Favorites",
  "Crypto",
  "Spot",
  "Futures",
  "Events & Options",
  "DEX",
] as const;
type AssetClass = (typeof ASSET_CLASSES)[number];

type Category =
  | "all"
  | "hot"
  | "top"
  | "new"
  | "stocks"
  | "commodities"
  | "ai"
  | "meme"
  | "defi"
  | "layer1-2"
  | "top-gainers"
  | "top-losers";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hot", label: "Hot" },
  { key: "top", label: "Top" },
  { key: "new", label: "New" },
  { key: "stocks", label: "Stocks" },
  { key: "commodities", label: "Commodities" },
  { key: "ai", label: "AI" },
  { key: "meme", label: "Meme" },
  { key: "defi", label: "DeFi" },
  { key: "layer1-2", label: "Layer 1&2" },
  { key: "top-gainers", label: "Top gainers" },
  { key: "top-losers", label: "Top losers" },
];

const LAYER_1_2_IDS: CoinId[] = ["BTC", "ETH", "SOL", "ADA", "DOT", "BNB", "MATIC"];

function filterByCategory(coins: Coin[], category: Category): Coin[] {
  switch (category) {
    case "hot":
      return [...coins].sort(
        (a, b) => Math.abs(b.change24h) - Math.abs(a.change24h),
      );
    case "top":
      return [...coins].sort((a, b) => b.marketCap - a.marketCap);
    case "top-gainers":
      return coins
        .filter((coin) => coin.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h);
    case "top-losers":
      return coins
        .filter((coin) => coin.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h);
    case "meme":
      return coins.filter((coin) => coin.id === "DOGE");
    case "layer1-2":
      return coins.filter((coin) => LAYER_1_2_IDS.includes(coin.id));
    case "new":
    case "stocks":
    case "commodities":
    case "ai":
    case "defi":
      return [];
    default:
      return coins;
  }
}

type SortKey = "name" | "price" | "change" | "marketCap";

function sortCoins(
  coins: Coin[],
  sortBy: SortKey | null,
  sortDir: "asc" | "desc",
): Coin[] {
  if (!sortBy) return coins;
  const sorted = [...coins].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "change":
        return a.change24h - b.change24h;
      case "marketCap":
        return a.marketCap - b.marketCap;
    }
  });
  return sortDir === "asc" ? sorted : sorted.reverse();
}

function getSparklineAndRange(coin: Coin) {
  const candles = generateCandles(coin.id, coin.price, 24);
  const closes = candles.map((candle) => candle.close);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  return { closes, low, high };
}

function SortableHeader({
  label,
  sortKey,
  activeSort,
  sortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey | null;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeSort === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 pb-4 font-medium ${
        isActive ? "text-[#39079e]" : "text-[#929292] hover:text-[#2a2a2a]"
      }`}
    >
      {label}
      <ChevronsUpDown
        className={`size-3.5 ${
          isActive
            ? sortDir === "asc"
              ? "rotate-180"
              : ""
            : "text-[#c9c9c9]"
        }`}
      />
    </button>
  );
}

export default function MarketsView() {
  const [assetClass, setAssetClass] = useState<AssetClass>("Crypto");
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const searched = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );
  const categorized = filterByCategory(searched, category);
  const filtered = sortCoins(categorized, sortBy, sortDir);

  return (
    <div className="mx-auto max-w-[1228px]">
      <div className="rounded-[20px] bg-white p-6 md:p-10">
        <div className="flex items-center justify-between gap-4 overflow-x-auto border-b border-[#e5e5e5] pb-4">
          <div className="flex gap-8">
            {ASSET_CLASSES.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setAssetClass(label)}
                className={`shrink-0 pb-1 text-sm font-semibold whitespace-nowrap ${
                  assetClass === label
                    ? "border-b-2 border-[#39079e] text-[#39079e]"
                    : "text-[#929292] hover:text-[#2a2a2a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Search className="size-5 shrink-0 text-[#929292]" />
        </div>

        {assetClass !== "Crypto" ? (
          <p className="mt-6 text-sm text-[#929292]">
            {assetClass} markets are coming soon.
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                      category === cat.key
                        ? "bg-[#39079e] text-white"
                        : "text-[#2a2a2a] hover:bg-[#f2f2f4]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-sm text-[#2a2a2a] hover:bg-[#f2f2f4]"
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search markets"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full max-w-[320px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-sm text-[#929292]">
                    <th className="pb-4 font-medium">
                      <SortableHeader
                        label="Name"
                        sortKey="name"
                        activeSort={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="pb-4 font-medium">
                      <SortableHeader
                        label="Price"
                        sortKey="price"
                        activeSort={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="pb-4 font-medium">
                      <SortableHeader
                        label="24h Change"
                        sortKey="change"
                        activeSort={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="pb-4 font-medium">Last 24h</th>
                    <th className="pb-4 font-medium">24h Range</th>
                    <th className="pb-4 font-medium">
                      <SortableHeader
                        label="Market Cap"
                        sortKey="marketCap"
                        activeSort={sortBy}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="pb-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((coin) => {
                    const { closes, low, high } = getSparklineAndRange(coin);
                    const isUp = coin.change24h >= 0;
                    return (
                      <tr key={coin.id} className="border-t border-[#e5e5e5]">
                        <td className="py-4">
                          <p className="font-semibold text-[#39079e]">
                            {coin.symbol}
                          </p>
                          <p className="text-sm text-[#929292]">
                            {coin.name}
                          </p>
                        </td>
                        <td className="py-4 text-[#2d2d2d]">
                          {formatUsd(coin.price)}
                        </td>
                        <td
                          className={`py-4 ${
                            isUp ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatPercent(coin.change24h)}
                        </td>
                        <td className="py-4">
                          <Sparkline
                            values={closes}
                            color={isUp ? "#16a34a" : "#dc2626"}
                          />
                        </td>
                        <td className="py-4 text-sm text-[#929292]">
                          {formatUsd(low)} - {formatUsd(high)}
                        </td>
                        <td className="py-4 text-[#2d2d2d]">
                          {formatCompactUsd(coin.marketCap)}
                        </td>
                        <td className="py-4 text-right text-sm whitespace-nowrap">
                          <Link
                            href={`/markets/${coin.id.toLowerCase()}`}
                            className="font-semibold text-[#39079e] hover:underline"
                          >
                            Details
                          </Link>
                          <span className="mx-2 text-[#e5e5e5]">|</span>
                          <Link
                            href="/trade"
                            className="font-semibold text-[#39079e] hover:underline"
                          >
                            Trade
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-sm text-[#929292]"
                      >
                        {query
                          ? `No markets match "${query}".`
                          : "No markets in this category yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
