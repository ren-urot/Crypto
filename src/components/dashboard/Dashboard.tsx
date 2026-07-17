"use client";

import { useWallet } from "@/lib/wallet-context";
import WalletSummary from "./WalletSummary";
import HoldingsTable from "./HoldingsTable";
import TradePanel from "./TradePanel";

export default function Dashboard() {
  const { wallet, totalValue, onTrade } = useWallet();

  return (
    <div className="space-y-8">
      <WalletSummary wallet={wallet} totalValue={totalValue} />
      <HoldingsTable wallet={wallet} />
      <TradePanel onTrade={onTrade} />
    </div>
  );
}
