import { notFound } from "next/navigation";
import Link from "next/link";
import { COINS, formatUsd, formatPercent, formatCompactUsd, type CoinId } from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import PriceChart from "@/components/trade/PriceChart";

export default async function CoinDetailsPage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = await params;
  const coin = COINS.find((c) => c.id === (coinId.toUpperCase() as CoinId));

  if (!coin) {
    notFound();
  }

  const candles = generateCandles(coin.id, coin.price, 24);
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  const isUp = coin.change24h >= 0;

  return (
    <section className="bg-[#f2f2f4] px-9 pt-8 pb-16">
      <div className="mx-auto max-w-[1228px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="font-semibold text-3xl text-[#39079e]">
                {coin.name}
              </h1>
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

        <div className="mt-8">
          <PriceChart coinId={coin.id} currentPrice={coin.price} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
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
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
              {formatUsd(high)}
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <p className="text-sm text-[#929292]">24h Low</p>
            <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
              {formatUsd(low)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
