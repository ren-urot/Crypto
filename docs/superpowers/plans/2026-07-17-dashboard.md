# Post-Login Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After logging in, land on a `/dashboard` page showing a wallet summary, a holdings table, and a working buy/sell trade panel, all backed by dummy client-side data.

**Architecture:** A `/dashboard` route rendering a client `Dashboard` component that owns wallet state (`useState`) and passes it to three presentational/interactive children. `LoginCard` redirects there via `next/navigation`'s `useRouter` once its existing `useFakeSubmit` flow reports success.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript. No test framework (existing project convention) — verification is manual.

## Global Constraints

- No new npm dependencies.
- No real backend — wallet state lives only in React state, resets on reload.
- `/dashboard` is NOT gated behind any login check — directly reachable by URL, consistent with the rest of this backend-less site.
- Match existing visual language exactly: purple `#39079e` headings, `#2d2d2d` body text, `#929292` secondary text, `#f2f2f4` section background, white `rounded-[40px]` cards, orange `#ffb506` CTA with `#e6a205` hover.
- All internal links use `next/link` where applicable (this plan uses `next/navigation`'s `useRouter` for the login→dashboard redirect, which is the correct API for programmatic navigation, not a link).

---

### Task 1: `/dashboard` page — dummy data, wallet summary, holdings table, trade panel

**Files:**
- Create: `src/lib/dashboard-data.ts`
- Create: `src/components/dashboard/WalletSummary.tsx`
- Create: `src/components/dashboard/HoldingsTable.tsx`
- Create: `src/components/dashboard/TradePanel.tsx`
- Create: `src/components/dashboard/Dashboard.tsx`
- Create: `src/app/dashboard/page.tsx`

**Interfaces:**
- Produces: `CoinId = "BTC" | "ETH" | "SOL"`, `Coin`, `Wallet`, `COINS`, `INITIAL_WALLET`, `getTotalValue(wallet): number`, `formatUsd(value): string` from `@/lib/dashboard-data` — consumed by all dashboard components.
- Produces: `Dashboard` default export, no props, self-contained — consumed by Task 1's own `dashboard/page.tsx` only.

- [ ] **Step 1: Create the dummy data module**

```ts
export type CoinId = "BTC" | "ETH" | "SOL";

export type Coin = {
  id: CoinId;
  name: string;
  symbol: CoinId;
  price: number;
};

export const COINS: Coin[] = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 62000 },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3400 },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 145 },
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
```

Save as `src/lib/dashboard-data.ts`.

- [ ] **Step 2: Create `WalletSummary`**

```tsx
import { COINS, formatUsd, type Wallet } from "@/lib/dashboard-data";

export default function WalletSummary({
  wallet,
  totalValue,
}: {
  wallet: Wallet;
  totalValue: number;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className="rounded-[40px] bg-white p-8">
        <p className="text-sm text-[#2d2d2d]">Total Balance</p>
        <p className="mt-2 font-semibold text-3xl text-[#39079e]">
          {formatUsd(totalValue)}
        </p>
      </div>

      {COINS.map((coin) => (
        <div key={coin.id} className="rounded-[40px] bg-white p-8">
          <p className="text-sm text-[#2d2d2d]">{coin.name}</p>
          <p className="mt-2 font-semibold text-2xl text-[#39079e]">
            {wallet.holdings[coin.id]} {coin.symbol}
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            {formatUsd(wallet.holdings[coin.id] * coin.price)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

Save as `src/components/dashboard/WalletSummary.tsx`.

- [ ] **Step 3: Create `HoldingsTable`**

```tsx
import { COINS, formatUsd, type Wallet } from "@/lib/dashboard-data";

export default function HoldingsTable({ wallet }: { wallet: Wallet }) {
  return (
    <div className="overflow-x-auto rounded-[40px] bg-white p-8 md:p-10">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-[#929292]">
            <th className="pb-4 font-medium">Asset</th>
            <th className="pb-4 font-medium">Quantity</th>
            <th className="pb-4 font-medium">Price</th>
            <th className="pb-4 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {COINS.map((coin) => (
            <tr key={coin.id} className="border-t border-[#e5e5e5]">
              <td className="py-4 font-semibold text-[#39079e]">
                {coin.name}
              </td>
              <td className="py-4 text-[#2d2d2d]">
                {wallet.holdings[coin.id]} {coin.symbol}
              </td>
              <td className="py-4 text-[#2d2d2d]">{formatUsd(coin.price)}</td>
              <td className="py-4 text-[#2d2d2d]">
                {formatUsd(wallet.holdings[coin.id] * coin.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Save as `src/components/dashboard/HoldingsTable.tsx`.

- [ ] **Step 4: Create `TradePanel`**

```tsx
"use client";

import { useState } from "react";
import { COINS, formatUsd, type CoinId } from "@/lib/dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function TradePanel({
  onTrade,
}: {
  onTrade: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
}) {
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = COINS.find((c) => c.id === coinId)!;
  const parsedAmount = Number(amount);
  const estimate = Number.isFinite(parsedAmount)
    ? parsedAmount * coin.price
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }
    const tradeResult = onTrade(coinId, side, parsedAmount);
    setResult(tradeResult);
    if (tradeResult.ok) {
      setAmount("");
    }
  }

  return (
    <div className="rounded-[40px] bg-white p-8 md:p-10">
      <h2 className="font-semibold text-2xl text-[#39079e]">Trade</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
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

        <div>
          <label
            htmlFor="trade-coin"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Asset
          </label>
          <select
            id="trade-coin"
            value={coinId}
            onChange={(e) => setCoinId(e.target.value as CoinId)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="trade-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Amount ({coin.symbol})
          </label>
          <input
            id="trade-amount"
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
          {side === "buy" ? "Buy" : "Sell"} {coin.symbol}
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

Save as `src/components/dashboard/TradePanel.tsx`.

- [ ] **Step 5: Create `Dashboard`**

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

Save as `src/components/dashboard/Dashboard.tsx`.

- [ ] **Step 6: Create the dashboard page route**

```tsx
import PageHeader from "@/components/PageHeader";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your portfolio, holdings, and trading, all in one place."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[1228px]">
          <Dashboard />
        </div>
      </section>
    </>
  );
}
```

Save as `src/app/dashboard/page.tsx`.

- [ ] **Step 7: Verify**

Start the dev server if not already running: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &`, wait ~2s.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/dashboard
```
Expected: `200`.

```bash
curl -s http://localhost:3001/dashboard | grep -o "Total Balance" | wc -l
```
Expected: `1` or more.

Manual browser check: open `http://localhost:3001/dashboard`. Confirm the wallet summary shows a total balance and three coin cards (BTC/ETH/SOL) with non-zero dummy values, the holdings table lists the same three coins, and:
- Buy 0.01 BTC → submit → confirm a success message appears, the BTC quantity in both `WalletSummary` and `HoldingsTable` increases by 0.01, and the total balance / cash figures update consistently.
- Sell more of a coin than you hold (e.g. sell 999 SOL) → confirm a rejection message appears and no numbers change.
- Attempt a buy that costs more than your cash balance → confirm a rejection message appears and no numbers change.

- [ ] **Step 8: Commit**

```bash
git add src/lib/dashboard-data.ts src/components/dashboard/WalletSummary.tsx \
  src/components/dashboard/HoldingsTable.tsx src/components/dashboard/TradePanel.tsx \
  src/components/dashboard/Dashboard.tsx src/app/dashboard/page.tsx
git commit -m "feat: add dashboard with dummy wallet and trade panel"
```

---

### Task 2: Redirect Login to `/dashboard` on success

**Files:**
- Modify: `src/components/LoginCard.tsx`

**Interfaces:**
- Consumes: `/dashboard` route from Task 1 (must exist before this task's manual verification step can confirm the redirect lands somewhere real — if run out of order, `router.push("/dashboard")` still works, it'll just 404 until Task 1 exists).
- Consumes: `useFakeSubmit` (unchanged, from earlier work) — `{ status, submit, reset }`.

- [ ] **Step 1: Rewrite `LoginCard.tsx` to redirect on success instead of showing an inline success card**

Current file:

```tsx
"use client";

import { useState } from "react";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function LoginCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim() && password.trim()));
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    reset();
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[440px] rounded-[40px] bg-white p-10 text-center md:p-16">
        <h1 className="font-semibold text-2xl text-[#39079e]">
          {mode === "signin" ? "Welcome back" : "Account created"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#2d2d2d]">
          {mode === "signin"
            ? "You're signed in."
            : "Check your inbox to confirm your email."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[40px] bg-white p-10 md:p-16">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signin" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signup" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign up
        </button>
      </div>

      <h1 className="mt-8 font-semibold text-2xl text-[#39079e]">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting"
            ? "Please wait..."
            : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
```

New file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function LoginCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  useEffect(() => {
    if (status === "success") {
      router.push("/dashboard");
    }
  }, [status, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim() && password.trim()));
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    reset();
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[40px] bg-white p-10 md:p-16">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signin" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signup" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign up
        </button>
      </div>

      <h1 className="mt-8 font-semibold text-2xl text-[#39079e]">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "idle"
            ? mode === "signin"
              ? "Sign In"
              : "Sign Up"
            : "Please wait..."}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

A dev server should be running on port 3001 (from Task 1's verification, or start it: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &`, wait ~2s).

```bash
npx tsc --noEmit
```
Expected: no output (no type errors).

Manual browser check: open `http://localhost:3001/login`, fill in email + password, submit. Confirm the button disables and shows "Please wait...", then within ~1 second the browser navigates to `/dashboard` and the dashboard renders (no lingering "Welcome back" card on `/login` — there should be no visible pause on an inline success message before navigating). Repeat once in "Sign up" mode via the tab toggle — confirm it also redirects to `/dashboard`.

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginCard.tsx
git commit -m "feat: redirect to dashboard after login success"
```
