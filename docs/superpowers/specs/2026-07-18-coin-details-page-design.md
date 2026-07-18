# Coin details page — design

Date: 2026-07-18

## Goal

Expand `/markets/[coinId]` from its current minimal stub (name, price,
chart, 4 stats) into a fuller coin profile page modeled on OKX's real
coin price page, scoped to this app's dummy data and explicitly excluding
anything that would require fabricating content that reads as real.

## Non-goals (explicitly excluded, and why)

- **No news articles.** Fabricating headlines/sources/dates and
  presenting them as news is a form of fake content that could be
  mistaken for real information — not worth the risk for a demo feature.
- **No tokenized real-company stock listings** (the reference shows
  Tesla, MicroStrategy, Amazon, Broadcom, etc. with fake prices/changes).
  Attaching invented trading data to real, named companies is the same
  concern as fake news — excluded entirely.
- **No multi-fiat currency conversion table** (CNY/KRW/TRY/EUR/CAD/ZAR) —
  this app only ever deals in USD; not worth modeling for a table nobody
  can act on.
- **No external "Guides"/"OKX Learn" article links** — there's nothing
  real to link to.
- **No trading pairs against other quote currencies** — this app only
  has USD-denominated dummy prices.

## What's included

### Sub-nav tabs

`About | Price | Performance | Reviews | News | Guides` — client-side
tab state (same pattern as the Markets page's asset-class tabs), "Price"
active by default.

- **Price** (default): chart + time-range buttons + stats grid + recent
  prices table + buy/trade promo cards.
- **About**: a short factual blurb about the real coin + a generic FAQ
  accordion.
- **Performance / Reviews / News / Guides**: "coming soon" placeholder —
  these map to the explicitly-excluded content above.

### Time-range chart

`PriceChart` (existing, from the Trade page) gains an optional
`candleCount` prop (defaults to 60, preserving its current behavior on
the Trade page, which doesn't pass this prop). The details page adds
four buttons — 24H / 7D / 1M / 1Y — mapping to candle counts of 24 / 168
/ 720 / 8760 (all hourly candles from the existing deterministic
generator; longer ranges are just more candles, not a different
granularity — simplest correct reuse of the existing generator).

### Stats + recent prices

- Existing stats card (market cap, 24h volume, 24h high/low) gains a
  fifth figure: **all-time high**, computed deterministically via a new
  seeded helper (`getAllTimeHigh(coinId, currentPrice)` in a new
  `src/lib/coin-history.ts`) — always plausibly above the current price
  (a seeded multiplier between 1.3x and 4x), disclosed as dummy.
- New **"Recent prices"** table: Today (reuses the existing
  `change24h`), 7 days / 30 days / 1 year — each computed via a second
  new helper (`getHistoricalChange(coinId, period)` in the same file),
  seeded per `${coinId}-${period}` so it's stable across renders, with
  plausible ranges per period (7d: ±15%, 30d: ±30%, 1y: -50% to +120%).

### About blurb

A short (2-3 sentence), factual, well-known-public-information
description per coin, hardcoded in a lookup keyed by `CoinId` — e.g. what
Bitcoin is and when/who created it. This is real, uncontroversial public
knowledge about real cryptocurrencies (comparable to an encyclopedia
entry), not a fabricated claim — different in kind from the excluded
news/stock content above.

### FAQ

A generic, templated accordion (same accordion pattern as the site's
existing `FaqAccordion`) with the coin's name/symbol interpolated into 5-6
generic questions (e.g. "How do I buy {symbol}?", "Is {name} a good
investment?") answered with genuinely generic, hedge-appropriate content
(no real price predictions, no specific investment claims) — safe because
it's templated framing, not coin-specific claims that could be wrong.

### Buy/Trade promos

Keep the existing "Buy {symbol}" / "Trade" CTA buttons from the current
stub, unchanged.

## Architecture

`src/app/markets/[coinId]/page.tsx` stays a Server Component (validates
the `coinId` param, 404s on an unknown coin via `notFound()`), now
passing the resolved `coin` to a new Client Component,
`src/components/markets/CoinDetailView.tsx`, which owns all the
interactive state (active tab, active time range).

## Testing

Manual verification via dev server + Playwright: visit a valid coin
(e.g. `/markets/eth`), confirm "Price" tab is active by default and
shows the chart, stats (including all-time high), and recent-prices
table; click each time-range button and confirm the chart updates
(different candle count, no console errors); click "About" and confirm
the blurb + FAQ render, with the FAQ accordion expanding/collapsing on
click; click Performance/Reviews/News/Guides and confirm each shows a
coming-soon message; confirm Buy/Trade buttons still navigate correctly;
reload and confirm no hydration warnings (all-time-high and
historical-change figures must be deterministic, matching the existing
project convention for dummy time-series data).
