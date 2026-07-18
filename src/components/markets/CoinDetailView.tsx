"use client";

import { useState } from "react";
import Link from "next/link";
import {
  formatUsd,
  formatPercent,
  formatCompactUsd,
  type Coin,
  type CoinId,
} from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import { getAllTimeHigh, getHistoricalChange } from "@/lib/coin-history";
import {
  getTradingPairs,
  getFxConversions,
  getTopPicks,
  formatCurrency,
} from "@/lib/coin-explore";
import PriceChart from "@/components/trade/PriceChart";

const NAV_SECTIONS = [
  { label: "About", id: "about" },
  { label: "Price", id: "price" },
  { label: "Performance", id: "performance" },
  { label: "Reviews", id: "reviews" },
  { label: "News", id: "news" },
  { label: "Guides", id: "guides" },
] as const;

const TIME_RANGES = [
  { label: "24H", count: 24 },
  { label: "7D", count: 24 * 7 },
  { label: "1M", count: 24 * 30 },
  { label: "1Y", count: 24 * 365 },
] as const;

const ABOUT_BLURBS: Record<CoinId, string> = {
  BTC: "Bitcoin is the first and most widely recognized cryptocurrency, created in 2009 by an anonymous person or group using the pseudonym Satoshi Nakamoto. It runs on a decentralized peer-to-peer network with no central issuing authority.",
  ETH: "Ethereum is a decentralized blockchain platform best known for enabling smart contracts and decentralized applications. It launched in 2015, co-founded by Vitalik Buterin.",
  SOL: "Solana is a high-throughput blockchain designed for fast transaction speeds and low fees, commonly used for decentralized applications and NFTs.",
  XRP: "XRP is the native digital asset of the XRP Ledger, a blockchain designed for fast, low-cost cross-border payments, closely associated with the company Ripple.",
  ADA: "Cardano is a blockchain platform built on a peer-reviewed, research-driven approach, using a proof-of-stake consensus mechanism called Ouroboros.",
  DOGE: "Dogecoin began in 2013 as a lighthearted cryptocurrency based on the 'Doge' internet meme, and has since grown into one of the most widely recognized digital currencies by name.",
  BNB: "BNB is the native cryptocurrency of the BNB Chain ecosystem, originally launched by the Binance exchange as a utility token.",
  MATIC: "Polygon is a blockchain platform designed to scale Ethereum with faster, cheaper transactions using layer-2 scaling technology.",
  LTC: "Litecoin was created in 2011 as one of the earliest alternatives to Bitcoin, designed for faster transaction confirmation times.",
  DOT: "Polkadot is a blockchain platform designed to let different blockchains interoperate and share information securely.",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CoinFaq({ coin }: { coin: Coin }) {
  const questions = [
    {
      q: `Is ${coin.name} a good investment?`,
      a: `Cryptocurrency prices, including ${coin.symbol}, can be highly volatile. This page is for informational purposes only and isn't financial advice — consider your own risk tolerance before trading.`,
    },
    {
      q: `How do I buy ${coin.symbol}?`,
      a: `You can buy ${coin.symbol} on the Buy Crypto page, or place a market or limit order for it on the Trade page.`,
    },
    {
      q: `How much is 1 ${coin.symbol} worth today?`,
      a: `${coin.symbol} is currently trading around ${formatUsd(coin.price)}. Prices update based on this app's dummy market data.`,
    },
    {
      q: `Can I sell ${coin.symbol} back to cash?`,
      a: `Yes — use the Sell side of the Buy Crypto page or place a sell order on the Trade page to convert ${coin.symbol} back to your USD balance.`,
    },
    {
      q: `What affects ${coin.name}'s price?`,
      a: `Real cryptocurrency prices are driven by supply and demand, market sentiment, and broader economic conditions. This app uses dummy data for demonstration only.`,
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-8 space-y-3">
      <h3 className="font-semibold text-lg text-[#39079e]">{coin.name} FAQ</h3>
      {questions.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className="rounded-2xl bg-white p-5">
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
              <p className="mt-3 text-sm leading-relaxed text-[#2d2d2d]">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CoinDetailView({ coin }: { coin: Coin }) {
  const [rangeIndex, setRangeIndex] = useState(0);

  const isUp = coin.change24h >= 0;
  const candles = generateCandles(coin.id, coin.price, 24);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  const allTimeHigh = getAllTimeHigh(coin.id, coin.price);

  const change7d = getHistoricalChange(coin.id, "7d");
  const change30d = getHistoricalChange(coin.id, "30d");
  const change1y = getHistoricalChange(coin.id, "1y");

  const recentPrices = [
    { label: "Today", change: coin.change24h },
    { label: "7 days", change: change7d },
    { label: "30 days", change: change30d },
    { label: "1 year", change: change1y },
  ];

  const tradingPairs = getTradingPairs(coin);
  const fxConversions = getFxConversions(coin.price);
  const topPicks = getTopPicks(coin.id, 4);

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-[#929292]">
        <Link href="/markets" className="hover:text-[#39079e]">
          Markets
        </Link>
        <span>/</span>
        <span className="text-[#2d2d2d]">{coin.name} price</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-semibold text-3xl text-[#39079e]">{coin.name}</h1>
            <span className="text-lg text-[#929292]">{coin.symbol}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-[#2d2d2d]">
              {formatUsd(coin.price)}
            </span>
            <span
              className={`text-lg font-semibold ${
                isUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(coin.change24h)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/buy-crypto"
            className="rounded-full bg-[#ffb506] px-8 py-3 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Buy {coin.symbol}
          </Link>
          <Link
            href="/trade"
            className="rounded-full border border-[#39079e] px-8 py-3 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-colors hover:bg-[#39079e] hover:text-white"
          >
            Trade
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-8 overflow-x-auto border-b border-[#e5e5e5]">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="pb-3 text-sm font-semibold whitespace-nowrap text-[#929292] hover:text-[#39079e]"
          >
            {section.label}
          </button>
        ))}
      </div>

      <section id="price" className="mt-6 scroll-mt-6">
        <div className="flex gap-2">
          {TIME_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setRangeIndex(index)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                rangeIndex === index
                  ? "bg-[#39079e] text-white"
                  : "bg-[#f2f2f4] text-[#2a2a2a] hover:bg-[#e5e5e5]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <PriceChart
            coinId={coin.id}
            currentPrice={coin.price}
            candleCount={TIME_RANGES[rangeIndex].count}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-5">
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">Market Cap</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
              {formatCompactUsd(coin.marketCap)}
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">24h Volume</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
              {formatCompactUsd(coin.volume24h)}
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">24h High</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">{formatUsd(high)}</p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">24h Low</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">{formatUsd(low)}</p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">All-Time High</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
              {formatUsd(allTimeHigh)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[20px] bg-white p-6">
          <h2 className="font-semibold text-lg text-[#39079e]">
            {coin.name}&apos;s recent prices
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentPrices.map((row) => {
              const rowIsUp = row.change >= 0;
              return (
                <div key={row.label}>
                  <p className="text-sm text-[#929292]">{row.label}</p>
                  <p
                    className={`mt-1 font-semibold ${
                      rowIsUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPercent(row.change)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="performance" className="mt-10 scroll-mt-6">
        <h2 className="font-semibold text-xl text-[#39079e]">{coin.name} performance</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">{coin.name} price today</p>
            <p className="mt-2 text-2xl font-semibold text-[#2d2d2d]">
              {formatUsd(coin.price)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                isUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(coin.change24h)} (24h)
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">All-time high</p>
            <p className="mt-2 text-2xl font-semibold text-[#2d2d2d]">
              {formatUsd(allTimeHigh)}
            </p>
            <p className="mt-1 text-sm text-[#929292]">Dummy figure for demo purposes.</p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">1-year change</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                change1y >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(change1y)}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 rounded-[20px] bg-[#39079e] px-8 py-10 text-center">
        <h3 className="text-2xl font-semibold text-white">
          Sign up to trade {coin.name} today
        </h3>
        <p className="mt-2 text-white/70">
          Create a free account and start buying {coin.symbol} in minutes.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-[#ffb506] px-8 py-3 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205]"
        >
          Get started
        </Link>
      </div>

      <section id="about" className="mt-10 scroll-mt-6">
        <h2 className="font-semibold text-xl text-[#39079e]">About {coin.name}</h2>
        <div className="mt-4 rounded-[20px] bg-white p-6">
          <p className="max-w-[700px] text-base leading-relaxed text-[#2d2d2d]">
            {ABOUT_BLURBS[coin.id]}
          </p>
        </div>
        <CoinFaq coin={coin} />
      </section>

      <section id="reviews" className="mt-10 scroll-mt-6">
        <h2 className="font-semibold text-xl text-[#39079e]">{coin.name} reviews</h2>
        <p className="mt-4 text-sm text-[#929292]">Coming soon.</p>
      </section>

      <section id="news" className="mt-10 scroll-mt-6">
        <h2 className="font-semibold text-xl text-[#39079e]">{coin.name} in the news</h2>
        <p className="mt-4 text-sm text-[#929292]">Coming soon.</p>
      </section>

      <section id="guides" className="mt-10 scroll-mt-6">
        <h2 className="font-semibold text-xl text-[#39079e]">Guides</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link
            href="/buy-crypto"
            className="rounded-[20px] bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-[#2d2d2d]">How to buy {coin.symbol}</p>
            <p className="mt-2 text-sm text-[#929292]">
              Step-by-step guide to buying {coin.name} with cash.
            </p>
          </Link>
          <Link
            href="/trade"
            className="rounded-[20px] bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-[#2d2d2d]">How to trade {coin.symbol}</p>
            <p className="mt-2 text-sm text-[#929292]">
              Place market and limit orders on the Trade page.
            </p>
          </Link>
          <button
            type="button"
            onClick={() => scrollToSection("price")}
            className="rounded-[20px] bg-white p-6 text-left transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-[#2d2d2d]">{coin.name} price history</p>
            <p className="mt-2 text-sm text-[#929292]">
              Jump back up to the price chart and recent prices.
            </p>
          </button>
        </div>
      </section>

      <div className="mt-10 rounded-[20px] border border-[#39079e]/20 bg-white px-8 py-10 text-center">
        <h3 className="text-2xl font-semibold text-[#39079e]">
          Trade {coin.symbol} in 3 steps
        </h3>
        <ol className="mt-6 grid gap-6 text-left md:grid-cols-3">
          <li>
            <p className="font-semibold text-[#39079e]">1. Create an account</p>
            <p className="mt-1 text-sm text-[#929292]">Sign up in a few clicks.</p>
          </li>
          <li>
            <p className="font-semibold text-[#39079e]">2. Buy {coin.symbol}</p>
            <p className="mt-1 text-sm text-[#929292]">
              Fund your wallet from the Buy Crypto page.
            </p>
          </li>
          <li>
            <p className="font-semibold text-[#39079e]">3. Place a trade</p>
            <p className="mt-1 text-sm text-[#929292]">
              Use the Trade page to buy or sell {coin.symbol}.
            </p>
          </li>
        </ol>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-xl text-[#39079e]">More to explore</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="rounded-[20px] bg-white p-6">
            <p className="font-semibold text-[#2d2d2d]">Trading pairs</p>
            <div className="mt-3 space-y-2">
              {tradingPairs.map((tradingPair) => (
                <div key={tradingPair.pair} className="flex justify-between text-sm">
                  <span className="text-[#929292]">{tradingPair.pair}</span>
                  <span className="font-semibold text-[#2d2d2d]">
                    {formatUsd(tradingPair.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="font-semibold text-[#2d2d2d]">{coin.symbol} in other currencies</p>
            <div className="mt-3 space-y-2">
              {fxConversions.map((conversion) => (
                <div key={conversion.currency} className="flex justify-between text-sm">
                  <span className="text-[#929292]">{conversion.currency}</span>
                  <span className="font-semibold text-[#2d2d2d]">
                    {formatCurrency(conversion.value, conversion.currency)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#929292]">
              Dummy conversion rates for demo purposes.
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="font-semibold text-[#2d2d2d]">Today&apos;s top picks</p>
            <div className="mt-3 space-y-2">
              {topPicks.map((pick) => {
                const pickIsUp = pick.change24h >= 0;
                return (
                  <Link
                    key={pick.id}
                    href={`/markets/${pick.id.toLowerCase()}`}
                    className="flex items-center justify-between text-sm hover:text-[#39079e]"
                  >
                    <span className="text-[#2d2d2d]">{pick.name}</span>
                    <span
                      className={`font-semibold ${
                        pickIsUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercent(pick.change24h)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <p className="mt-10 max-w-[900px] text-xs leading-relaxed text-[#929292]">
        All prices, charts, and figures on this page are simulated demo data
        and do not reflect real market values. Nothing here is financial
        advice.
      </p>
    </div>
  );
}
