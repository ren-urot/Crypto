# Session-Aware Navigation, Buy Crypto, Sign-Up Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side "logged in" session flag that changes the Navbar's link set, build a real `/buy-crypto` page modeled on OKX's actual buy-crypto flow, add coming-soon stubs for Markets/Grow/Learn/More, and replace the Sign Up tab's simple form with a 6-step wizard modeled on OKX's actual sign-up flow.

**Architecture:** A `SessionProvider` Context (same pattern as `WalletProvider`/`useFakeSubmit`) tracks `isLoggedIn`, set by both the existing sign-in form and the new sign-up wizard's final step. `Navbar` becomes a Client Component reading that flag to pick one of two link sets. Buy Crypto reuses `useWallet().onTrade` directly (same mechanics as every other trade path in this app). The sign-up wizard is one linear multi-step client component with no persistence.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript, `lucide-react` (already installed, used for the password show/hide icons). No new dependencies. No test framework (existing project convention) — verification is manual.

## Global Constraints

- No new npm dependencies.
- No real backend anywhere in this plan — session state, OTP, phone verification, and identity verification are all UI-only stand-ins with no network calls.
- Match existing visual language: purple `#39079e` headings/accents, `#2d2d2d` body text, `#929292` secondary text, `#f2f2f4` section background, white `rounded-[20px]` cards (note: this project's card radius was recently reduced from 40px to 20px on all content pages except the homepage — use `rounded-[20px]`, not `rounded-[40px]`, in any new card in this plan), orange `#ffb506` CTA with `#e6a205` hover.
- `PageHeader` (used by the Buy Crypto and coming-soon pages in this plan) is currently a dark banner (`bg-black`, white heading, `#909292` description) — this is a recent, deliberate change; do not revert it.
- `useSession()` throws if called outside `SessionProvider` — intentional fail-fast, matching `useWallet()`'s existing convention.
- All dummy/fake flows (OTP, resend timer, phone verification, identity verification) must give clear UI feedback of what's happening (disabled buttons, countdowns, checkmarks) even though nothing is real — this is what makes them feel like real flows in a demo.

---

### Task 1: Session Context, state-aware Navbar, sign-in wiring

**Files:**
- Create: `src/lib/session-context.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/LoginCard.tsx`

**Interfaces:**
- Produces: `SessionProvider` (wraps `children`, no other props) and `useSession()` returning `{ isLoggedIn: boolean; login: () => void }` from `@/lib/session-context`. Consumed by `Navbar.tsx` (this task) and `SignupWizard.tsx` (Task 4).

- [ ] **Step 1: Create the session Context**

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SessionContextValue = {
  isLoggedIn: boolean;
  login: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function login() {
    setIsLoggedIn(true);
  }

  return (
    <SessionContext.Provider value={{ isLoggedIn, login }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
```

Save as `src/lib/session-context.tsx`.

- [ ] **Step 2: Wrap `Navbar`/`main`/`Footer` in `SessionProvider`**

`Navbar` needs `useSession()`, and `Navbar` currently renders as a sibling BEFORE `<main>` (outside the existing `WalletProvider`, which only wraps `{children}`). `SessionProvider` must wrap `Navbar` too, so it needs to sit one level higher than `WalletProvider`. Modify `src/app/layout.tsx`. Current file:

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

New file:

```tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/lib/wallet-context";
import { SessionProvider } from "@/lib/session-context";
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
        <SessionProvider>
          <Navbar />
          <main className="flex flex-1 flex-col">
            <WalletProvider>{children}</WalletProvider>
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Rewrite `Navbar.tsx` to be session-aware**

This replaces the current always-visible 6-link Navbar (Products/Features/Dashboard/Trade/About/Contact, added as an interim fix in an earlier plan) with two distinct link sets chosen by login state. New file:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/session-context";

const LOGGED_OUT_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LOGGED_IN_LINKS = [
  { label: "Buy Crypto", href: "/buy-crypto" },
  { label: "Markets", href: "/markets" },
  { label: "Trade", href: "/trade" },
  { label: "Grow", href: "/grow" },
  { label: "Learn", href: "/learn" },
  { label: "More", href: "/more" },
];

export default function Navbar() {
  const { isLoggedIn } = useSession();
  const navLinks = isLoggedIn ? LOGGED_IN_LINKS : LOGGED_OUT_LINKS;

  return (
    <header className="w-full bg-[#f2f2f4]">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between px-9 py-4">
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="Crypto"
            width={119}
            height={22}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-semibold text-xs tracking-[0.1em] text-[#2a2a2a] uppercase transition-colors hover:text-[#39079e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="rounded-full bg-[#39079e] px-8 py-3 text-xs font-semibold tracking-[0.1em] text-white uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#2d0680] hover:shadow-lg"
        >
          {isLoggedIn ? "Dashboard" : "Login"}
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Wire `LoginCard`'s sign-in flow to call `login()`**

Modify `src/components/LoginCard.tsx`. Current file:

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
    <div className="mx-auto max-w-[440px] rounded-[20px] bg-white p-10 md:p-16">
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

Change only the import and the `useEffect` (add `useSession`, call `login()` before the redirect):

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function LoginCard() {
  const router = useRouter();
  const { login } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  useEffect(() => {
    if (status === "success") {
      login();
      router.push("/dashboard");
    }
  }, [status, login, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim() && password.trim()));
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    reset();
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[20px] bg-white p-10 md:p-16">
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

(This task does NOT yet change the "Sign up" mode's form — that becomes the wizard in Task 4. For now, "Sign up" still submits the same simple email+password form, which will also correctly call `login()` since it shares the same `useEffect`.)

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

Start the dev server if not running: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &`, wait ~2s.

Manual browser check: open `http://localhost:3001/`. Confirm the Navbar shows Products/Features/About/Contact + a "Login" button. Go to `/login`, sign in with any email+password. Confirm you're redirected to `/dashboard` AND the Navbar now shows Buy Crypto/Markets/Trade/Grow/Learn/More + a "Dashboard" button (instead of "Login"). Click "Dashboard" in the top-right and confirm it lands on `/dashboard`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/session-context.tsx src/app/layout.tsx src/components/Navbar.tsx src/components/LoginCard.tsx
git commit -m "feat: add session context and session-aware Navbar links"
```

---

### Task 2: Coming-soon stub pages

**Files:**
- Create: `src/app/markets/page.tsx`
- Create: `src/app/grow/page.tsx`
- Create: `src/app/learn/page.tsx`
- Create: `src/app/more/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from `@/components/PageHeader` (existing, unchanged, currently a dark banner).

- [ ] **Step 1: Create the 4 stub pages**

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

Save as `src/app/markets/page.tsx`.

```tsx
import PageHeader from "@/components/PageHeader";

export default function GrowPage() {
  return (
    <PageHeader
      title="Grow"
      description="Coming soon."
    />
  );
}
```

Save as `src/app/grow/page.tsx`.

```tsx
import PageHeader from "@/components/PageHeader";

export default function LearnPage() {
  return (
    <PageHeader
      title="Learn"
      description="Coming soon."
    />
  );
}
```

Save as `src/app/learn/page.tsx`.

```tsx
import PageHeader from "@/components/PageHeader";

export default function MorePage() {
  return (
    <PageHeader
      title="More"
      description="Coming soon."
    />
  );
}
```

Save as `src/app/more/page.tsx`.

- [ ] **Step 2: Verify**

```bash
for path in /markets /grow /learn /more; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$path")
  echo "$path -> $code"
done
```
Expected: all four print `200`.

- [ ] **Step 3: Commit**

```bash
git add src/app/markets/page.tsx src/app/grow/page.tsx src/app/learn/page.tsx src/app/more/page.tsx
git commit -m "feat: add coming-soon stub pages for Markets/Grow/Learn/More"
```

---

### Task 3: Buy Crypto page

**Files:**
- Create: `src/components/buy-crypto/BuyCryptoView.tsx`
- Create: `src/app/buy-crypto/page.tsx`

**Interfaces:**
- Consumes: `useWallet()` from `@/lib/wallet-context` (existing — `{ wallet, onTrade }`). `COINS`, `formatUsd`, `getCoin`, `type CoinId` from `@/lib/dashboard-data` (existing).

- [ ] **Step 1: Create `BuyCryptoView`**

```tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { COINS, formatUsd, getCoin, type CoinId } from "@/lib/dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

export default function BuyCryptoView() {
  const { wallet, onTrade } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);

  const coin = getCoin(coinId);
  const parsedAmount = Number(amount);
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const estimate = isValidAmount
    ? side === "buy"
      ? parsedAmount / coin.price
      : parsedAmount * coin.price
    : 0;

  function switchSide(next: "buy" | "sell") {
    setSide(next);
    setAmount("");
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidAmount) {
      setResult({ ok: false, reason: "Enter an amount greater than zero." });
      return;
    }
    // "amount" is USD for Buy, coin quantity for Sell — onTrade always
    // expects a coin quantity, so Buy converts USD -> coin qty first.
    const coinAmount = side === "buy" ? parsedAmount / coin.price : parsedAmount;
    const tradeResult = onTrade(coinId, side, coinAmount);
    setResult(tradeResult);
    if (tradeResult.ok) {
      setAmount("");
    }
  }

  return (
    <div className="mx-auto max-w-[560px] rounded-[20px] bg-white p-10 md:p-16">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => switchSide("buy")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "buy" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => switchSide("sell")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            side === "sell" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="buy-amount"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            {side === "buy" ? "You pay (USD)" : "You sell"}
          </label>
          <input
            id="buy-amount"
            type="number"
            step="any"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="buy-coin"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            {side === "buy" ? "You get" : "Coin"}
          </label>
          <select
            id="buy-coin"
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
          <p className="mt-2 text-sm text-[#929292]">
            {side === "buy"
              ? `≈ ${estimate.toFixed(6)} ${coin.symbol}`
              : `≈ ${formatUsd(estimate)}`}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#f2f2f4] px-4 py-3 text-sm">
          <span className="text-[#929292]">Wallet balance</span>
          <span className="font-semibold text-[#2d2d2d]">
            {formatUsd(wallet.usd)}
          </span>
        </div>

        <button
          type="submit"
          disabled={!isValidAmount}
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {side === "buy" ? `Buy ${coin.symbol}` : `Sell ${coin.symbol}`}
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

Save as `src/components/buy-crypto/BuyCryptoView.tsx`.

- [ ] **Step 2: Create the Buy Crypto route**

```tsx
import PageHeader from "@/components/PageHeader";
import BuyCryptoView from "@/components/buy-crypto/BuyCryptoView";

export default function BuyCryptoPage() {
  return (
    <>
      <PageHeader
        title="Buy crypto in a few steps"
        description="Bitcoin, Ethereum, Solana, and more popular crypto."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <BuyCryptoView />
      </section>
    </>
  );
}
```

Save as `src/app/buy-crypto/page.tsx`.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/buy-crypto
```
Expected: `200`.

Manual browser check: open `http://localhost:3001/buy-crypto`. Buy a small amount of a coin (e.g. enter `100` USD, select BTC) — confirm the CTA is enabled only once a valid amount is entered, submit, and confirm a success message appears. Open `http://localhost:3001/dashboard` and confirm the BTC holding and USD cash balance both reflect that purchase (same shared `WalletProvider` as `/trade`). Back on `/buy-crypto`, switch to Sell, sell some of that BTC back, and confirm the USD balance increases again. Finally, attempt to buy an amount that costs more than the current USD balance and confirm it's rejected with no state change.

- [ ] **Step 4: Commit**

```bash
git add src/components/buy-crypto/BuyCryptoView.tsx src/app/buy-crypto/page.tsx
git commit -m "feat: add Buy Crypto page"
```

---

### Task 4: Sign-up wizard

**Files:**
- Create: `src/components/auth/SignupWizard.tsx`
- Modify: `src/components/LoginCard.tsx`

**Interfaces:**
- Consumes: `useSession()` from `@/lib/session-context` (Task 1). `useFakeSubmit()` from `@/hooks/useFakeSubmit` (existing).
- Produces: `SignupWizard` default export, props `{ onBackToSignIn: () => void }` — consumed only by `LoginCard.tsx` in this task.

- [ ] **Step 1: Create `SignupWizard`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Philippines",
  "Singapore",
  "Australia",
  "India",
  "Canada",
  "Germany",
];

const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "8-32 characters", test: (pw) => pw.length >= 8 && pw.length <= 32 },
  {
    label: "At least 1 lowercase character (a-z)",
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: "At least 1 uppercase character (A-Z)",
    test: (pw) => /[A-Z]/.test(pw),
  },
  { label: "At least 1 number", test: (pw) => /[0-9]/.test(pw) },
  {
    label: "At least 1 special character e.g. !@#$%",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export default function SignupWizard({
  onBackToSignIn,
}: {
  onBackToSignIn: () => void;
}) {
  const router = useRouter();
  const { login } = useSession();
  const { status, submit } = useFakeSubmit();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const [country, setCountry] = useState(COUNTRIES[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resendSeconds, setResendSeconds] = useState(60);

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [verificationType, setVerificationType] = useState<
    "individual" | "institutional"
  >("individual");

  useEffect(() => {
    if (step === 3 && otp.every((digit) => digit !== "")) {
      setStep(4);
    }
  }, [otp, step]);

  useEffect(() => {
    if (step !== 3 || resendSeconds <= 0) return;
    const timer = setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [step, resendSeconds]);

  useEffect(() => {
    if (status === "success") {
      login();
      router.push("/dashboard");
    }
  }, [status, login, router]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const passwordValid = passwordChecks.every((check) => check.passed);

  if (step === 1) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Select your location
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          This helps us provide the right experience for where you live.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-country"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Country/region
          </label>
          <select
            id="signup-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          >
            {COUNTRIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <label className="mt-6 flex items-start gap-3 text-sm text-[#2d2d2d]">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1"
          />
          <span>
            By creating an account, I agree to Crypto&apos;s{" "}
            <Link
              href="/terms"
              className="font-semibold text-[#39079e] underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-[#39079e] underline"
            >
              Privacy Notice
            </Link>
            .
          </span>
        </label>

        <button
          type="button"
          disabled={!agreedToTerms}
          onClick={() => setStep(2)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create account
        </button>

        <p className="mt-4 text-center text-sm text-[#929292]">
          Have an account?{" "}
          <button
            type="button"
            onClick={onBackToSignIn}
            className="font-semibold text-[#39079e] underline"
          >
            Log in
          </button>
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          What&apos;s your email?
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          You&apos;ll use this email to log in and access your account.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-email"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="signup-referral"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Referral code (optional)
          </label>
          <input
            id="signup-referral"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={!email.trim()}
          onClick={() => {
            setResendSeconds(60);
            setStep(3);
          }}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Enter the 6-digit code sent to your email
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          We&apos;ve sent it to <span className="font-semibold">{email}</span>
          . If you don&apos;t see it, check your spam folder.
        </p>

        <div className="mt-6 flex gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                otpRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="h-14 w-full rounded-xl border border-[#e5e5e5] text-center text-lg text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          ))}
        </div>

        <button
          type="button"
          disabled={resendSeconds > 0}
          onClick={() => setResendSeconds(60)}
          className="mt-6 w-full rounded-full bg-[#f2f2f4] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendSeconds > 0 ? `Resend code (${resendSeconds}s)` : "Resend code"}
        </button>

        <p className="mt-4 text-center text-sm text-[#929292]">
          Unable to verify?{" "}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="font-semibold text-[#39079e] underline"
          >
            change email
          </button>
        </p>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          What&apos;s your phone number?
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          We&apos;ll use this number for extra account security.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-phone"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Phone number
          </label>
          <div className="mt-2 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
            <span className="text-base text-[#2a2a2a]">+1</span>
            <input
              id="signup-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-base text-[#2a2a2a] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!phone.trim()}
          onClick={() => setStep(5)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify now
        </button>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Create password
        </h1>

        <div className="mt-6">
          <label
            htmlFor="signup-password"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Password
          </label>
          <div className="mt-2 flex items-center border-b border-[#e5e5e5] pb-3">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-base text-[#2a2a2a] focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <EyeOff className="size-5 text-[#929292]" />
              ) : (
                <Eye className="size-5 text-[#929292]" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-[#2a2a2a]">
            Your password must contain:
          </p>
          {passwordChecks.map((check) => (
            <p
              key={check.label}
              className={`text-sm ${
                check.passed ? "text-green-600" : "text-[#929292]"
              }`}
            >
              {check.passed ? "✓" : "○"} {check.label}
            </p>
          ))}
        </div>

        <button
          type="button"
          disabled={!passwordValid}
          onClick={() => setStep(6)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Confirm
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-2xl text-[#39079e]">
        Let&apos;s verify your account
      </h1>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setVerificationType("individual")}
          className={`w-full rounded-2xl border p-4 text-left ${
            verificationType === "individual"
              ? "border-[#39079e]"
              : "border-[#e5e5e5]"
          }`}
        >
          <p className="font-semibold text-[#2a2a2a]">
            Individual verification
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            For users who want to trade, send, receive, and manage crypto
            for themselves
          </p>
        </button>

        <button
          type="button"
          onClick={() => setVerificationType("institutional")}
          className={`w-full rounded-2xl border p-4 text-left ${
            verificationType === "institutional"
              ? "border-[#39079e]"
              : "border-[#e5e5e5]"
          }`}
        >
          <p className="font-semibold text-[#2a2a2a]">
            Institutional verification
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            For institutions who want to save, invest, receive, pay, and
            manage crypto on behalf of others
          </p>
        </button>
      </div>

      <button
        type="button"
        disabled={status === "submitting"}
        onClick={() => submit(true)}
        className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Please wait..." : "Verify identity"}
      </button>
    </div>
  );
}
```

Save as `src/components/auth/SignupWizard.tsx`.

- [ ] **Step 2: Rewrite `LoginCard.tsx` to use the wizard for Sign Up**

The "current file" here is the version Task 1 produced (with `login()` already wired into the sign-in `useEffect`). Replace the whole file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";
import SignupWizard from "@/components/auth/SignupWizard";

export default function LoginCard() {
  const router = useRouter();
  const { login } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  useEffect(() => {
    if (status === "success") {
      login();
      router.push("/dashboard");
    }
  }, [status, login, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim() && password.trim()));
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    reset();
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[20px] bg-white p-10 md:p-16">
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

      {mode === "signup" ? (
        <div className="mt-8">
          <SignupWizard onBackToSignIn={() => switchMode("signin")} />
        </div>
      ) : (
        <>
          <h1 className="mt-8 font-semibold text-2xl text-[#39079e]">
            Welcome back
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
              {status === "idle" ? "Sign In" : "Please wait..."}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: no output.

Manual browser check, walking through all 6 steps in order at `http://localhost:3001/login` → "Sign up" tab:

1. **Location** — confirm "Create account" is disabled until the terms checkbox is checked; confirm the Terms of Service / Privacy Notice links actually navigate to `/terms` / `/privacy-policy` (open in the same tab and go back, or check the href). Check the box, click through.
2. **Email** — confirm "Sign up" is disabled until an email is entered. Enter an email, click through.
3. **OTP** — type any 6 digits across the 6 boxes (confirm focus auto-advances to the next box after each digit); confirm it auto-advances to step 4 once the 6th digit is entered, with no button click needed. Confirm the "Resend code (60s)" button is disabled and counts down.
4. **Phone** — confirm "Verify now" is disabled until a number is entered. Enter a number, click through.
5. **Password** — type a password that fails every rule first (e.g. `a`) and confirm all 5 checklist items show ungrouped/gray; then type one that passes all 5 (e.g. `Passw0rd!`) and confirm every item turns green and "Confirm" becomes enabled. Toggle the eye icon and confirm it shows/hides the password text.
6. **Identity verification** — confirm "Individual verification" is selected by default (visibly highlighted), click "Institutional verification" and confirm the highlight moves. Click "Verify identity," confirm the button shows "Please wait..." briefly, then confirm you're redirected to `/dashboard` and the Navbar shows the logged-in link set (proving `login()` fired from the wizard, not just the sign-in form).

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/SignupWizard.tsx src/components/LoginCard.tsx
git commit -m "feat: replace sign-up form with a 6-step sign-up wizard"
```
