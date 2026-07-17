# Markets summary cards & sub-nav — design

Date: 2026-07-18

## Goal

Remove the purple `PageHeader` banner from `/markets` and replace it with
OKX's actual Markets-page header structure: a 3-tab sub-nav (Markets /
Rankings / Trading data) and 4 summary cards (Hot crypto, New listings,
Macro data, BTC ETF flows) above the existing market table.

## Non-goals

- No dark theme for the cards — matches this site's existing light
  purple/orange branding, per the standing convention for every OKX-derived
  feature this session (copy functionality/layout, not visual style).
- Rankings and Trading data are coming-soon stubs only, not full pages —
  same convention as Grow/Learn/More.
- No Spot/Futures toggle within Hot crypto/New listings — this app has one
  asset class; the toggle wouldn't have anything to switch between.
- No real ETF flow data, no real "new listing" tokens — both are
  explicitly dummy/decorative (see below), disclosed as such, not
  presented as derived from anything real.

## Sub-nav

`src/app/markets/layout.tsx` — wraps all `/markets/*` routes, rendering a
tab bar above `{children}` so it persists across Markets/Rankings/Trading
data without duplicating markup in three page files.

`src/components/markets/MarketsTabs.tsx` (`'use client'`, uses
`usePathname()` to highlight the active tab) — three tabs: Markets
(`/markets`), Rankings (`/markets/rankings`), Trading data
(`/markets/trading-data`).

`src/app/markets/rankings/page.tsx` and
`src/app/markets/trading-data/page.tsx` — simple "Coming soon." text
blocks (no `PageHeader`, since the tab bar from the layout already
identifies the page).

## Summary cards

`src/components/markets/MarketSummaryCards.tsx` — a 4-card grid rendered
above the existing `MarketsView` table on `/markets` only (not on the
Rankings/Trading-data stubs).

- **Hot crypto** — the 3 coins from the existing `COINS` array with the
  largest `|change24h|`, each linking to `/trade` (same action as the
  main table).
- **New listings** — 3 fictional tickers (name, symbol, price, change)
  hardcoded directly in this component, NOT added to `CoinId`/`COINS`/the
  wallet system — they're decorative only, not real tradeable assets in
  this app (there's nothing to buy/sell against them, so no `/trade`
  link).
- **Macro data** — every figure here is *computed* from the existing
  `COINS` array, not invented:
  - Market cap = sum of every coin's `marketCap`.
  - Volume = sum of every coin's `volume24h`.
  - BTC dominance = BTC's `marketCap` ÷ total market cap.
  - Market cap's shown "change" = the `change24h` values weighted by each
    coin's `marketCap` (a market-cap-weighted blended index change) —
    computed, not a fabricated number.
  - A sparkline for the total market cap, generated via the existing
    `generateCandles(seed, currentValue, count)` from `@/lib/candles`,
    seeded with a fixed string (`"MARKET-INDEX"`) and anchored to the
    computed total market cap — reuses the same deterministic generator
    already powering the Trade page's chart and the Markets table's
    per-coin sparklines, no new data-generation logic.
  - Volume's percent change is intentionally NOT shown — there's no
    underlying per-period volume history to derive it from, and
    fabricating one would cross from "dummy but computed" into "made up."
- **BTC ETF flows** — two static dummy figures (a "daily net" and a "last
  30 day" number), disclosed here as pure decoration with no underlying
  data model, same spirit as the sign-up wizard's fake OTP or the seeded
  order-history rows elsewhere in this app.

## Page changes

`src/app/markets/page.tsx` — drop the `PageHeader` import/usage entirely;
render `MarketSummaryCards` followed by the existing `MarketsView` (which
keeps its own internal card/table markup unchanged).

## Testing

Manual verification via dev server + Playwright: visit `/markets`,
confirm the purple banner is gone and the 3-tab bar renders with
"Markets" highlighted as active; confirm all 4 summary cards render with
plausible figures (Hot crypto shows 3 coins sorted by volatility, Macro
data's market cap/volume/BTC dominance figures are internally consistent
with the values already shown in the table below, the market-cap
sparkline is non-flat and colored to match the sign of the blended
change); click "Rankings" and "Trading data" and confirm both load a
coming-soon page with the tab bar still visible and "Rankings"/"Trading
data" now highlighted as active; click back to "Markets" and confirm the
summary cards and table are still there.
