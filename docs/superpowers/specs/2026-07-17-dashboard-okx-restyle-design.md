# Dashboard OKX-style restyle — design

Date: 2026-07-17

## Goal

Restyle `/dashboard` (built in the previous plan) to look and feel like a
dark crypto-exchange trading terminal, following OKX's actual visual
design tokens, while keeping the same features (wallet summary, holdings
table, trade panel) and the same underlying trade logic.

## Non-goals

- No layout restructuring (no order book, no candlestick chart, no market
  list beyond the existing 3 coins) — this is a visual restyle, not a
  feature rebuild.
- No changes to Navbar/Footer or any other page — they stay on the
  existing light purple/orange theme. Only `/dashboard`'s own content area
  goes dark.
- No font change — Montserrat stays, site-wide.
- No real market data — `change24h` is a fixed dummy percentage per coin,
  same spirit as the existing dummy `price`.

## Design tokens (extracted directly from okx.com's live stylesheet)

- Page background: `#000000`
- Card surface: `#141414`, border `#2e2e2e`
- Primary text: `#fafafa`
- Secondary/muted text: `#909090`
- Positive / buy: `#25a750`
- Negative / sell: `#eb4b6d`
- Corner radius: small (Tailwind `rounded-xl` / `rounded-2xl`), not the
  marketing site's `rounded-[40px]` pill style — a trading terminal reads
  as denser and less playful than a landing page.

## Changes

### `src/lib/dashboard-data.ts`

Add `change24h: number` (a signed percentage, e.g. `2.34` or `-1.12`) to
the `Coin` type and to each entry in `COINS`. Add a `formatPercent(value):
string` helper that renders `+2.34%` / `-1.12%` (always signed).

### `src/app/dashboard/page.tsx`

Drop the shared `PageHeader` (it's styled for the light marketing pages).
Replace with a small inline dark header (page title + short description,
white/muted text) directly in this file. Section background becomes
`bg-black` instead of `bg-[#f2f2f4]`.

### `src/components/dashboard/WalletSummary.tsx`

Cards become `bg-[#141414] border border-[#2e2e2e] rounded-2xl`. Headings
`text-[#fafafa]`, secondary labels `text-[#909090]`. Each coin card gains a
small colored `change24h` badge (green/red per sign) next to the coin name.

### `src/components/dashboard/HoldingsTable.tsx`

Table container becomes `bg-[#141414] border border-[#2e2e2e] rounded-2xl`.
Row borders `border-[#2e2e2e]`. Add a "24h" column showing the signed,
colored percentage per coin.

### `src/components/dashboard/TradePanel.tsx`

Card becomes `bg-[#141414] border border-[#2e2e2e] rounded-2xl`. The
Buy/Sell toggle recolors: selected "Buy" tab is `bg-[#25a750] text-white`,
selected "Sell" tab is `bg-[#eb4b6d] text-white` (unselected stays
`text-[#909090]`). The submit button matches the currently selected side's
color (green for buy, red/pink for sell) instead of the site-wide orange
CTA. Result message color: success stays neutral light text, failure uses
the red token instead of a generic red.

### `src/components/dashboard/Dashboard.tsx`

No logic changes — `onTrade` validation is untouched. Only the wrapping
`<div>`'s className changes if needed for dark spacing/background
continuity with its new children.

## Testing

Manual verification via dev server + Playwright, consistent with this
project's convention: visit `/dashboard`, confirm the dark theme renders
with no light-background artifacts, confirm each coin shows a colored 24h
change badge in both the summary cards and the holdings table, confirm the
Buy/Sell toggle and submit button recolor correctly when switching sides,
and re-run the same 4 trade scenarios from the original dashboard plan
(valid buy, valid sell, oversized sell rejected, over-budget buy rejected)
to confirm the restyle didn't change any underlying behavior.
