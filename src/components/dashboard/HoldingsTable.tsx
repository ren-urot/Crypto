import { COINS, formatUsd, type Wallet } from "@/lib/dashboard-data";

export default function HoldingsTable({ wallet }: { wallet: Wallet }) {
  return (
    <div className="overflow-x-auto rounded-[40px] bg-white p-8 md:p-10">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-[#929292]">
            <th className="pb-4 font-medium">Asset</th>
            <th className="pb-4 font-medium">Quantity</th>
            <th className="pb-4 font-medium">Price</th>
            <th className="pb-4 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {COINS.map((coin) => (
            <tr key={coin.id} className="border-t border-[#e5e5e5]">
              <td className="py-4 font-semibold text-[#39079e]">
                {coin.name}
              </td>
              <td className="py-4 text-[#2d2d2d]">
                {wallet.holdings[coin.id]} {coin.symbol}
              </td>
              <td className="py-4 text-[#2d2d2d]">{formatUsd(coin.price)}</td>
              <td className="py-4 text-[#2d2d2d]">
                {formatUsd(wallet.holdings[coin.id] * coin.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
