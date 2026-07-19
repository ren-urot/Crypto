"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  reserveUsd: (amount: number) => TradeResult;
  refundUsd: (amount: number) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);
const STORAGE_KEY = "crypto-demo-wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      setWallet(JSON.parse(stored) as Wallet);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persistWallet(next: Wallet) {
    setWallet(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

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
      persistWallet({
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
    persistWallet({
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

  function reserveUsd(amount: number): TradeResult {
    if (amount > wallet.usd) {
      return {
        ok: false,
        reason: `That would reserve ${formatUsd(amount)}, more than your ${formatUsd(
          wallet.usd,
        )} cash balance.`,
      };
    }
    persistWallet({ ...wallet, usd: wallet.usd - amount });
    return { ok: true, message: `Reserved ${formatUsd(amount)}.` };
  }

  function refundUsd(amount: number) {
    persistWallet({ ...wallet, usd: wallet.usd + amount });
  }

  return (
    <WalletContext.Provider
      value={{ wallet, totalValue: getTotalValue(wallet), onTrade, reserveUsd, refundUsd }}
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
