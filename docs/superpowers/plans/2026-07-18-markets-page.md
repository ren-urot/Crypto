# Markets Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/markets` coming-soon stub with a real market table of all 10 dummy coins (price, 24h change, sparkline, 24h range, market cap, trade link), modeled on OKX's Markets page but scoped to this app's data and branding.

**Architecture:** Extend `dashboard-data.ts` with a `marketCap` field and a `formatCompactUsd` helper. Reuse the existing `generateCandles` generator (built for the Trade page's chart) to derive each coin's sparkline and 24h range — no new data-generation logic. A new `Sparkline` component renders a small inline SVG polyline. A new `MarketsView` composes everything into a searchable table.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript. No new dependencies. No test framework (existing project convention) — verification is manual.

## Global Constraints

- No new npm dependencies.
- No real backend, no real market data — `marketCap` is a fixed dummy figure per coin, same convention as `price`/`change24h`/`volume24h`.
- Match existing visual language: purple `#39079e` headings/accents, `#2d2d2d` body text, `#929292` secondary text, `#f2f2f4` section background, white `rounded-[20px]` cards, orange `#ffb506` CTA with `#e6a205` hover, green `text-green-600`/red `text-red-600` for up/down indicators (the same established exception used on the Trade page's market list and order book).
- No OKX dark theme, no category tabs, no pagination, no macro/ETF summary widgets — explicitly out of scope per the spec.
- `generateCandles` must not be reimplemented — import and call the existing function from `@/lib/candles`.

---

### Task 1: Markets page — data, sparkline, table

**Files:**
- Modify: `src/lib/dashboard-data.ts`
- Create: `src/components/markets/Sparkline.tsx`
- Create: `src/components/markets/MarketsView.tsx`
- Modify: `src/app/markets/page.tsx`

**Interfaces:**
- Consumes: `generateCandles(coinId, currentPrice, count?)` from `@/lib/candles` (existing, unchanged).
- Produces: `Coin.marketCap: number` and `formatCompactUsd(value): string` added to `@/lib/dashboard-data` — consumed only within this task.

- [ ] **Step 1: Add `marketCap` to each coin and a `formatCompactUsd` helper**

Modify `src/lib/dashboard-data.ts`. Current file:

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

New file:

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
  marketCap: number;
};

export const COINS: Coin[] = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 62000, change24h: 2.34, volume24h: 28_500_000_000, marketCap: 1_220_000_000_000 },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3400, change24h: -1.12, volume24h: 12_300_000_000, marketCap: 408_000_000_000 },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 145, change24h: 5.67, volume24h: 3_800_000_000, marketCap: 66_700_000_000 },
  { id: "XRP", name: "XRP", symbol: "XRP", price: 0.62, change24h: 3.1, volume24h: 1_900_000_000, marketCap: 34_700_000_000 },
  { id: "ADA", name: "Cardano", symbol: "ADA", price: 0.45, change24h: -0.85, volume24h: 620_000_000, marketCap: 15_800_000_000 },
  { id: "DOGE", name: "Dogecoin", symbol: "DOGE", price: 0.15, change24h: 8.9, volume24h: 1_400_000_000, marketCap: 21_900_000_000 },
  { id: "BNB", name: "BNB", symbol: "BNB", price: 590, change24h: 0.45, volume24h: 1_100_000_000, marketCap: 85_600_000_000 },
  { id: "MATIC", name: "Polygon", symbol: "MATIC", price: 0.55, change24h: -2.2, volume24h: 340_000_000, marketCap: 5_300_000_000 },
  { id: "LTC", name: "Litecoin", symbol: "LTC", price: 95, change24h: 1.05, volume24h: 480_000_000, marketCap: 7_000_000_000 },
  { id: "DOT", name: "Polkadot", symbol: "DOT", price: 6.8, change24h: -0.3, volume24h: 210_000_000, marketCap: 9_500_000_000 },
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

export function formatCompactUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
```

- [ ] **Step 2: Create the `Sparkline` component**

```tsx
export default function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const width = 100;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-full"
      preserveAspectRatio="none"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
```

Save as `src/components/markets/Sparkline.tsx`.

- [ ] **Step 3: Create `MarketsView`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  COINS,
  formatUsd,
  formatPercent,
  formatCompactUsd,
  type Coin,
} from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import Sparkline from "./Sparkline";

function getSparklineAndRange(coin: Coin) {
  const candles = generateCandles(coin.id, coin.price, 24);
  const closes = candles.map((candle) => candle.close);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  return { closes, low, high };
}

export default function MarketsView() {
  const [query, setQuery] = useState("");

  const filtered = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1228px]">
      <div className="rounded-[20px] bg-white p-6 md:p-10">
        <input
          type="text"
          placeholder="Search markets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-[320px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-sm text-[#929292]">
                <th className="pb-4 font-medium">Name</th>
                <th className="pb-4 font-medium">Price</th>
                <th className="pb-4 font-medium">24h Change</th>
                <th className="pb-4 font-medium">Last 24h</th>
                <th className="pb-4 font-medium">24h Range</th>
                <th className="pb-4 font-medium">Market Cap</th>
                <th className="pb-4 font-medium"></th>
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
                      <p className="text-sm text-[#929292]">{coin.name}</p>
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
                    <td className="py-4 text-right">
                      <Link
                        href="/trade"
                        className="rounded-full bg-[#ffb506] px-4 py-2 text-xs font-bold uppercase text-[#39079e] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205]"
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
                    No markets match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

Save as `src/components/markets/MarketsView.tsx`.

- [ ] **Step 4: Rewrite `markets/page.tsx`**

Replace the coming-soon stub. Current file:

```tsx
import PageHeader from "@/components/PageHeader";

export default function MarketsPage() {
  return (
    <PageHeader
      title="Markets"
      description="Coming soon."
    />
  );
}
```

New file:

```tsx
import PageHeader from "@/components/PageHeader";
import MarketsView from "@/components/markets/MarketsView";

export default function MarketsPage() {
  return (
    <>
      <PageHeader
        title="Markets"
        description="Live-feeling prices, 24h change, and market cap across every asset on Crypto, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <MarketsView />
      </section>
    </>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

Start the dev server if not running: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &`, wait ~2s.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/markets
```
Expected: `200`.

```bash
curl -s http://localhost:3001/markets | grep -o "Polkadot" | wc -l
```
Expected: `1` or more.

Manual browser check: open `http://localhost:3001/markets`. Confirm all 10 coins render with price, colored 24h change, a visibly non-flat sparkline, a "low - high" range, and a market cap figure (e.g. `$1.22T` for Bitcoin). Confirm each sparkline's color matches its row's change direction (green for positive, red for negative). Type into the search box and confirm the list filters (e.g. typing "sol" leaves only Solana). Click a "Trade" button and confirm it navigates to `/trade`. Reload the page and confirm the sparklines look the same as before reload (deterministic, no console hydration warning).

- [ ] **Step 6: Commit**

```bash
git add src/lib/dashboard-data.ts src/components/markets/Sparkline.tsx \
  src/components/markets/MarketsView.tsx src/app/markets/page.tsx
git commit -m "feat: build out the Markets page with a real market table"
```
