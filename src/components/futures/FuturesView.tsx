import Link from "next/link";
import { COINS, formatUsd, formatPercent, formatCompactUsd } from "@/lib/dashboard-data";
import { getFundingRate, getOpenInterest } from "@/lib/futures-data";

export default function FuturesView() {
  const contracts = [...COINS].sort((a, b) => b.volume24h - a.volume24h);

  return (
    <div>
      <div className="overflow-x-auto rounded-[20px] bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs text-[#929292] uppercase">
              <th className="px-6 py-4">Contract</th>
              <th className="px-4 py-4">Mark Price</th>
              <th className="px-4 py-4">24h Change</th>
              <th className="px-4 py-4">Funding Rate</th>
              <th className="px-4 py-4">Open Interest</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((coin) => {
              const isUp = coin.change24h >= 0;
              const fundingRate = getFundingRate(coin.id);
              const openInterest = getOpenInterest(coin.id, coin.volume24h);
              return (
                <tr key={coin.id} className="border-b border-[#f2f2f4] last:border-0">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#39079e]">{coin.symbol}-PERP</span>
                    <span className="ml-2 text-sm text-[#929292]">{coin.name}</span>
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatUsd(coin.price)}</td>
                  <td className={`px-4 py-4 font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(coin.change24h)}
                  </td>
                  <td className={`px-4 py-4 ${fundingRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fundingRate >= 0 ? "+" : ""}
                    {fundingRate.toFixed(4)}%
                  </td>
                  <td className="px-4 py-4 text-[#2d2d2d]">{formatCompactUsd(openInterest)}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href="/trade"
                      className="rounded-full border border-[#39079e] px-4 py-1.5 text-xs font-semibold text-[#39079e] uppercase hover:bg-[#39079e] hover:text-white"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-[#929292]">
        Futures contracts settle through your Spot balance using the Margin toggle on the Trade
        page. Mark prices, funding rates, and open interest are simulated demo figures.
      </p>
    </div>
  );
}
