# Session-aware navigation & Buy Crypto page — design

Date: 2026-07-17

## Goal

Once a user "logs in" (via the existing fake-success `LoginCard` flow), the
top navigation should change to mirror OKX's logged-in header items — Buy
Crypto, Markets, Trade, Grow, Learn, More — and a real Buy Crypto page
should exist, modeled on OKX's actual buy-crypto flow
(https://www.okx.com/buy-crypto), adapted to this site's existing dummy
wallet instead of a real payment/on-ramp integration.

## Non-goals

- No real authentication, no persisted session — "logged in" is an
  in-memory Context flag for the current browser session, consistent
  with every other piece of state in this app (wallet, orders). It
  resets on hard reload.
- No logout flow — not requested; can be added later if needed.
- Markets/Grow/Learn/More get placeholder "coming soon" content only —
  not full feature builds. (Trade already exists from the previous
  plan.)
- Buy Crypto has no real payment method selection (no card/bank UI) —
  it spends from the existing dummy USD cash balance only, framed as
  "Wallet balance," matching how every other dummy trade already works
  in this app.

## Session state

`src/lib/session-context.tsx` — `'use client'`, same pattern as
`wallet-context.tsx`:

```ts
type SessionContextValue = {
  isLoggedIn: boolean;
  login: () => void;
};
```

`SessionProvider` wraps `children`; `useSession()` throws outside a
Provider (fail-fast, matching `useWallet()`'s convention). Mounted in
`src/app/layout.tsx` alongside the existing `WalletProvider` (order
between the two doesn't matter — neither depends on the other).

`LoginCard`'s existing `useEffect` (fires when `useFakeSubmit`'s `status`
becomes `"success"`) additionally calls `useSession().login()` right
before `router.push("/dashboard")`.

## Navbar

`Navbar.tsx` becomes a Client Component (`'use client'`) so it can read
`useSession().isLoggedIn` and pick one of two link sets:

- **Logged out** (unchanged from current site): Products, Features,
  About, Contact — right-side button: "Login" → `/login`.
- **Logged in**: Buy Crypto (`/buy-crypto`), Markets (`/markets`), Trade
  (`/trade`), Grow (`/grow`), Learn (`/learn`), More (`/more`) —
  right-side button becomes "Dashboard" → `/dashboard`, replacing
  "Login" (there is no separate account/profile nav item in the
  requested logged-in list, so the dashboard/wallet needs to stay
  reachable from this one remaining button).

This supersedes the `Navbar` change from the previous plan's final-review
fix, which added "Dashboard" and "Trade" as always-visible items — those
are now folded into the two state-dependent link sets described above.

## Buy Crypto page

`src/app/buy-crypto/page.tsx` (Server Component, renders `PageHeader` +
client `BuyCryptoView`) + `src/components/buy-crypto/BuyCryptoView.tsx`
(`'use client'`).

Modeled on OKX's actual buy-crypto page structure (Buy/Sell tabs → amount
input → "you get" estimate → CTA → balance row → disabled-until-valid
submit), adapted to this app's dummy USD wallet:

- Buy/Sell toggle (same visual pattern as the existing order-type/side
  toggles elsewhere in this app).
- **Buy mode:** USD amount input ("You pay") + a coin dropdown (reusing
  `COINS` from `dashboard-data.ts`) for "You get," with a live computed
  estimate (`amount / coin.price`).
- **Sell mode:** coin amount input ("You sell") + the same coin dropdown,
  with a live computed USD estimate (`amount * coin.price`).
- A "Wallet balance" row showing the current USD cash balance from
  `useWallet()`.
- A single CTA button, disabled until the entered amount is a valid
  positive number, labeled "Buy {SYMBOL}" / "Sell {SYMBOL}" depending on
  mode and selected coin (mirrors OKX's dynamic button label).
- On submit, calls `useWallet().onTrade(coinId, side, amount)` directly —
  identical mechanics to a market order elsewhere in this app — and shows
  the returned success/failure message inline.

## Coming-soon stubs

`src/app/markets/page.tsx`, `src/app/grow/page.tsx`,
`src/app/learn/page.tsx`, `src/app/more/page.tsx` — each just
`<PageHeader title="..." description="Coming soon." />`, no additional
body content. No new shared component needed for something this small.

## Sign-up wizard

`LoginCard`'s "Sign up" tab currently renders the same simple email+password
form as "Sign in." Replace it with a multi-step wizard modeled on OKX's
actual sign-up flow (screenshots supplied by the user), adapted to this
app's no-backend pattern — every step is a UI-only stand-in, nothing is
actually sent anywhere:

`src/components/auth/SignupWizard.tsx` (`'use client'`) — owns a `step:
1 | 2 | 3 | 4 | 5 | 6` plus per-step field state. The Sign in/Sign up tab
toggle in `LoginCard` stays visible throughout (lets the user bail back to
Sign in at any point); the wizard's own step 1 additionally has OKX's own
"Have an account? Log in" link doing the same thing, matching the reference.

1. **Location** — a `<select>` of ~8 common countries + a required "I agree
   to the [Terms of Service] and [Privacy Notice]" checkbox, linking to the
   site's existing `/terms` and `/privacy-policy` pages (real reuse, not
   placeholder links) + "Create account" button (disabled until checked).
2. **Email** — email input (required) + optional referral code input +
   "Sign up" button (disabled until the email field is non-empty).
3. **OTP** — 6 individual single-digit inputs (auto-advance focus to the
   next box on entry) + a description naming the email from step 2 + a
   dummy 60-second "Resend code" countdown (re-arms the button, does not
   actually resend anything) + "Unable to verify? change email" link back
   to step 2. Auto-advances to step 4 once all 6 boxes are filled (any
   digits accepted — there is no real code to check against).
4. **Phone** — a static "+1" prefix + phone number input (required) +
   "Verify now" button (disabled until non-empty), advances to step 5.
   No real SMS/OTP round-trip for the phone (out of scope — the reference
   flow's phone step has no visible code-entry screen either).
5. **Password** — password input (with a show/hide toggle using
   `lucide-react`'s `Eye`/`EyeOff`, already an installed dependency) + a
   live checklist (8-32 characters, ≥1 lowercase, ≥1 uppercase, ≥1 digit,
   ≥1 special character), each line ticking green as it's satisfied +
   "Confirm" button (disabled until all five rules pass).
6. **Identity verification** — two selectable cards, "Individual
   verification" (default selected) and "Institutional verification"
   (selectable but behaviorally identical — this is a visual-parity step,
   not a functional fork) + "Verify identity" button. This button reuses
   the existing `useFakeSubmit` hook: on click it goes through the same
   submitting→success delay as every other form in this app, and on
   success calls `useSession().login()` and `router.push("/dashboard")` —
   the same terminal action as a completed sign-in.

No step persists anything beyond the wizard's own local state; refreshing
the page mid-wizard resets it to step 1, consistent with this app having no
real backend anywhere.

## Testing

Manual verification via dev server + Playwright:

- Confirm the Navbar shows the logged-out link set by default; log in via
  `/login` (Sign in tab) and confirm the Navbar immediately switches to the
  logged-in link set and the right-side button becomes "Dashboard."
- Click through all 6 logged-in nav items and confirm none 404 (Buy Crypto
  and Trade fully functional, the other 4 show a coming-soon header).
- On `/buy-crypto`, buy a coin and confirm the wallet's USD balance
  decreases and the coin holding increases (verify by also checking
  `/dashboard`), then sell it back and confirm the reverse; attempt a buy
  that exceeds the wallet balance and confirm it's rejected with no state
  change, consistent with every other trade path in this app.
- On `/login`, switch to "Sign up" and walk through all 6 wizard steps in
  order: confirm each step's button is disabled until its step's
  validation passes, confirm the OTP step auto-advances once all 6 digits
  are entered, confirm the password step's checklist ticks items live as
  a qualifying password is typed, and confirm completing step 6 logs the
  session in and redirects to `/dashboard` (Navbar should now show the
  logged-in link set, same as a normal sign-in).
