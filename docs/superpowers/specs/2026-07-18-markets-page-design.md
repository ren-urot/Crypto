# Markets page — design

Date: 2026-07-18

## Goal

Replace the `/markets` coming-soon stub with a real market table listing
every dummy coin, modeled on OKX's actual Markets page but scoped down to
fit this app's 10-coin dummy dataset and existing purple/orange branding.

## Non-goals

- No Hot Crypto / New Listings / Macro Data / BTC ETF Flows summary strip
  — these are specialized real-market widgets; faking them for 10 dummy
  coins would be a lot of invented UI for no real product value.
- No Spot/Futures/Events & Options/DEX tabs — this app has one asset
  class (dummy spot coins), so tabs for other markets don't apply.
- No category filter chips (Hot/Top/New/Stocks/Meme/DeFi/etc.) — not
  meaningful for a fixed 10-coin list.
- No pagination — 10 coins fits on one screen.
- No OKX dark theme — matches this site's existing branding, per the
  standing convention established for the Trade/Buy Crypto/nav work
  (copy functionality/layout, not visual style).

## Data additions

`src/lib/dashboard-data.ts` (existing file, extended):

- Each `Coin` gains `marketCap: number` (a plausible dummy figure,
  roughly ordered the way real market caps are — BTC largest, then ETH,
  etc.).
- New `formatCompactUsd(value): string` using
  `Intl.NumberFormat(..., { notation: "compact" })` to render `$1.22T` /
  `$408.00B` style figures for the Market Cap column.

## Sparkline + 24h range (reused, not new logic)

The Trade page already has `generateCandles(coinId, currentPrice, count)`
producing deterministic seeded OHLC data. The Markets table reuses it
directly: `generateCandles(coin.id, coin.price, 24)` gives the last 24
hourly candles, from which:

- **Last 24h sparkline** = the candles' `close` values, plotted as a
  small inline SVG polyline (new `src/components/markets/Sparkline.tsx`
  — no charting library, this is simple enough to hand-roll, consistent
  with how small decorative graphics have been built elsewhere in this
  app).
- **24h Range** = `min(candle.low)` – `max(candle.high)` across those
  same 24 candles, shown as plain text (`$X – $Y`), not OKX's dual-marker
  range bar (that visual complexity isn't worth it for a demo table).

No new data-generation logic is introduced — this is pure reuse of
`candles.ts`.

## Markets table

`src/components/markets/MarketsView.tsx` (`'use client'`) — a search
input (same pattern as the Trade page's `MarketList`) filtering a table
with columns: Name (symbol + full name), Price, 24h Change (colored
green/red), Last 24h (sparkline), 24h Range, Market Cap, and a "Trade"
action button linking to `/trade`.

`src/app/markets/page.tsx` — rewritten from the coming-soon stub to
`PageHeader` + `MarketsView`.

## Testing

Manual verification via dev server + Playwright: visit `/markets`,
confirm all 10 coins render with correct price/change/market cap, confirm
the sparkline for each coin is colored to match its 24h change direction
(green when `change24h >= 0`, red otherwise) and visually distinct
between coins (not a flat line), confirm the 24h range values are
sensible (low ≤ current price ≤ high is NOT guaranteed by construction —
this is fine, dummy candles are a random walk seeded independently of the
"current" price display, but low < high must always hold), confirm
search filters the list, confirm each row's "Trade" button navigates to
`/trade`, and confirm reloading the page produces the same-looking
sparklines (proving determinism, no hydration warning — same guarantee
`candles.ts` already provides for the Trade page's chart).
