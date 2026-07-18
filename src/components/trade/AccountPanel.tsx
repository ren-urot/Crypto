import Link from "next/link";
import { formatUsd, getCoin, type CoinId, type Wallet } from "@/lib/dashboard-data";

export default function AccountPanel({
  wallet,
  totalValue,
  coinId,
}: {
  wallet: Wallet;
  totalValue: number;
  coinId: CoinId;
}) {
  const coin = getCoin(coinId);

  return (
    <div className="rounded-[20px] bg-white p-6">
      <h3 className="font-semibold text-lg text-[#39079e]">Spot Account</h3>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#929292]">Equity</span>
          <span className="font-semibold text-[#2d2d2d]">{formatUsd(totalValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#929292]">In use</span>
          <span className="font-semibold text-[#2d2d2d]">{formatUsd(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#929292]">USDT balance</span>
          <span className="font-semibold text-[#2d2d2d]">{formatUsd(wallet.usd)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#929292]">{coin.symbol} balance</span>
          <span className="font-semibold text-[#2d2d2d]">
            {wallet.holdings[coinId].toFixed(4)} {coin.symbol}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href="/buy-crypto"
          className="flex-1 rounded-full bg-[#39079e] px-4 py-2 text-center text-xs font-semibold text-white uppercase hover:bg-[#2d0680]"
        >
          Deposit
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-full border border-[#e5e5e5] px-4 py-2 text-center text-xs font-semibold text-[#39079e] uppercase hover:bg-[#f2f2f4]"
        >
          Transfer
        </Link>
      </div>

      <Link
        href="/grow"
        className="mt-4 block rounded-2xl bg-[#f2f2f4] p-4 transition-colors hover:bg-[#e9e9ef]"
      >
        <p className="font-semibold text-[#2d2d2d]">Put your crypto to work</p>
        <p className="mt-1 text-sm text-[#929292]">
          Explore ways to grow your idle balance on the Grow page.
        </p>
      </Link>
    </div>
  );
}
