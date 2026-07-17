"use client";

import { useState } from "react";
import {
  COINS,
  INITIAL_WALLET,
  formatUsd,
  getTotalValue,
  type CoinId,
  type Wallet,
} from "@/lib/dashboard-data";
import WalletSummary from "./WalletSummary";
import HoldingsTable from "./HoldingsTable";
import TradePanel from "./TradePanel";

export default function Dashboard() {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  function onTrade(coinId: CoinId, side: "buy" | "sell", amount: number) {
    const coin = COINS.find((c) => c.id === coinId)!;
    const cost = amount * coin.price;

    if (side === "sell") {
      if (amount > wallet.holdings[coinId]) {
        return {
          ok: false as const,
          reason: `You only have ${wallet.holdings[coinId]} ${coin.symbol}.`,
        };
      }
      setWallet({
        usd: wallet.usd + cost,
        holdings: {
          ...wallet.holdings,
          [coinId]: wallet.holdings[coinId] - amount,
        },
      });
      return {
        ok: true as const,
        message: `Sold ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
      };
    }

    if (cost > wallet.usd) {
      return {
        ok: false as const,
        reason: `That would cost ${formatUsd(cost)}, more than your ${formatUsd(
          wallet.usd,
        )} cash balance.`,
      };
    }
    setWallet({
      usd: wallet.usd - cost,
      holdings: {
        ...wallet.holdings,
        [coinId]: wallet.holdings[coinId] + amount,
      },
    });
    return {
      ok: true as const,
      message: `Bought ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
    };
  }

  return (
    <div className="space-y-8">
      <WalletSummary wallet={wallet} totalValue={getTotalValue(wallet)} />
      <HoldingsTable wallet={wallet} />
      <TradePanel onTrade={onTrade} />
    </div>
  );
}
