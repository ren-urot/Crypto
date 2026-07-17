# Trade page (OKX-style core spot trading) — design

Date: 2026-07-17

## Goal

Add a `/trade` page bringing OKX's core spot-trading functionality
(market list, price chart, order book, limit/market order form, open
orders, order history) into this site, using the site's existing
purple/orange branding — not OKX's visual style. All data is dummy;
there is still no real backend.

This supersedes the earlier dark-theme restyle spec (removed): the user
clarified branding stays as-is and the ask is OKX's *functionality*, not
its look.

## Non-goals

- No margin, futures, options, P2P, NFT marketplace, earn/staking, or
  copy trading — explicitly out of scope per user decision.
- No real price feed, no real order matching engine. Limit orders sit in
  "Open Orders" until manually cancelled — there is no simulated fill
  mechanism (that would require an ongoing price-ticking system, out of
  scope for dummy data).
- No real deposit/withdraw yet (that's sub-project C, a separate spec).
- No Convert feature yet (sub-project B, a separate spec).
- Visual style matches the existing site exactly: purple `#39079e`
  headings, `#2d2d2d` body text, `#f2f2f4` section background, white
  rounded cards, orange `#ffb506` CTA — the same tokens used everywhere
  else, not OKX's dark theme.

## Architecture

### Shared wallet state (new)

The wallet currently lives only inside `Dashboard` (`useState`, scoped to
`/dashboard`). Since `/trade` needs to read and mutate the same holdings,
extract it into a Context:

- `src/lib/wallet-context.tsx` — `'use client'`. Exports `WalletProvider`
  (wraps `children`, holds `wallet` state + the existing `onTrade`
  validation logic, initialized from `INITIAL_WALLET`) and
  `useWallet()` (returns `{ wallet, totalValue, onTrade }`).
- `src/app/layout.tsx` wraps `{children}` in `<WalletProvider>` (inside
  the existing `<main>`, so Navbar/Footer don't need wallet access and
  aren't re-rendered by wallet changes).
- `Dashboard.tsx` (existing) is refactored to call `useWallet()` instead
  of owning its own `useState` — same rendered output, same behavior,
  different state source.
- `onTrade`'s signature and validation rules are unchanged from the
  existing dashboard work — same rejection conditions (oversized sell,
  over-budget buy), same return shape.

### Expanded market data

`src/lib/dashboard-data.ts` (existing file, extended):

- `CoinId` grows from 3 to 10: `"BTC" | "ETH" | "SOL" | "XRP" | "ADA" |
  "DOGE" | "BNB" | "MATIC" | "LTC" | "DOT"`.
- Each `Coin` gains `change24h: number` (signed percent) and
  `volume24h: number` (dummy USD volume).
- `INITIAL_WALLET.holdings` gains entries for all 10 coins — the 7 new
  ones start at `0`, the original 3 (BTC/ETH/SOL) keep their existing
  dummy amounts.
- Add `formatPercent(value): string` rendering `+2.34%` / `-1.12%`
  (always signed, two decimals).

### Deterministic dummy time-series (new)

`src/lib/seeded-random.ts` — a small seeded PRNG (mulberry32 or
equivalent, no dependency). Given a numeric seed, produces a repeatable
sequence of floats in `[0, 1)`. This matters because Next.js
server-renders the page then hydrates on the client — plain
`Math.random()` would produce different output each time and trigger a
hydration mismatch; a seed derived from the coin id (e.g. hashing the
string) keeps server and client output identical.

`src/lib/candles.ts` — `generateCandles(coinId, currentPrice, count =
60): Candle[]` where `Candle = { time: number; open: number; high:
number; low: number; close: number }`. Uses the seeded PRNG (seeded by
`coinId`) to produce a plausible-looking random-walk price series ending
at `currentPrice`, with `time` as sequential UNIX timestamps (e.g. one
per hour, most recent = now).

`src/lib/order-book.ts` — `generateOrderBook(coinId, currentPrice):
{ bids: OrderBookRow[]; asks: OrderBookRow[] }` where `OrderBookRow =
{ price: number; amount: number }`. Bids seeded slightly below
`currentPrice`, asks slightly above, using the same seeded-PRNG approach.

### Components (`src/components/trade/`)

- **`MarketList`** — search input (filters by name/symbol) + scrollable
  list of all 10 coins showing price + colored `change24h`. Click a row
  to set it as the active/selected market (local state in the page or a
  small lifted state in `TradeView`, not global).
- **`PriceChart`** (`'use client'`) — renders a candlestick chart for the
  selected coin via the `lightweight-charts` library, fed
  `generateCandles(selectedCoin, price)`.
- **`OrderBook`** — renders `generateOrderBook(selectedCoin, price)` as
  two columns (bids/asks). Clicking a row calls an `onSelectPrice(price)`
  callback.
- **`OrderForm`** (`'use client'`) — Market/Limit toggle, Buy/Sell toggle,
  amount input, price input (shown only for Limit, and settable via
  `onSelectPrice` from `OrderBook`), a computed total estimate. On
  submit:
  - Market order: calls `useWallet().onTrade(coinId, side, amount)`
    immediately (identical to the existing trade panel behavior), then
    appends a `"filled"` entry to order history.
  - Limit order: does NOT call `onTrade` yet. Appends a `"open"` entry to
    a local open-orders list with the target price.
- **`OpenOrders`** — lists open limit orders for the selected coin (or
  all coins) with a Cancel button per row, which removes the order from
  the open list (no wallet effect, since it was never executed).
- **`OrderHistory`** — lists filled/cancelled orders, read-only. Seeded
  with 1-2 dummy pre-existing filled rows on first load so it isn't
  empty.
- **`TradeView`** (`'use client'`) — owns `selectedCoinId`, the open
  orders list, and the order history list (all local `useState`, not in
  the wallet Context — orders are page-local UI state, only wallet
  balances are shared). Composes all of the above, wires `useWallet()`
  through to `OrderForm`.

### Route

`src/app/trade/page.tsx` — Server Component shell rendering `PageHeader`
("Trade") + the client `TradeView`.

## New dependency

`lightweight-charts` (TradingView's open-source charting library) — for
`PriceChart`. This is a real new npm dependency, explicitly approved.

## Testing

Manual verification via dev server + Playwright: visit `/trade`, confirm
the market list shows all 10 coins with colored change badges, search
filters the list, selecting a coin updates the chart/order book/form,
clicking an order-book row fills the limit price field, placing a market
order updates the wallet (verify by then visiting `/dashboard` and seeing
the same updated balance — proving the shared Context works across
pages), placing a limit order appears in Open Orders and can be
cancelled, and Order History shows the seeded dummy rows plus any newly
filled market order.
