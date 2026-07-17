# Site Completion & Homepage Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build out every page the homepage links to (Products, Features, About, Contact, Login, Terms, FAQ, Privacy Policy), wire every button/link on the site to a real destination, and add a dependency-free scroll/hover animation pass to the homepage.

**Architecture:** Move `Navbar`/`Footer` into the root layout so every route gets them for free. Add one route folder per new page under `src/app/`. Share a `PageHeader` band component across content pages and a `useFakeSubmit` hook across the three interactive forms (Login, Contact, Newsletter). Animation is a `Reveal` client component (IntersectionObserver-driven fade/slide) plus a CSS `float` keyframe and Tailwind hover-scale utilities — no new npm dependency.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript. No test framework is installed in this project — verification is manual (dev server + curl/grep + browser check), matching the existing project convention (see spec's Testing section).

## Global Constraints

- No new npm dependencies (spec: "Non-goals" — no animation library).
- No backend/database/auth — Login, Contact, and Subscribe are client-side only with a fake success state, no network calls, no persistence (spec: "Non-goals").
- All internal links use Next's `<Link>` component, never raw `<a href>` (spec: "Link wiring map").
- Match existing visual language exactly: purple `#39079e` headings, `#2d2d2d` body text, `#f2f2f4` section background, white `rounded-[40px]` cards, orange `#ffb506` CTA buttons with `#e6a205` hover, Montserrat font (already configured, no change needed).
- Respect `prefers-reduced-motion` for all new animation (spec: "Animation system").
- This is not a git-tracked-from-birth project convention change: follow whatever file/naming conventions already exist in `src/components/` (PascalCase component files, one component per file).

---

### Task 1: Shared layout — move Navbar/Footer into root layout

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: existing `Navbar` (`src/components/Navbar.tsx`, default export, no props) and `Footer` (`src/components/Footer.tsx`, default export, no props).
- Produces: every route under `src/app/` now renders inside `<Navbar />...<Footer />` automatically via the root layout. Later tasks' new pages must NOT import `Navbar` or `Footer` themselves.

- [ ] **Step 1: Rewrite `src/app/layout.tsx` to render Navbar/Footer around children**

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
  title: "Crypto — Fastest & secure platform to invest in crypto",
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

- [ ] **Step 2: Rewrite `src/app/page.tsx` to drop Navbar/Footer and the now-redundant flex wrapper**

```tsx
import Hero from "@/components/Hero";
import TrustedPartners from "@/components/TrustedPartners";
import WhyChoose from "@/components/WhyChoose";
import MarketSentiments from "@/components/MarketSentiments";
import InvestSmart from "@/components/InvestSmart";
import DetailedStats from "@/components/DetailedStats";
import GrowProfit from "@/components/GrowProfit";
import StartMining from "@/components/StartMining";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedPartners />
      <WhyChoose />
      <MarketSentiments />
      <InvestSmart />
      <DetailedStats />
      <GrowProfit />
      <StartMining />
    </>
  );
}
```

- [ ] **Step 3: Start the dev server and verify**

Run: `npm run dev -- -p 3001 > /tmp/crypto-dev.log 2>&1 &` (skip if already running — check with `lsof -i :3001 -t`)

Wait ~2s, then run:
```bash
curl -s http://localhost:3001/ | grep -c "CRYPTO"
```
Expected: `1` or more (the Navbar logo image `alt="Crypto"` and/or footer content render — confirms Navbar renders once, not zero times, not duplicated).

Also run:
```bash
curl -s http://localhost:3001/ | grep -c "All rights Reserved"
```
Expected: `1` (Footer renders exactly once).

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "refactor: move Navbar/Footer into root layout"
```

---

### Task 2: Homepage animation pass — scroll reveal, hover polish, float

**Files:**
- Create: `src/components/Reveal.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/WhyChoose.tsx`
- Modify: `src/components/InvestSmart.tsx`
- Modify: `src/components/DetailedStats.tsx`
- Modify: `src/components/GrowProfit.tsx`
- Modify: `src/components/StartMining.tsx`
- Modify: `src/components/MarketSentiments.tsx`
- Modify: `src/components/TrustedPartners.tsx`

**Interfaces:**
- Produces: `Reveal` — `src/components/Reveal.tsx`, default export, client component, props `{ children: React.ReactNode; className?: string }`. Renders a `div` that fades/slides its children in the first time it scrolls into view. Later tasks may reuse it on new pages if desired (not required by this plan).

- [ ] **Step 1: Create the `Reveal` component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Add the `float` keyframe to `globals.css`**

Read the current file first (`src/app/globals.css`), then add the keyframe block. The full resulting file:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-montserrat);
  --animate-float: float 4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-montserrat), Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 3: Wrap each homepage section in `Reveal`**

Rewrite `src/app/page.tsx`:

```tsx
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import TrustedPartners from "@/components/TrustedPartners";
import WhyChoose from "@/components/WhyChoose";
import MarketSentiments from "@/components/MarketSentiments";
import InvestSmart from "@/components/InvestSmart";
import DetailedStats from "@/components/DetailedStats";
import GrowProfit from "@/components/GrowProfit";
import StartMining from "@/components/StartMining";

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <TrustedPartners />
      </Reveal>
      <Reveal>
        <WhyChoose />
      </Reveal>
      <Reveal>
        <MarketSentiments />
      </Reveal>
      <Reveal>
        <InvestSmart />
      </Reveal>
      <Reveal>
        <DetailedStats />
      </Reveal>
      <Reveal>
        <GrowProfit />
      </Reveal>
      <Reveal>
        <StartMining />
      </Reveal>
    </>
  );
}
```

Note: `Hero` is intentionally NOT wrapped in `Reveal` — it's the first thing visible on load with no scroll involved, so a reveal-on-scroll effect would never trigger naturally and it should just be visible immediately.

- [ ] **Step 4: Add float animation + hover polish to Hero**

Modify `src/components/Hero.tsx`. Current file:

```tsx
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  return (
    <section className="bg-[#f2f2f4]">
      <div className="mx-auto grid max-w-[1520px] items-center gap-12 px-9 py-16 md:grid-cols-2 md:py-24">
        <div className="translate-x-[80px] -translate-y-[100px]">
          <h1 className="font-semibold text-[42px] leading-[1.25] text-[#39079e] uppercase md:text-[56px]">
            Fastest &amp; secure platform to invest in crypto
          </h1>
          <p className="mt-8 max-w-[514px] text-lg leading-relaxed text-[#2d2d2d] md:text-xl">
            Buy and sell cryptocurrencies, trusted by 10M wallets with over
            $30 billion in transactions.
          </p>
          <a
            href="#"
            className="mt-10 inline-block rounded-full bg-[#ffb506] px-10 py-5 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Get Started
          </a>
        </div>

        <div className="-translate-x-[80px] -translate-y-[40px]">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
```

Replace the button and illustration wrapper lines only, so the file becomes:

```tsx
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  return (
    <section className="bg-[#f2f2f4]">
      <div className="mx-auto grid max-w-[1520px] items-center gap-12 px-9 py-16 md:grid-cols-2 md:py-24">
        <div className="translate-x-[80px] -translate-y-[100px]">
          <h1 className="font-semibold text-[42px] leading-[1.25] text-[#39079e] uppercase md:text-[56px]">
            Fastest &amp; secure platform to invest in crypto
          </h1>
          <p className="mt-8 max-w-[514px] text-lg leading-relaxed text-[#2d2d2d] md:text-xl">
            Buy and sell cryptocurrencies, trusted by 10M wallets with over
            $30 billion in transactions.
          </p>
          <a
            href="#"
            className="mt-10 inline-block rounded-full bg-[#ffb506] px-10 py-5 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Get Started
          </a>
        </div>

        <div className="-translate-x-[80px] -translate-y-[40px] animate-float motion-reduce:animate-none">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
```

(The `href="#"` on Get Started is intentionally left as-is here — Task 12 wires all final hrefs at once, after every target page exists.)

- [ ] **Step 5: Add hover polish to WhyChoose's Learn More button**

In `src/components/WhyChoose.tsx`, change only the `<a>` className. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Learn More
          </a>
```

New:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

- [ ] **Step 6: Add hover polish to InvestSmart's Learn More button**

In `src/components/InvestSmart.tsx`, change only the `<a>` className. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Learn More
          </a>
```

New:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

- [ ] **Step 7: Add hover polish to DetailedStats' Learn More button**

In `src/components/DetailedStats.tsx`, change only the `<a>` className. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Learn More
          </a>
```

New:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

- [ ] **Step 8: Add hover polish to GrowProfit's Learn More button**

In `src/components/GrowProfit.tsx`, change only the `<a>` className. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Learn More
          </a>
```

New:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

- [ ] **Step 9: Verify with the dev server**

```bash
curl -s http://localhost:3001/ | grep -c "animate-float"
```
Expected: `1` (only the Hero illustration wrapper has it — DetailedStats/GrowProfit illustrations are intentionally excluded because they already use precise pixel offsets for the card-overlap effect built earlier, and a continuous float would fight that positioning).

```bash
curl -s http://localhost:3001/ | grep -c "hover:scale-\[1.03\]"
```
Expected: `5` (Get Started + 4x Learn More).

Then do a manual browser check: open `http://localhost:3001`, scroll down slowly, and confirm each section fades/slides into view once as it crosses into the viewport (not on every scroll, not all at once on load).

- [ ] **Step 10: Commit**

```bash
git add src/components/Reveal.tsx src/app/globals.css src/app/page.tsx \
  src/components/Hero.tsx src/components/WhyChoose.tsx src/components/InvestSmart.tsx \
  src/components/DetailedStats.tsx src/components/GrowProfit.tsx
git commit -m "feat: add scroll-reveal and hover animation pass to homepage"
```

---

### Task 3: `/products` page (creates shared `PageHeader`)

**Files:**
- Create: `src/components/PageHeader.tsx`
- Create: `src/app/products/page.tsx`

**Interfaces:**
- Produces: `PageHeader` — `src/components/PageHeader.tsx`, default export, props `{ title: string; description: string }`. Renders a purple-heading band matching the homepage hero's typography. Reused by Tasks 4, 5, 6, 8, 9, 10.

- [ ] **Step 1: Create `PageHeader`**

```tsx
export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="bg-[#f2f2f4] px-9 pt-16 pb-10 md:pt-24">
      <div className="mx-auto max-w-[1228px]">
        <h1 className="font-semibold text-[38px] leading-tight text-[#39079e] md:text-[48px]">
          {title}
        </h1>
        <p className="mt-4 max-w-[600px] text-base leading-relaxed text-[#2d2d2d] md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the Products page**

```tsx
import PageHeader from "@/components/PageHeader";

const PRODUCTS = [
  {
    title: "Buy & Sell",
    description:
      "Trade major cryptocurrencies instantly at live market prices, with no hidden fees.",
  },
  {
    title: "Secure Wallet",
    description:
      "Store your assets in a wallet protected by multi-layer encryption and cold storage.",
  },
  {
    title: "Live Trading",
    description:
      "Track markets in real time and execute trades with professional-grade charting tools.",
  },
  {
    title: "Cloud Mining",
    description:
      "Mine crypto without hardware — choose a plan and start earning from any device.",
  },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Everything you need to buy, store, trade, and mine crypto — all from one platform."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto grid max-w-[1228px] gap-8 md:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.title}
              className="rounded-[40px] bg-white p-10 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <h2 className="font-semibold text-2xl text-[#39079e]">
                {product.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#2d2d2d]">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3001/products | grep -c "Cloud Mining"
```
Expected: `1`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/products
```
Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageHeader.tsx src/app/products/page.tsx
git commit -m "feat: add Products page"
```

---

### Task 4: `/features` page

**Files:**
- Create: `src/app/features/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3 (`@/components/PageHeader`, props `{ title, description }`).

- [ ] **Step 1: Create the Features page**

```tsx
import PageHeader from "@/components/PageHeader";

const FEATURES = [
  {
    title: "Why you should choose Crypto",
    description:
      "Experience the next generation cryptocurrency platform. No financial borders, extra fees, and fake reviews — just a straightforward way to buy, sell, and hold the assets you care about.",
  },
  {
    title: "Invest Smart",
    description:
      "Get full statistic information about the behaviour of buyers and sellers. Our analytics surface market trends early, helping you make decisions backed by data instead of guesswork.",
  },
  {
    title: "Detailed Statistics",
    description:
      "View all mining related information in realtime, at any point at any location, and decide which polls you want to mine in — with historical performance at a glance.",
  },
  {
    title: "Grow your profit and track your investment",
    description:
      "Use advanced analytical tools. Clear Trading View charts let you track current and historical profit on every investment, so you always know where you stand.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        title="Features"
        description="The tools that make Crypto the fastest and most secure way to manage your portfolio."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto flex max-w-[1228px] flex-col gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[40px] bg-white p-10 md:p-16"
            >
              <h2 className="font-semibold text-2xl text-[#39079e]">
                {feature.title}
              </h2>
              <p className="mt-4 max-w-[700px] text-base leading-relaxed text-[#2d2d2d]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
curl -s http://localhost:3001/features | grep -c "Invest Smart"
```
Expected: `1` or more.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/features
```
Expected: `200`.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/page.tsx
git commit -m "feat: add Features page"
```

---

### Task 5: `/about` page

**Files:**
- Create: `src/app/about/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3.

- [ ] **Step 1: Create the About page**

```tsx
import PageHeader from "@/components/PageHeader";

const STATS = [
  { label: "Wallets trusted", value: "10M+" },
  { label: "Transactions processed", value: "$30B+" },
  { label: "Founded", value: "2019" },
  { label: "Countries served", value: "40+" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Crypto"
        description="Built to make buying, holding, and mining cryptocurrency simple, fast, and secure."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[1228px] space-y-10">
          <div className="rounded-[40px] bg-white p-10 md:p-16">
            <p className="max-w-[700px] text-base leading-relaxed text-[#2d2d2d] md:text-lg">
              Crypto started with a simple idea: trading digital assets
              shouldn&apos;t require a finance degree or a tolerance for
              hidden fees. Since launch, we&apos;ve built a platform that
              pairs bank-grade security with an interface anyone can use —
              from a first-time buyer to a full-time trader.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[40px] bg-white p-8 text-center transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <p className="font-semibold text-3xl text-[#39079e]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-[#2d2d2d]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
curl -s http://localhost:3001/about | grep -c "40+"
```
Expected: `1` or more.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/about
```
Expected: `200`.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add About page"
```

---

### Task 6: `/contact` page (creates shared `useFakeSubmit` hook)

**Files:**
- Create: `src/hooks/useFakeSubmit.ts`
- Create: `src/components/ContactForm.tsx`
- Create: `src/app/contact/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3.
- Produces: `useFakeSubmit(delayMs?: number)` — `src/hooks/useFakeSubmit.ts`, named export, returns `{ status: "idle" | "submitting" | "success"; submit: (isValid: boolean) => void; reset: () => void }`. Reused by Task 7 (Login) and Task 11 (Newsletter).

- [ ] **Step 1: Create the `useFakeSubmit` hook**

```ts
"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success";

export function useFakeSubmit(delayMs = 500) {
  const [status, setStatus] = useState<Status>("idle");

  function submit(isValid: boolean) {
    if (!isValid) return;
    setStatus("submitting");
    setTimeout(() => setStatus("success"), delayMs);
  }

  function reset() {
    setStatus("idle");
  }

  return { status, submit, reset };
}
```

- [ ] **Step 2: Create `ContactForm`**

```tsx
"use client";

import { useState } from "react";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { status, submit } = useFakeSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(name.trim() && email.trim() && message.trim()));
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[600px] rounded-[40px] bg-white p-10 text-center md:p-16">
        <h2 className="font-semibold text-2xl text-[#39079e]">
          Message sent
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#2d2d2d]">
          Thanks for reaching out — we&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[600px] space-y-6 rounded-[40px] bg-white p-10 md:p-16"
    >
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-[#2a2a2a]">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-[#2a2a2a]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="text-sm font-semibold text-[#2a2a2a]"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create the Contact page**

```tsx
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Have a question about your account, a trade, or a mining pool? Send us a message."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <ContactForm />
      </section>
    </>
  );
}
```

- [ ] **Step 4: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/contact
```
Expected: `200`.

```bash
curl -s http://localhost:3001/contact | grep -c "Send Message"
```
Expected: `1`.

Manual browser check: open `http://localhost:3001/contact`, submit the form with all three fields filled, confirm the form is replaced by the "Message sent" confirmation. Try submitting with a field empty and confirm the browser's native required-field validation blocks it.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFakeSubmit.ts src/components/ContactForm.tsx src/app/contact/page.tsx
git commit -m "feat: add Contact page with client-side form"
```

---

### Task 7: `/login` page

**Files:**
- Create: `src/components/LoginCard.tsx`
- Create: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `useFakeSubmit` from Task 6 (`@/hooks/useFakeSubmit`).

- [ ] **Step 1: Create `LoginCard`**

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

- [ ] **Step 2: Create the Login page**

```tsx
import LoginCard from "@/components/LoginCard";

export default function LoginPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-16 md:py-24">
      <LoginCard />
    </section>
  );
}
```

- [ ] **Step 3: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/login
```
Expected: `200`.

```bash
curl -s http://localhost:3001/login | grep -c "Sign in"
```
Expected: `1` or more.

Manual browser check: open `http://localhost:3001/login`, toggle between Sign in / Sign up (confirm the active tab styling swaps and the heading/button text changes), submit with both fields filled, confirm success message appears.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginCard.tsx src/app/login/page.tsx
git commit -m "feat: add Login page with sign in/up toggle"
```

---

### Task 8: `/terms` page

**Files:**
- Create: `src/app/terms/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3.

- [ ] **Step 1: Create the Terms page**

```tsx
import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Crypto platform, you agree to be bound by these Terms of Service. If you do not agree, you should not use the platform.",
  },
  {
    title: "2. Use of Service",
    body: "You may use Crypto only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You agree to provide accurate information when creating an account and to notify us promptly of any unauthorized use of your account.",
  },
  {
    title: "4. Limitation of Liability",
    body: "Cryptocurrency markets are volatile. Crypto is not liable for losses resulting from market fluctuations, third-party actions, or events outside our reasonable control.",
  },
  {
    title: "5. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        description="Please read these terms carefully before using the Crypto platform."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[900px] space-y-8 rounded-[40px] bg-white p-10 md:p-16">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-semibold text-xl text-[#39079e]">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#2d2d2d]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/terms
```
Expected: `200`.

```bash
curl -s http://localhost:3001/terms | grep -c "Limitation of Liability"
```
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add src/app/terms/page.tsx
git commit -m "feat: add Terms of Service page"
```

---

### Task 9: `/faq` page

**Files:**
- Create: `src/components/FaqAccordion.tsx`
- Create: `src/app/faq/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3.

- [ ] **Step 1: Create `FaqAccordion`**

```tsx
"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is Crypto safe to use?",
    a: "Yes. Funds are secured with multi-layer encryption and the majority of assets are held in cold storage, offline and out of reach of online threats.",
  },
  {
    q: "What cryptocurrencies can I buy?",
    a: "Crypto supports all major coins including Bitcoin, Ethereum, and a growing list of altcoins, with more added regularly based on demand.",
  },
  {
    q: "How do I start mining?",
    a: "Choose a mining pool from the Detailed Statistics dashboard, select a plan, and you can start mining in minutes — no hardware required.",
  },
  {
    q: "What are the fees?",
    a: "Trading fees are a flat 0.1% per transaction, with no hidden charges. Withdrawal fees vary by network and are shown before you confirm.",
  },
  {
    q: "How long do withdrawals take?",
    a: "Most withdrawals are processed within minutes, though network congestion can occasionally extend this to a few hours.",
  },
  {
    q: "Do you offer customer support?",
    a: "Our support team is available around the clock through the Contact page and responds to most requests within a few hours.",
  },
  {
    q: "Is there a mobile app?",
    a: "A mobile app is in development. In the meantime, the platform is fully responsive and works great from any mobile browser.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[800px] space-y-4">
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className="rounded-[24px] bg-white p-6 md:p-8">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-semibold text-[#39079e]"
            >
              <span>{item.q}</span>
              <span
                className={`shrink-0 text-2xl leading-none transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="mt-4 text-sm leading-relaxed text-[#2d2d2d]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create the FAQ page**

```tsx
import PageHeader from "@/components/PageHeader";
import FaqAccordion from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        description="Answers to the questions we hear most from traders and miners."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <FaqAccordion />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/faq
```
Expected: `200`.

```bash
curl -s http://localhost:3001/faq | grep -c "Is Crypto safe to use"
```
Expected: `1`.

Manual browser check: open `http://localhost:3001/faq`, click a question, confirm the answer expands and the `+` rotates to look like an `×`; click again to confirm it collapses.

- [ ] **Step 4: Commit**

```bash
git add src/components/FaqAccordion.tsx src/app/faq/page.tsx
git commit -m "feat: add FAQ page with accordion"
```

---

### Task 10: `/privacy-policy` page

**Files:**
- Create: `src/app/privacy-policy/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from Task 3.

- [ ] **Step 1: Create the Privacy Policy page**

```tsx
import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  {
    title: "Data We Collect",
    body: "We collect information you provide directly, such as your name and email address, as well as usage data like device type and pages visited.",
  },
  {
    title: "How We Use Your Data",
    body: "We use your data to operate and improve the platform, communicate with you about your account, and comply with legal obligations.",
  },
  {
    title: "Cookies",
    body: "Crypto uses cookies to keep you signed in and to understand how the platform is used. You can disable cookies in your browser, though some features may not work as expected.",
  },
  {
    title: "Your Rights",
    body: "You can request access to, correction of, or deletion of your personal data at any time by contacting our support team.",
  },
  {
    title: "Contact Us",
    body: "Questions about this policy can be sent to our team through the Contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description="How Crypto collects, uses, and protects your information."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[900px] space-y-8 rounded-[40px] bg-white p-10 md:p-16">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-semibold text-xl text-[#39079e]">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#2d2d2d]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/privacy-policy
```
Expected: `200`.

```bash
curl -s http://localhost:3001/privacy-policy | grep -c "Cookies"
```
Expected: `1` or more.

- [ ] **Step 3: Commit**

```bash
git add src/app/privacy-policy/page.tsx
git commit -m "feat: add Privacy Policy page"
```

---

### Task 11: Newsletter Subscribe — wire up with `useFakeSubmit`

**Files:**
- Modify: `src/components/StartMining.tsx`

**Interfaces:**
- Consumes: `useFakeSubmit` from Task 6 (`@/hooks/useFakeSubmit`).

- [ ] **Step 1: Rewrite `StartMining.tsx` as a client component with a working form**

Current file:

```tsx
export default function StartMining() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <div className="mx-auto flex max-w-[1228px] flex-col items-start gap-8 rounded-[40px] bg-white p-10 md:flex-row md:items-center md:justify-between md:p-16">
        <div>
          <h2 className="font-semibold text-2xl text-[#39079e]">
            Start mining now
          </h2>
          <p className="mt-2 max-w-[380px] text-sm leading-relaxed text-[#2d2d2d]">
            Join now with Crypto to get the latest news and start mining now
          </p>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full max-w-[467px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#929292] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
        />

        <button
          type="submit"
          className="w-full shrink-0 rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205] md:w-auto"
        >
          Subscribe
        </button>
      </div>
    </section>
  );
}
```

New file:

```tsx
"use client";

import { useState } from "react";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function StartMining() {
  const [email, setEmail] = useState("");
  const { status, submit } = useFakeSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim()));
  }

  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-[1228px] flex-col items-start gap-8 rounded-[40px] bg-white p-10 md:flex-row md:items-center md:justify-between md:p-16"
      >
        <div>
          <h2 className="font-semibold text-2xl text-[#39079e]">
            Start mining now
          </h2>
          <p className="mt-2 max-w-[380px] text-sm leading-relaxed text-[#2d2d2d]">
            {status === "success"
              ? "You're subscribed — check your inbox soon."
              : "Join now with Crypto to get the latest news and start mining now"}
          </p>
        </div>

        {status !== "success" && (
          <>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full max-w-[467px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#929292] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
            />

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full shrink-0 rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {status === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
          </>
        )}
      </form>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/
```
Expected: `200` (homepage still renders fine with the now-client component).

Manual browser check: scroll to "Start mining now" on the homepage, submit an email, confirm the form fields are replaced by the "You're subscribed" message.

- [ ] **Step 3: Commit**

```bash
git add src/components/StartMining.tsx
git commit -m "feat: wire up newsletter subscribe form"
```

---

### Task 12: Wire all navigation links + final site-wide verification

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/WhyChoose.tsx`
- Modify: `src/components/InvestSmart.tsx`
- Modify: `src/components/DetailedStats.tsx`
- Modify: `src/components/GrowProfit.tsx`

**Interfaces:**
- Consumes: every route created in Tasks 3–10 (`/products`, `/features`, `/about`, `/contact`, `/login`, `/terms`, `/faq`, `/privacy-policy`).

- [ ] **Step 1: Rewrite `Navbar.tsx` to use real routes and `next/link`**

```tsx
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
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
          {NAV_LINKS.map((link) => (
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
          href="/login"
          className="rounded-full bg-[#39079e] px-8 py-3 text-xs font-semibold tracking-[0.1em] text-white uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#2d0680] hover:shadow-lg"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Rewrite `Footer.tsx` to use real routes and `next/link`**

```tsx
import Image from "next/image";
import Link from "next/link";

const MAIN_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const OTHER_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

function PaymentCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[75px] w-[141px] items-center justify-center rounded-xl bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#f2f2f4]">
      <div className="border-t border-[#e5e5e5]" />

      <div className="mx-auto grid max-w-[1520px] grid-cols-2 gap-x-8 gap-y-12 px-9 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/assets/footer/logo-footer.svg"
            alt="Crypto"
            width={119}
            height={22}
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#2a2a2a]">Main</h3>
          <ul className="mt-5 space-y-3">
            {MAIN_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-[#2a2a2a] hover:text-[#39079e]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#2a2a2a]">Others</h3>
          <ul className="mt-5 space-y-3">
            {OTHER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-[#2a2a2a] hover:text-[#39079e]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h3 className="font-semibold text-xl leading-tight text-[#2a2a2a]">
            We accept following
            <br />
            payment systems
          </h3>
          <div className="mt-6 flex gap-4">
            <PaymentCard>
              <Image
                src="/assets/footer/visa.svg"
                alt="Visa"
                width={79}
                height={25}
              />
            </PaymentCard>
            <PaymentCard>
              <Image
                src="/assets/footer/mastercard.svg"
                alt="Mastercard"
                width={51}
                height={40}
              />
            </PaymentCard>
            <PaymentCard>
              <div className="relative size-11">
                <Image
                  src="/assets/footer/bitcoin-1.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
                <Image
                  src="/assets/footer/bitcoin-2.svg"
                  alt="Bitcoin"
                  fill
                  className="object-contain"
                />
              </div>
            </PaymentCard>
          </div>
        </div>
      </div>

      <div className="bg-white py-6 text-center text-xs text-[#787878]">
        © {new Date().getFullYear()} Crypto. All rights Reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Point Hero's Get Started at `/login`**

In `src/components/Hero.tsx`, add `import Link from "next/link";` above the existing `import HeroIllustration from "./HeroIllustration";` line, then replace the Get Started `<a>` with a `<Link>`. Old:

```tsx
          <a
            href="#"
            className="mt-10 inline-block rounded-full bg-[#ffb506] px-10 py-5 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Get Started
          </a>
```

New:

```tsx
          <Link
            href="/login"
            className="mt-10 inline-block rounded-full bg-[#ffb506] px-10 py-5 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Get Started
          </Link>
```

- [ ] **Step 4: Point WhyChoose's Learn More at `/features`**

In `src/components/WhyChoose.tsx`, add `import Link from "next/link";` at the top, then replace the Learn More `<a>` with `<Link>`. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

New:

```tsx
          <Link
            href="/features"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </Link>
```

- [ ] **Step 5: Point InvestSmart's Learn More at `/features`**

In `src/components/InvestSmart.tsx`, add `import Link from "next/link";` at the top, then replace the Learn More `<a>` with `<Link>`. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

New:

```tsx
          <Link
            href="/features"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </Link>
```

- [ ] **Step 6: Point DetailedStats' Learn More at `/features`**

In `src/components/DetailedStats.tsx`, add `import Link from "next/link";` at the top, then replace the Learn More `<a>` with `<Link>`. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

New:

```tsx
          <Link
            href="/features"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </Link>
```

- [ ] **Step 7: Point GrowProfit's Learn More at `/features`**

In `src/components/GrowProfit.tsx`, add `import Link from "next/link";` at the top, then replace the Learn More `<a>` with `<Link>`. Old:

```tsx
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
```

New:

```tsx
          <Link
            href="/features"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </Link>
```

- [ ] **Step 8: Verify every link resolves**

```bash
for path in / /products /features /about /contact /login /terms /faq /privacy-policy; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$path")
  echo "$path -> $code"
done
```
Expected: every line ends in `200`.

```bash
curl -s http://localhost:3001/ | grep -oE 'href="/[a-z-]*"' | sort -u
```
Expected output includes `href="/"`, `href="/about"`, `href="/contact"`, `href="/faq"`, `href="/features"`, `href="/login"`, `href="/privacy-policy"`, `href="/products"`, `href="/terms"` (Next.js renders `<Link>` as an `<a href>` in the HTML, so this confirms the actual rendered hrefs — note this checks the homepage; Navbar/Footer links are shared across every page since they live in the layout).

- [ ] **Step 9: Manual full site click-through**

Open `http://localhost:3001` in a browser and click, in order: each navbar link, the Login button, Get Started, each of the 4 Learn More buttons, and each footer link (Main + Others). Confirm every single one lands on the correct page with Navbar/Footer present and no 404. Resize to a narrow (mobile) width and spot-check `/login`, `/faq`, and the homepage don't break.

- [ ] **Step 10: Commit**

```bash
git add src/components/Navbar.tsx src/components/Footer.tsx src/components/Hero.tsx \
  src/components/WhyChoose.tsx src/components/InvestSmart.tsx src/components/DetailedStats.tsx \
  src/components/GrowProfit.tsx
git commit -m "feat: wire up all navigation links across the site"
```

- [ ] **Step 11: Ask the user before pushing**

This is the last task in the plan. Do not run `git push` automatically — confirm with the user first, since pushing affects the shared remote (`https://github.com/ren-urot/Crypto.git`).
