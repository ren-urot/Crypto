# Trade Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/trade` page with OKX-style core spot trading (market list, price chart, order book, market/limit order form, open orders, order history), sharing the wallet from `/dashboard` via a new Context, using the site's existing purple/orange branding.

**Architecture:** Extract wallet state from `Dashboard` into a `WalletProvider` Context so `/dashboard` and `/trade` share one in-memory account. Expand the dummy market data from 3 to 10 coins. Add small seeded-PRNG-backed generators for deterministic (hydration-safe) candlestick and order-book data. Build `/trade` from six new focused components composed by one `TradeView`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript, `lightweight-charts` (new dependency, for the candlestick chart). No test framework (existing project convention) — verification is manual.

## Global Constraints

- New dependency: `lightweight-charts` — approved, install via `npm install lightweight-charts`. No other new dependencies.
- No real backend, no real price feed, no order-matching engine. Limit orders sit in Open Orders until manually cancelled.
- Branding stays exactly as-is: purple `#39079e` headings, `#2d2d2d` body text, `#929292` secondary text, `#f2f2f4` section background, white rounded cards, orange `#ffb506` CTA with `#e6a205` hover. This is a functionality port from OKX, not a visual restyle.
- Exception: 24h price-change indicators and order-book bids/asks use standard financial green-for-up / red-for-down (`text-green-600` / `text-red-600`, Tailwind's built-in palette) — this is universal trading-UI convention, not a brand-color change, and applies only to those specific up/down indicators.
- All dummy time-series data (candles, order book) MUST be generated deterministically from a seed (coin id), never from unseeded `Math.random()` or `Date.now()` computed during render — Next.js server-renders then hydrates, and non-deterministic render-time values cause hydration mismatches.
- `useWallet()` throws if called outside `WalletProvider` — this is intentional (fail fast on a real wiring bug), not a gap to soften.

---

### Task 1: Expand market data — 10 coins, 24h change, volume, wallet holdings

**Files:**
- Modify: `src/lib/dashboard-data.ts`

**Interfaces:**
- Produces: `CoinId` grows to 10 values. `Coin` gains `change24h: number` and `volume24h: number`. `INITIAL_WALLET.holdings` gains entries for all 10. New `formatPercent(value: number): string`. All consumed by Tasks 2-4 and by the *existing* `WalletSummary`/`HoldingsTable`/`TradePanel` (unchanged files — they already `.map()` over `COINS` generically, so they'll automatically render 10 coins instead of 3 with zero code changes to those files).

- [ ] **Step 1: Replace the full contents of `dashboard-data.ts`**

```ts
export type CoinId =
  | "BTC"
  | "ETH"
  | "SOL"
  | "XRP"
  | "ADA"
  | "DOGE"
  | "BNB"
  | "MATIC"
  | "LTC"
  | "DOT";

export type Coin = {
  id: CoinId;
  name: string;
  symbol: CoinId;
  price: number;
  change24h: number;
  volume24h: number;
};

export const COINS: Coin[] = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 62000, change24h: 2.34, volume24h: 28_500_000_000 },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3400, change24h: -1.12, volume24h: 12_300_000_000 },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 145, change24h: 5.67, volume24h: 3_800_000_000 },
  { id: "XRP", name: "XRP", symbol: "XRP", price: 0.62, change24h: 3.1, volume24h: 1_900_000_000 },
  { id: "ADA", name: "Cardano", symbol: "ADA", price: 0.45, change24h: -0.85, volume24h: 620_000_000 },
  { id: "DOGE", name: "Dogecoin", symbol: "DOGE", price: 0.15, change24h: 8.9, volume24h: 1_400_000_000 },
  { id: "BNB", name: "BNB", symbol: "BNB", price: 590, change24h: 0.45, volume24h: 1_100_000_000 },
  { id: "MATIC", name: "Polygon", symbol: "MATIC", price: 0.55, change24h: -2.2, volume24h: 340_000_000 },
  { id: "LTC", name: "Litecoin", symbol: "LTC", price: 95, change24h: 1.05, volume24h: 480_000_000 },
  { id: "DOT", name: "Polkadot", symbol: "DOT", price: 6.8, change24h: -0.3, volume24h: 210_000_000 },
];

export type Wallet = {
  usd: number;
  holdings: Record<CoinId, number>;
};

export const INITIAL_WALLET: Wallet = {
  usd: 10000,
  holdings: {
    BTC: 0.25,
    ETH: 2.5,
    SOL: 40,
    XRP: 0,
    ADA: 0,
    DOGE: 0,
    BNB: 0,
    MATIC: 0,
    LTC: 0,
    DOT: 0,
  },
};

export function getCoin(id: CoinId): Coin {
  const coin = COINS.find((c) => c.id === id);
  if (!coin) throw new Error(`Unknown coin: ${id}`);
  return coin;
}

export function getTotalValue(wallet: Wallet): number {
  return (
    wallet.usd +
    COINS.reduce(
      (sum, coin) => sum + wallet.holdings[coin.id] * coin.price,
      0,
    )
  );
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no output (the existing `Dashboard`/`WalletSummary`/`HoldingsTable`/`TradePanel` files must still type-check against the expanded `CoinId`/`Wallet` types with zero changes to those files).

Start the dev server if not running: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &`, wait ~2s.

```bash
curl -s http://localhost:3001/dashboard | grep -o "Polkadot" | wc -l
```
Expected: `1` or more (proves the wallet summary/holdings table now render the new coins automatically).

Manual browser check: open `http://localhost:3001/dashboard`, confirm the wallet summary and holdings table now show all 10 coins, and the trade panel's coin dropdown lists all 10. Confirm the original 3 trade scenarios (buy BTC, sell ETH, oversized-sell-rejected) still work exactly as before.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dashboard-data.ts
git commit -m "feat: expand dummy market data to 10 coins with 24h change and volume"
```

---

### Task 2: Shared wallet Context — extract state from `Dashboard`

**Files:**
- Create: `src/lib/wallet-context.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/dashboard/Dashboard.tsx`

**Interfaces:**
- Produces: `WalletProvider` (wraps `children`, no other props) and `useWallet()` returning `{ wallet: Wallet; totalValue: number; onTrade: (coinId: CoinId, side: "buy"|"sell", amount: number) => TradeResult }` where `TradeResult = { ok: true; message: string } | { ok: false; reason: string }` — from `@/lib/wallet-context`. Consumed by `Dashboard.tsx` (this task) and by `OrderForm.tsx` (Task 4).

- [ ] **Step 1: Create the wallet Context**

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  COINS,
  INITIAL_WALLET,
  formatUsd,
  getTotalValue,
  type CoinId,
  type Wallet,
} from "./dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

type WalletContextValue = {
  wallet: Wallet;
  totalValue: number;
  onTrade: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  function onTrade(
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ): TradeResult {
    const coin = COINS.find((c) => c.id === coinId)!;
    const cost = amount * coin.price;

    if (side === "sell") {
      if (amount > wallet.holdings[coinId]) {
        return {
          ok: false,
          reason: `You only have ${wallet.holdings[coinId]} ${coin.symbol}.`,
        };
      }
      setWallet({
        usd: wallet.usd + cost,
        holdings: {
          ...wallet.holdings,
          [coinId]: wallet.holdings[coinId] - amount,
        },
      });
      return {
        ok: true,
        message: `Sold ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
      };
    }

    if (cost > wallet.usd) {
      return {
        ok: false,
        reason: `That would cost ${formatUsd(cost)}, more than your ${formatUsd(
          wallet.usd,
        )} cash balance.`,
      };
    }
    setWallet({
      usd: wallet.usd - cost,
      holdings: {
        ...wallet.holdings,
        [coinId]: wallet.holdings[coinId] + amount,
      },
    });
    return {
      ok: true,
      message: `Bought ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
    };
  }

  return (
    <WalletContext.Provider
      value={{ wallet, totalValue: getTotalValue(wallet), onTrade }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
```

Save as `src/lib/wallet-context.tsx`.

- [ ] **Step 2: Wrap the app in `WalletProvider`**

Modify `src/app/layout.tsx`. Current file:

```tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crypto: Fastest & secure platform to invest in crypto",
  description:
    "Buy and sell cryptocurrencies, trusted by 10M wallets with over $30 billion in transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

New file:

```tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/lib/wallet-context";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crypto: Fastest & secure platform to invest in crypto",
  description:
    "Buy and sell cryptocurrencies, trusted by 10M wallets with over $30 billion in transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col">
          <WalletProvider>{children}</WalletProvider>
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Refactor `Dashboard` to consume `useWallet()`**

Modify `src/components/dashboard/Dashboard.tsx`. Current file:

```tsx
"use client";

import { useState } from "react";
import {
  COINS,
  INITIAL_WALLET,
  formatUsd,
  getTotalValue,
  type CoinId,
  type Wallet,
} from "@/lib/dashboard-data";
import WalletSummary from "./WalletSummary";
import HoldingsTable from "./HoldingsTable";
import TradePanel from "./TradePanel";

export default function Dashboard() {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  function onTrade(coinId: CoinId, side: "buy" | "sell", amount: number) {
    const coin = COINS.find((c) => c.id === coinId)!;
    const cost = amount * coin.price;

    if (side === "sell") {
      if (amount > wallet.holdings[coinId]) {
        return {
          ok: false as const,
          reason: `You only have ${wallet.holdings[coinId]} ${coin.symbol}.`,
        };
      }
      setWallet({
        usd: wallet.usd + cost,
        holdings: {
          ...wallet.holdings,
          [coinId]: wallet.holdings[coinId] - amount,
        },
      });
      return {
        ok: true as const,
        message: `Sold ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
      };
    }

    if (cost > wallet.usd) {
      return {
        ok: false as const,
        reason: `That would cost ${formatUsd(cost)}, more than your ${formatUsd(
          wallet.usd,
        )} cash balance.`,
      };
    }
    setWallet({
      usd: wallet.usd - cost,
      holdings: {
        ...wallet.holdings,
        [coinId]: wallet.holdings[coinId] + amount,
      },
    });
    return {
      ok: true as const,
      message: `Bought ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
    };
  }

  return (
    <div className="space-y-8">
      <WalletSummary wallet={wallet} totalValue={getTotalValue(wallet)} />
      <HoldingsTable wallet={wallet} />
      <TradePanel onTrade={onTrade} />
    </div>
  );
}
```

New file:

```tsx
"use client";

import { useWallet } from "@/lib/wallet-context";
import WalletSummary from "./WalletSummary";
import HoldingsTable from "./HoldingsTable";
import TradePanel from "./TradePanel";

export default function Dashboard() {
  const { wallet, totalValue, onTrade } = useWallet();

  return (
    <div className="space-y-8">
      <WalletSummary wallet={wallet} totalValue={totalValue} />
      <HoldingsTable wallet={wallet} />
      <TradePanel onTrade={onTrade} />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

Manual browser check: open `http://localhost:3001/dashboard`. Re-run the same 4 trade scenarios as the original dashboard work (valid buy, valid sell, oversized sell rejected, over-budget buy rejected) and confirm identical behavior to before this refactor — this proves the Context extraction preserved behavior exactly.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wallet-context.tsx src/app/layout.tsx src/components/dashboard/Dashboard.tsx
git commit -m "refactor: lift wallet state into a shared WalletProvider context"
```

---

### Task 3: Seeded candles, market list, price chart — first `/trade` milestone

**Files:**
- Create: `src/lib/seeded-random.ts`
- Create: `src/lib/candles.ts`
- Create: `src/components/trade/MarketList.tsx`
- Create: `src/components/trade/PriceChart.tsx`
- Create: `src/app/trade/page.tsx`
- Modify: `package.json` / `package-lock.json` (via `npm install`)

**Interfaces:**
- Produces: `createSeededRandom(seed: string): () => number` from `@/lib/seeded-random` — a fresh generator per call, deterministic per seed string. Consumed by `candles.ts` (this task) and `order-book.ts` (Task 4).
- Produces: `generateCandles(coinId: string, currentPrice: number, count?: number): Candle[]` where `Candle = { time: number; open: number; high: number; low: number; close: number }`, from `@/lib/candles`. Consumed by `PriceChart.tsx` (this task).

- [ ] **Step 1: Install `lightweight-charts`**

```bash
npm install lightweight-charts
```

- [ ] **Step 2: Create the seeded PRNG**

```ts
export function createSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let state = (h >>> 0) || 1;

  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Save as `src/lib/seeded-random.ts`. This is a string-seeded mulberry32 PRNG — the same seed string always produces the same sequence, which is what keeps server-render and client-hydration output identical for the dummy time-series data.

- [ ] **Step 3: Create the candle generator**

```ts
import { createSeededRandom } from "./seeded-random";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Fixed reference timestamp (2026-07-17T00:00:00Z), NOT Date.now() — the
// series must render identically on the server and after client hydration.
const REFERENCE_TIME = Math.floor(
  new Date("2026-07-17T00:00:00Z").getTime() / 1000,
);
const HOUR_SECONDS = 3600;

export function generateCandles(
  coinId: string,
  currentPrice: number,
  count = 60,
): Candle[] {
  const random = createSeededRandom(coinId);

  const rawCloses: number[] = [1];
  for (let i = 1; i < count; i++) {
    const changePercent = (random() - 0.5) * 0.04;
    rawCloses.push(rawCloses[i - 1] * (1 + changePercent));
  }
  const scale = currentPrice / rawCloses[rawCloses.length - 1];

  const candles: Candle[] = [];
  let prevClose = rawCloses[0] * scale * (1 + (random() - 0.5) * 0.02);
  for (let i = 0; i < count; i++) {
    const close = rawCloses[i] * scale;
    const open = i === 0 ? prevClose : candles[i - 1].close;
    const high = Math.max(open, close) * (1 + random() * 0.008);
    const low = Math.min(open, close) * (1 - random() * 0.008);
    candles.push({
      time: REFERENCE_TIME - (count - 1 - i) * HOUR_SECONDS,
      open,
      high,
      low,
      close,
    });
  }
  return candles;
}
```

Save as `src/lib/candles.ts`. Note: `rawCloses[rawCloses.length - 1] * scale === currentPrice` by construction, so the series always ends exactly at the coin's current dummy price.

- [ ] **Step 4: Create `MarketList`**

```tsx
"use client";

import { useState } from "react";
import {
  COINS,
  formatUsd,
  formatPercent,
  type CoinId,
} from "@/lib/dashboard-data";

export default function MarketList({
  selectedCoinId,
  onSelect,
}: {
  selectedCoinId: CoinId;
  onSelect: (coinId: CoinId) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="rounded-[40px] bg-white p-6">
      <input
        type="text"
        placeholder="Search markets"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
      />

      <div className="mt-4 max-h-[420px] space-y-1 overflow-y-auto">
        {filtered.map((coin) => (
          <button
            key={coin.id}
            type="button"
            onClick={() => onSelect(coin.id)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
              coin.id === selectedCoinId
                ? "bg-[#f2f2f4]"
                : "hover:bg-[#f2f2f4]"
            }`}
          >
            <div>
              <p className="font-semibold text-[#39079e]">{coin.symbol}</p>
              <p className="text-sm text-[#929292]">{coin.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[#2d2d2d]">{formatUsd(coin.price)}</p>
              <p
                className={
                  coin.change24h >= 0
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {formatPercent(coin.change24h)}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-sm text-[#929292]">
            No markets match &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
```

Save as `src/components/trade/MarketList.tsx`.

- [ ] **Step 5: Create `PriceChart`**

`lightweight-charts`'s exact chart/series-creation API differs between major versions (v4 used `chart.addCandlestickSeries(options)`; v5 uses `chart.addSeries(CandlestickSeries, options)` with a separately-imported series-type constant). Before writing this file, check which API the installed version exposes:

```bash
grep -n "addSeries\|addCandlestickSeries\|CandlestickSeries" node_modules/lightweight-charts/dist/typings.d.ts | head -20
```

Use whichever API the installed version's types actually expose. The reference implementation below targets the v5-style `addSeries(CandlestickSeries, ...)` API — adjust the `createChart`/series-creation calls if the installed version differs, but keep the same component props, colors, and behavior:

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { generateCandles } from "@/lib/candles";
import type { CoinId } from "@/lib/dashboard-data";

export default function PriceChart({
  coinId,
  currentPrice,
}: {
  coinId: CoinId;
  currentPrice: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart: IChartApi = createChart(container, {
      width: container.clientWidth,
      height: 360,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#2d2d2d",
      },
      grid: {
        vertLines: { color: "#f2f2f4" },
        horzLines: { color: "#f2f2f4" },
      },
      timeScale: { timeVisible: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    series.setData(
      generateCandles(coinId, currentPrice).map((candle) => ({
        ...candle,
        time: candle.time as UTCTimestamp,
      })),
    );

    function handleResize() {
      if (container) {
        chart.applyOptions({ width: container.clientWidth });
      }
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [coinId, currentPrice]);

  return (
    <div className="rounded-[40px] bg-white p-6">
      <div ref={containerRef} />
    </div>
  );
}
```

Save as `src/components/trade/PriceChart.tsx`.

- [ ] **Step 6: Create a minimal `/trade` page (Market List + Price Chart only)**

This is an intermediate milestone — Task 4 will replace this file's contents with the full trading view (order book, order form, open orders, history). For now:

```tsx
"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MarketList from "@/components/trade/MarketList";
import PriceChart from "@/components/trade/PriceChart";
import { getCoin, type CoinId } from "@/lib/dashboard-data";

export default function TradePage() {
  const [selectedCoinId, setSelectedCoinId] = useState<CoinId>("BTC");
  const coin = getCoin(selectedCoinId);

  return (
    <>
      <PageHeader
        title="Trade"
        description="Buy and sell crypto with live-feeling markets, an order book, and full order history, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[280px_1fr]">
          <MarketList
            selectedCoinId={selectedCoinId}
            onSelect={setSelectedCoinId}
          />
          <PriceChart coinId={selectedCoinId} currentPrice={coin.price} />
        </div>
      </section>
    </>
  );
}
```

Save as `src/app/trade/page.tsx`. Note this page is a Client Component (`"use client"` at the top) because it owns `selectedCoinId` state directly for this milestone — Task 4 restructures this into a Server Component shell wrapping a client `TradeView`.

- [ ] **Step 7: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/trade
```
Expected: `200`.

Manual browser check: open `http://localhost:3001/trade`. Confirm the market list shows all 10 coins with colored (green/red) 24h change badges, typing in the search box filters the list, and clicking a different coin updates the candlestick chart (a real chart should render — candlesticks visible, not a blank box or console error). Reload the page once and confirm the chart looks the same (proves the seeded data is deterministic, no hydration warning in the console).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/lib/seeded-random.ts src/lib/candles.ts \
  src/components/trade/MarketList.tsx src/components/trade/PriceChart.tsx src/app/trade/page.tsx
git commit -m "feat: add market list and price chart to a new /trade page"
```

---

### Task 4: Order book, order form, open orders, order history — full `/trade` composition

**Files:**
- Create: `src/lib/order-book.ts`
- Create: `src/lib/orders.ts`
- Create: `src/components/trade/OrderBook.tsx`
- Create: `src/components/trade/OrderForm.tsx`
- Create: `src/components/trade/OpenOrders.tsx`
- Create: `src/components/trade/OrderHistory.tsx`
- Create: `src/components/trade/TradeView.tsx`
- Modify: `src/app/trade/page.tsx`

**Interfaces:**
- Consumes: `createSeededRandom` from `@/lib/seeded-random` (Task 3). `useWallet()` from `@/lib/wallet-context` (Task 2) — specifically its `onTrade` function.
- Produces: `generateOrderBook(coinId: string, currentPrice: number, depth?: number): { bids: OrderBookRow[]; asks: OrderBookRow[] }` where `OrderBookRow = { price: number; amount: number }`, from `@/lib/order-book`. Consumed only within this task (`OrderBook.tsx`).
- Produces: `Order`, `OrderSide`, `OrderType`, `OrderStatus`, `createOrder`, `SEED_ORDER_HISTORY` from `@/lib/orders`. Consumed only within this task.

- [ ] **Step 1: Create the order book generator**

```ts
import { createSeededRandom } from "./seeded-random";

export type OrderBookRow = { price: number; amount: number };

export function generateOrderBook(
  coinId: string,
  currentPrice: number,
  depth = 8,
): { bids: OrderBookRow[]; asks: OrderBookRow[] } {
  const random = createSeededRandom(`${coinId}-book`);

  const bids: OrderBookRow[] = [];
  let price = currentPrice;
  for (let i = 0; i < depth; i++) {
    price = price * (1 - random() * 0.002 - 0.0002);
    bids.push({ price, amount: 0.1 + random() * 5 });
  }

  price = currentPrice;
  const asks: OrderBookRow[] = [];
  for (let i = 0; i < depth; i++) {
    price = price * (1 + random() * 0.002 + 0.0002);
    asks.push({ price, amount: 0.1 + random() * 5 });
  }

  return { bids, asks };
}
```

Save as `src/lib/order-book.ts`. Note the seed is `${coinId}-book`, distinct from `candles.ts`'s plain `coinId` seed, so the two generators don't produce correlated output for the same coin.

- [ ] **Step 2: Create the order types and seed history**

```ts
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
```

Save as `src/lib/orders.ts`. `createOrder` is only ever called from client event handlers (form submit, button click) in this plan, never during render, so its use of `Date.now()` never runs during server-side rendering and cannot cause a hydration mismatch.

- [ ] **Step 3: Create `OrderBook`**

```tsx
"use client";

import { generateOrderBook } from "@/lib/order-book";
import { formatUsd, type CoinId } from "@/lib/dashboard-data";

export default function OrderBook({
  coinId,
  currentPrice,
  onSelectPrice,
}: {
  coinId: CoinId;
  currentPrice: number;
  onSelectPrice: (price: number) => void;
}) {
  const { bids, asks } = generateOrderBook(coinId, currentPrice);

  return (
    <div className="rounded-[40px] bg-white p-6">
      <h3 className="font-semibold text-lg text-[#39079e]">Order Book</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-[#929292]">Bids</p>
          <div className="mt-2 space-y-1">
            {bids.map((row) => (
              <button
                key={row.price}
                type="button"
                onClick={() => onSelectPrice(row.price)}
                className="flex w-full justify-between rounded-lg px-2 py-1 text-sm hover:bg-[#f2f2f4]"
              >
                <span className="text-green-600">{formatUsd(row.price)}</span>
                <span className="text-[#2d2d2d]">{row.amount.toFixed(3)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-[#929292]">Asks</p>
          <div className="mt-2 space-y-1">
            {asks.map((row) => (
              <button
                key={row.price}
                type="button"
                onClick={() => onSelectPrice(row.price)}
                className="flex w-full justify-between rounded-lg px-2 py-1 text-sm hover:bg-[#f2f2f4]"
              >
                <span className="text-red-600">{formatUsd(row.price)}</span>
                <span className="text-[#2d2d2d]">{row.amount.toFixed(3)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Save as `src/components/trade/OrderBook.tsx`.

- [ ] **Step 4: Create `OrderForm`**

```tsx
"use client";

import { useState } from "react";
import { formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";
import { createOrder, type Order } from "@/lib/orders";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function OrderForm({
  coinId,
  currentPrice,
  limitPrice,
  onLimitPriceChange,
  onMarketOrder,
  onPlaceOrder,
}: {
  coinId: CoinId;
  currentPrice: number;
  limitPrice: string;
  onLimitPriceChange: (value: string) => void;
  onMarketOrder: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
  onPlaceOrder: (order: Order) => void;
}) {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = getCoin(coinId);
  const parsedAmount = Number(amount);
  const effectivePrice =
    orderType === "market" ? currentPrice : Number(limitPrice) || currentPrice;
  const estimate = Number.isFinite(parsedAmount)
    ? parsedAmount * effectivePrice
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }

    if (orderType === "market") {
      const tradeResult = onMarketOrder(coinId, side, parsedAmount);
      setResult(tradeResult);
      if (tradeResult.ok) {
        setAmount("");
        onPlaceOrder(
          createOrder({
            coinId,
            side,
            type: "market",
            amount: parsedAmount,
            price: currentPrice,
            status: "filled",
          }),
        );
      }
      return;
    }

    const parsedLimitPrice = Number(limitPrice);
    if (!Number.isFinite(parsedLimitPrice) || parsedLimitPrice <= 0) {
      setResult({ ok: false, reason: "Enter a limit price greater than zero." });
      return;
    }

    onPlaceOrder(
      createOrder({
        coinId,
        side,
        type: "limit",
        amount: parsedAmount,
        price: parsedLimitPrice,
        status: "open",
      }),
    );
    setResult({
      ok: true,
      message: `Limit ${side} order placed: ${parsedAmount} ${coin.symbol} at ${formatUsd(
        parsedLimitPrice,
      )}.`,
    });
    setAmount("");
  }

  return (
    <div className="rounded-[40px] bg-white p-6 md:p-8">
      <h3 className="font-semibold text-lg text-[#39079e]">Place Order</h3>

      <div className="mt-4 flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => setOrderType("market")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            orderType === "market"
              ? "bg-[#39079e] text-white"
              : "text-[#2a2a2a]"
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => setOrderType("limit")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            orderType === "limit"
              ? "bg-[#39079e] text-white"
              : "text-[#2a2a2a]"
          }`}
        >
          Limit
        </button>
      </div>

      <div className="mt-3 flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "buy" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "sell" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {orderType === "limit" && (
          <div>
            <label
              htmlFor="order-price"
              className="text-sm font-semibold text-[#2a2a2a]"
            >
              Price (USD)
            </label>
            <input
              id="order-price"
              type="number"
              step="any"
              min="0"
              required
              value={limitPrice}
              onChange={(e) => onLimitPriceChange(e.target.value)}
              className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="order-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Amount ({coin.symbol})
          </label>
          <input
            id="order-amount"
            type="number"
            step="any"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
          <p className="mt-2 text-sm text-[#929292]">
            Estimated {side === "buy" ? "cost" : "proceeds"}:{" "}
            {formatUsd(estimate)}
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
        >
          {orderType === "market" ? "Place Market Order" : "Place Limit Order"}
        </button>

        {result && (
          <p
            className={`text-sm ${
              result.ok ? "text-[#2d2d2d]" : "text-red-600"
            }`}
          >
            {result.ok ? result.message : result.reason}
          </p>
        )}
      </form>
    </div>
  );
}
```

Save as `src/components/trade/OrderForm.tsx`.

- [ ] **Step 5: Create `OpenOrders`**

```tsx
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
```

Save as `src/components/trade/OpenOrders.tsx`.

- [ ] **Step 6: Create `OrderHistory`**

```tsx
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
```

Save as `src/components/trade/OrderHistory.tsx`.

- [ ] **Step 7: Create `TradeView`**

```tsx
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
          onSelectPrice={(price) => setLimitPrice(price.toFixed(2))}
        />
        <OrderForm
          coinId={selectedCoinId}
          currentPrice={coin.price}
          limitPrice={limitPrice}
          onLimitPriceChange={setLimitPrice}
          onMarketOrder={onTrade}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
}
```

Save as `src/components/trade/TradeView.tsx`.

- [ ] **Step 8: Rewrite `trade/page.tsx` to use `TradeView`**

Replace the file created in Task 3 entirely:

```tsx
import PageHeader from "@/components/PageHeader";
import TradeView from "@/components/trade/TradeView";

export default function TradePage() {
  return (
    <>
      <PageHeader
        title="Trade"
        description="Buy and sell crypto with live-feeling markets, an order book, and full order history, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[1400px]">
          <TradeView />
        </div>
      </section>
    </>
  );
}
```

Save as `src/app/trade/page.tsx` (this is now a Server Component again — no `"use client"` — since all interactivity moved into `TradeView`).

- [ ] **Step 9: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/trade
```
Expected: `200`.

Manual browser check, exercising every piece:
1. Open `/trade`. Confirm the order book renders two columns (green bids below current price, red asks above).
2. Click a bid or ask row. Confirm the Order Form's price field (switch to "Limit" first) fills with that row's price.
3. Place a **market buy** for a small amount (e.g. 0.01 BTC). Confirm a success message appears, and the order appears in Order History with status "filled".
4. Now open `http://localhost:3001/dashboard` in the same session (same browser tab or a new tab if state doesn't cross tabs — note client state is per-tab, so use the same tab/navigation). Confirm the BTC holding shown there reflects the market buy from step 3 — this proves the shared `WalletProvider` context works across pages.
5. Back on `/trade`, place a **limit sell** (any coin, amount, and a price). Confirm it appears in Open Orders (not History), with a Cancel button.
6. Click Cancel on that order. Confirm it disappears from Open Orders and appears in Order History with status "cancelled", and confirm no wallet balance changed (it was never executed).
7. Switch the selected market (click a different coin in Market List). Confirm the chart, order book, and order form's displayed symbol all update to the new coin.

- [ ] **Step 10: Commit**

```bash
git add src/lib/order-book.ts src/lib/orders.ts src/components/trade/OrderBook.tsx \
  src/components/trade/OrderForm.tsx src/components/trade/OpenOrders.tsx \
  src/components/trade/OrderHistory.tsx src/components/trade/TradeView.tsx src/app/trade/page.tsx
git commit -m "feat: add order book, order form, open orders, and order history to /trade"
```
