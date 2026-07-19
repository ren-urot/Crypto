"use client";

import { useWallet } from "@/lib/wallet-context";
import WalletSummary from "@/components/dashboard/WalletSummary";
import HoldingsTable from "@/components/dashboard/HoldingsTable";

export default function MyAssetsView() {
  const { wallet, totalValue } = useWallet();

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <WalletSummary wallet={wallet} totalValue={totalValue} />
      <HoldingsTable wallet={wallet} />
    </div>
  );
}
