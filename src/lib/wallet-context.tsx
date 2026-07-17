"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  COINS,
  INITIAL_WALLET,
  formatUsd,
  getTotalValue,
  type CoinId,
  type Wallet,
} from "./dashboard-data";

type TradeResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

type WalletContextValue = {
  wallet: Wallet;
  totalValue: number;
  onTrade: (
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ) => TradeResult;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  function onTrade(
    coinId: CoinId,
    side: "buy" | "sell",
    amount: number,
  ): TradeResult {
    const coin = COINS.find((c) => c.id === coinId)!;
    const cost = amount * coin.price;

    if (side === "sell") {
      if (amount > wallet.holdings[coinId]) {
        return {
          ok: false,
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
        ok: true,
        message: `Sold ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
      };
    }

    if (cost > wallet.usd) {
      return {
        ok: false,
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
      ok: true,
      message: `Bought ${amount} ${coin.symbol} for ${formatUsd(cost)}.`,
    };
  }

  return (
    <WalletContext.Provider
      value={{ wallet, totalValue: getTotalValue(wallet), onTrade }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
