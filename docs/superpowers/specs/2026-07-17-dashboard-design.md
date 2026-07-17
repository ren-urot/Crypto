# Post-login dashboard — design

Date: 2026-07-17

## Goal

After logging in (sign in or sign up, both), the user should land on a
centralized crypto trading platform and wallet view, populated with dummy
data, so the site demonstrates what a logged-in experience would look like.

## Non-goals

- No real backend, no real auth, no persisted state — wallet data lives in
  React state for the lifetime of the page and resets on reload.
- No real market data or price feed — coin prices are fixed dummy numbers.
- No gating of `/dashboard` behind a login check — consistent with the rest
  of this backend-less site, it's directly reachable by URL.
- No order history, no charts, no multi-currency support — scope is wallet
  summary + holdings + a single buy/sell trade panel.

## Architecture

### Route

`src/app/dashboard/page.tsx` — a Server Component shell that renders
`PageHeader` (title "Dashboard", short description) plus the client
`Dashboard` component. Gets Navbar/Footer for free from the root layout,
same as every other route.

### Dummy data

`src/lib/dashboard-data.ts` exports:

```ts
export type CoinId = "BTC" | "ETH" | "SOL";

export type Coin = {
  id: CoinId;
  name: string;
  symbol: CoinId;
  price: number; // dummy fixed USD price
};

export const COINS: Coin[];

export type Wallet = {
  usd: number;
  holdings: Record<CoinId, number>;
};

export const INITIAL_WALLET: Wallet;
```

Three coins: Bitcoin, Ethereum, Solana, with plausible fixed dummy prices.
Initial wallet: a starting USD cash balance plus a starter holding of each
coin, so the wallet summary and holdings table have real-looking numbers on
first load.

### State

`src/components/dashboard/Dashboard.tsx` — `'use client'`. Holds
`const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET)`. Computes
total portfolio value (`usd + sum(holdings[coin] * price[coin])`) and passes
`wallet`, `totalValue`, and an `onTrade` handler down to its three children.

`onTrade(coinId, side: "buy" | "sell", amount: number)`:
- Validates `amount > 0`.
- For `"sell"`: rejects if `amount > wallet.holdings[coinId]`.
- For `"buy"`: computes `cost = amount * price`, rejects if
  `cost > wallet.usd`.
- On success, returns a new `Wallet` with `usd` and `holdings[coinId]`
  updated accordingly, and `setWallet` is called with it.
- Returns a result (`{ ok: true }` or `{ ok: false; reason: string }`) so
  `TradePanel` can show inline feedback without `Dashboard` needing to know
  about `TradePanel`'s internal UI state.

### Components

- **`WalletSummary`** (presentational) — takes `wallet` and `totalValue`.
  Renders a total-balance card plus one small card per coin showing
  quantity held and current USD value, matching the site's white
  `rounded-[40px]` card / purple-heading visual language.
- **`HoldingsTable`** (presentational) — takes `wallet`. Renders a table:
  coin, quantity, price, value — one row per coin in `COINS`.
- **`TradePanel`** (`'use client'`, owns its own local form state: selected
  coin, buy/sell toggle, amount input, and a submit-result message) — takes
  `onTrade`. On submit, calls `onTrade`, shows the returned result inline
  (success: "Bought 0.05 BTC for $3,100.00"; failure: the returned reason
  string), and clears the amount field on success.
- **`Dashboard`** (`'use client'`) — owns `wallet` state, computes
  `totalValue`, renders `WalletSummary` + `HoldingsTable` + `TradePanel` in
  that order, wires `onTrade` to all mutate the same state.

## Login integration

`src/components/LoginCard.tsx` already uses `useFakeSubmit`. Add
`useRouter` from `next/navigation`. Add a `useEffect` watching `status`:
when it becomes `"success"`, call `router.push("/dashboard")`. This applies
to both sign-in and sign-up modes — no need to keep the existing inline
"Welcome back" / "Account created" success card, since the user navigates
away during/after the fake delay. Remove that now-unreachable success
branch from `LoginCard`'s render.

## Testing

Manual verification via dev server + Playwright, consistent with this
project's existing convention (no automated test framework): visit
`/dashboard` directly and confirm it renders with dummy data; log in via
`/login` and confirm it redirects to `/dashboard`; place a valid buy and a
valid sell and confirm the wallet numbers update and the holdings
table/summary reflect the change; attempt an invalid trade (oversized sell,
oversized buy) and confirm it's rejected with a clear inline message and no
state change.
