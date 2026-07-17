import { COINS, formatUsd, type Wallet } from "@/lib/dashboard-data";

export default function WalletSummary({
  wallet,
  totalValue,
}: {
  wallet: Wallet;
  totalValue: number;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className="rounded-[20px] bg-white p-8">
        <p className="text-sm text-[#2d2d2d]">Total Balance</p>
        <p className="mt-2 font-semibold text-3xl text-[#39079e]">
          {formatUsd(totalValue)}
        </p>
      </div>

      {COINS.map((coin) => (
        <div key={coin.id} className="rounded-[20px] bg-white p-8">
          <p className="text-sm text-[#2d2d2d]">{coin.name}</p>
          <p className="mt-2 font-semibold text-2xl text-[#39079e]">
            {wallet.holdings[coin.id]} {coin.symbol}
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            {formatUsd(wallet.holdings[coin.id] * coin.price)}
          </p>
        </div>
      ))}
    </div>
  );
}
