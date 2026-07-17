import Link from "next/link";
import {
  COINS,
  formatUsd,
  formatPercent,
  formatCompactUsd,
} from "@/lib/dashboard-data";
import { generateCandles } from "@/lib/candles";
import Sparkline from "./Sparkline";

const NEW_LISTINGS = [
  { symbol: "NOVA", name: "Nova Chain", price: 4.82, change24h: 12.4 },
  { symbol: "PULSE", name: "Pulse Network", price: 0.087, change24h: -3.6 },
  { symbol: "ORBIT", name: "Orbit Protocol", price: 61.3, change24h: 7.1 },
];

export default function MarketSummaryCards() {
  const hotCrypto = [...COINS]
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 3);

  const totalMarketCap = COINS.reduce((sum, coin) => sum + coin.marketCap, 0);
  const totalVolume = COINS.reduce((sum, coin) => sum + coin.volume24h, 0);
  const btc = COINS.find((coin) => coin.id === "BTC")!;
  const btcDominance = (btc.marketCap / totalMarketCap) * 100;
  const marketChange =
    COINS.reduce((sum, coin) => sum + coin.change24h * coin.marketCap, 0) /
    totalMarketCap;
  const marketSparkline = generateCandles(
    "MARKET-INDEX",
    totalMarketCap,
    24,
  ).map((candle) => candle.close);

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="rounded-[20px] bg-white p-6">
        <h3 className="font-semibold text-[#39079e]">Hot crypto</h3>
        <div className="mt-4 space-y-3">
          {hotCrypto.map((coin) => (
            <Link
              key={coin.id}
              href="/trade"
              className="flex items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-[#f2f2f4]"
            >
              <span className="font-semibold text-[#2d2d2d]">
                {coin.symbol}
              </span>
              <span className="text-right text-sm">
                <span className="text-[#2d2d2d]">
                  {formatUsd(coin.price)}
                </span>{" "}
                <span
                  className={
                    coin.change24h >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatPercent(coin.change24h)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-6">
        <h3 className="font-semibold text-[#39079e]">New listings</h3>
        <div className="mt-4 space-y-3">
          {NEW_LISTINGS.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center justify-between px-2 py-1"
            >
              <span className="font-semibold text-[#2d2d2d]">
                {coin.symbol}
              </span>
              <span className="text-right text-sm">
                <span className="text-[#2d2d2d]">
                  {formatUsd(coin.price)}
                </span>{" "}
                <span
                  className={
                    coin.change24h >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatPercent(coin.change24h)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-6 md:col-span-2">
        <h3 className="font-semibold text-[#39079e]">Macro data</h3>
        <div className="mt-4 flex items-baseline justify-between text-sm">
          <div>
            <p className="text-[#929292]">Market cap</p>
            <p className="text-[#2d2d2d]">
              {formatCompactUsd(totalMarketCap)}{" "}
              <span
                className={
                  marketChange >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {formatPercent(marketChange)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[#929292]">Volume</p>
            <p className="text-[#2d2d2d]">{formatCompactUsd(totalVolume)}</p>
          </div>
          <div>
            <p className="text-[#929292]">BTC dominance</p>
            <p className="text-[#2d2d2d]">{btcDominance.toFixed(1)}%</p>
          </div>
        </div>
        <div className="mt-4">
          <Sparkline
            values={marketSparkline}
            color={marketChange >= 0 ? "#16a34a" : "#dc2626"}
          />
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-6">
        <h3 className="font-semibold text-[#39079e]">BTC ETF flows</h3>
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p className="text-[#929292]">Daily net</p>
            <p className="font-semibold text-green-600">+$15.00M</p>
          </div>
          <div>
            <p className="text-[#929292]">Last 30D</p>
            <p className="font-semibold text-red-600">-$396.10M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
