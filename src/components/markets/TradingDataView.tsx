import Link from "next/link";
import { COINS, formatUsd, formatPercent, formatCompactUsd } from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import Sparkline from "./Sparkline";

export default function TradingDataView() {
  const totalMarketCap = COINS.reduce((sum, coin) => sum + coin.marketCap, 0);
  const totalVolume = COINS.reduce((sum, coin) => sum + coin.volume24h, 0);
  const btc = COINS.find((coin) => coin.id === "BTC")!;
  const btcDominance = (btc.marketCap / totalMarketCap) * 100;
  const marketChange =
    COINS.reduce((sum, coin) => sum + coin.change24h * coin.marketCap, 0) / totalMarketCap;

  const gainers = COINS.filter((coin) => coin.change24h >= 0);
  const losers = COINS.filter((coin) => coin.change24h < 0);
  const gainerPercent = (gainers.length / COINS.length) * 100;

  const byVolume = [...COINS].sort((a, b) => b.volume24h - a.volume24h);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">Total Market Cap</p>
          <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
            {formatCompactUsd(totalMarketCap)}
          </p>
          <p className={`mt-1 text-sm font-semibold ${marketChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(marketChange)}
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">24h Volume</p>
          <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
            {formatCompactUsd(totalVolume)}
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">BTC Dominance</p>
          <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">{btcDominance.toFixed(1)}%</p>
        </div>
        <div className="rounded-[20px] bg-white p-6">
          <p className="text-sm text-[#929292]">Gainers / Losers</p>
          <p className="mt-1 text-xl font-semibold text-[#2d2d2d]">
            {gainers.length} / {losers.length}
          </p>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full">
            <div className="bg-green-500" style={{ width: `${gainerPercent}%` }} />
            <div className="bg-red-500" style={{ width: `${100 - gainerPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[20px] bg-white">
        <p className="px-6 pt-6 font-semibold text-lg text-[#39079e]">Volume leaderboard</p>
        <table className="mt-2 w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs text-[#929292] uppercase">
              <th className="px-6 py-4">#</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">24h Change</th>
              <th className="px-4 py-4">24h Volume</th>
              <th className="px-4 py-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {byVolume.map((coin, index) => {
              const isUp = coin.change24h >= 0;
              const sparklineValues = generateCandles(coin.id, coin.price, 24).map(
                (candle) => candle.close,
              );
              return (
                <tr key={coin.id} className="border-b border-[#f2f2f4] last:border-0">
                  <td className="px-6 py-4 text-[#929292]">{index + 1}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/markets/${coin.id.toLowerCase()}`}
                      className="font-semibold text-[#39079e] hover:underline"
                    >
                      {coin.symbol}
                    </Link>
                    <span className="ml-2 text-sm text-[#929292]">{coin.name}</span>
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatUsd(coin.price)}</td>
                  <td className={`px-4 py-4 font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(coin.change24h)}
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatCompactUsd(coin.volume24h)}</td>
                  <td className="px-4 py-4">
                    <div className="w-24">
                      <Sparkline values={sparklineValues} color={isUp ? "#16a34a" : "#dc2626"} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-[#929292]">
        All figures are derived from this app&apos;s dummy spot market data for demo purposes.
      </p>
    </div>
  );
}
