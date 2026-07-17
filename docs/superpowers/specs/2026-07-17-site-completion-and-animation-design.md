# Site completion & homepage animation — design

Date: 2026-07-17

## Goal

The homepage currently links to pages/routes that don't exist (Products, Features,
About, Contact, Login, Terms, FAQ, Privacy Policy) and several buttons are dead
(`href="#"`). This spec covers building out those pages, wiring every button/link
to a real destination, and adding a scroll/hover animation pass to the homepage
to give it a more "techy" feel.

## Non-goals

- No real backend: no database, no auth provider, no email sending. Login,
  Contact, and the newsletter Subscribe form are client-side only and fake
  success on submit.
- No CMS or dynamic content — all new page content is static placeholder copy
  written to match the site's tone and visual style.
- No new npm dependencies (no animation library) — animation is hand-rolled
  with `IntersectionObserver` and CSS.

## Architecture

### Shared layout

`Navbar` and `Footer` currently render from `src/app/page.tsx`. Move both into
`src/app/layout.tsx`, wrapping `{children}`, so every route gets them for free.
`page.tsx` (the homepage) shrinks to just its section stack.

### New route structure

One folder per page under `src/app/`, each with a `page.tsx`:

```
src/app/
  products/page.tsx
  features/page.tsx
  about/page.tsx
  contact/page.tsx
  login/page.tsx
  terms/page.tsx
  faq/page.tsx
  privacy-policy/page.tsx
```

All are Server Components except `contact`, `login`, and the FAQ accordion,
which need `'use client'` for interactivity (delegated to small client
sub-components, not the whole page, per Next's "reduce client JS" guidance).

### Shared `PageHeader` component

`src/components/PageHeader.tsx` — takes `title` and `description` props,
renders a band matching the existing hero's typography (purple heading,
grey body text) below the navbar. Used at the top of every new page except
`/login` (which is a centered standalone card, no header band).

## Page-by-page content

- **`/products`** — PageHeader + 4 product cards (Buy/Sell, Wallet, Trading,
  Mining), reusing the existing white-rounded-card visual style from the
  homepage feature sections.
- **`/features`** — PageHeader + one expanded section per homepage feature
  card (Why Choose Crypto, Invest Smart, Detailed Statistics, Grow Your
  Profit), each with a bit more copy than the homepage teaser version.
- **`/about`** — PageHeader + a short company story paragraph + a stats row
  reusing the hero's "10M wallets / $30B in transactions" figures plus 1-2
  more invented stats (e.g. "Founded 2019", "40+ countries").
- **`/contact`** — PageHeader + contact form (name, email, message) using the
  shared form pattern below.
- **`/login`** — Centered card with a Sign in / Sign up toggle (client
  component), each mode a simple email+password form using the shared form
  pattern below.
- **`/terms`** — PageHeader + placeholder legal prose in a few labeled
  sections (Acceptance of Terms, Use of Service, Limitation of Liability,
  etc).
- **`/faq`** — PageHeader + accordion (client component) of 6-8 crypto-platform
  themed Q&A pairs.
- **`/privacy-policy`** — PageHeader + placeholder legal prose (Data We
  Collect, How We Use It, Your Rights, etc).

## Forms pattern

Applies to: Login (sign in + sign up), Contact, and the existing newsletter
Subscribe input in `StartMining`.

Each is a small `'use client'` component with:

- `useState` for field values.
- `useState<'idle' | 'submitting' | 'success'>('idle')` for submit status.
- `onSubmit` calls `preventDefault()`, does basic required-field validation
  (native `required` + a simple non-empty check, no email-format regex
  needed), sets `submitting` briefly (~500ms, `setTimeout`, so the button
  visibly disables — makes it feel real), then sets `success` and swaps the
  form UI for a confirmation message.
- No network calls, no persistence. State resets to `idle` only on page
  reload/navigation.

## Animation system

### `Reveal` component

`src/components/Reveal.tsx` — `'use client'`. Wraps `children` in a `div`,
uses `IntersectionObserver` (`threshold: 0.15`, fires once then
disconnects) to toggle a `visible` boolean in state. ClassName switches
between:

- Hidden: `opacity-0 translate-y-6`
- Visible: `opacity-100 translate-y-0`

Both with `transition-all duration-700 ease-out`. Applied by wrapping each
homepage section (`WhyChoose`, `MarketSentiments`, `InvestSmart`,
`DetailedStats`, `GrowProfit`, `StartMining`) individually in `page.tsx`,
and additionally around each feature card where a section holds more than
one, so cards reveal with a slight stagger as they cross the viewport
threshold rather than all firing at once.

### CSS additions (`globals.css`)

- `@keyframes float` — slow, subtle vertical drift (±8px over ~4s,
  ease-in-out, infinite). Applied via a `.animate-float` utility class to
  the hero illustration and other large illustration wrappers.
- Button hover polish: existing buttons (`Learn More`, `Get Started`,
  `Login`, `Subscribe`) get `hover:scale-[1.03] hover:shadow-lg
  transition-transform duration-200` added to their existing className
  strings.
- Both the `float` animation and the `Reveal` transition are disabled inside
  `@media (prefers-reduced-motion: reduce)`.

## Link wiring map

| Element | Destination |
|---|---|
| Navbar: Products | `/products` |
| Navbar: Features | `/features` |
| Navbar: About | `/about` |
| Navbar: Contact | `/contact` |
| Navbar: Login button | `/login` |
| Hero: Get Started | `/login` |
| WhyChoose / InvestSmart / DetailedStats / GrowProfit: Learn More | `/features` |
| Footer Main: Products/Features/About/Contact | same routes as navbar |
| Footer Others: Terms | `/terms` |
| Footer Others: FAQ | `/faq` |
| Footer Others: Privacy Policy | `/privacy-policy` |
| StartMining: Subscribe | stays on page, client-side fake-success (no navigation) |

All internal links use Next's `<Link>` component (not raw `<a href>`) for
client-side navigation.

## Testing

Manual verification via dev server + Playwright screenshots (as used
throughout this session): visit each new route, confirm it renders with
Navbar/Footer, submit each form and confirm the success state appears,
scroll the homepage and confirm sections reveal, resize to confirm nothing
breaks at mobile widths. No automated test suite exists in this project
currently, so no new automated tests are added — this matches existing
project conventions.
