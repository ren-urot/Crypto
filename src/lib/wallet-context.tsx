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
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safe-storage";

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
  swapCoins: (
    fromId: CoinId,
    toId: CoinId,
    fromAmount: number,
    toAmount: number,
  ) => TradeResult;
};

const WalletContext = createContext<WalletContextValue | null>(null);
const STORAGE_KEY = "crypto-demo-wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);

  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (!stored) return;
    try {
      setWallet(JSON.parse(stored) as Wallet);
    } catch {
      safeRemoveItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(wallet));
  }, [wallet]);

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
      setWallet((current) => ({
        usd: current.usd + cost,
        holdings: {
          ...current.holdings,
          [coinId]: current.holdings[coinId] - amount,
        },
      }));
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
    setWallet((current) => ({
      usd: current.usd - cost,
      holdings: {
        ...current.holdings,
        [coinId]: current.holdings[coinId] + amount,
      },
    }));
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
    setWallet((current) => ({ ...current, usd: current.usd - amount }));
    return { ok: true, message: `Reserved ${formatUsd(amount)}.` };
  }

  function refundUsd(amount: number) {
    setWallet((current) => ({ ...current, usd: current.usd + amount }));
  }

  // Dedicated atomic primitive for coin-to-coin swaps (DEX-style): both legs
  // are applied in a single functional update against one snapshot, so this
  // can't be corrupted the way two sequential onTrade("sell")/onTrade("buy")
  // calls would be (each of those validates and commits against whatever
  // `wallet` closure was captured when the handler started, so the second
  // call would silently overwrite the first's effect on `usd`/`holdings`).
  function swapCoins(
    fromId: CoinId,
    toId: CoinId,
    fromAmount: number,
    toAmount: number,
  ): TradeResult {
    const fromCoin = COINS.find((c) => c.id === fromId)!;
    const toCoin = COINS.find((c) => c.id === toId)!;

    if (fromAmount > wallet.holdings[fromId]) {
      return {
        ok: false,
        reason: `You only have ${wallet.holdings[fromId]} ${fromCoin.symbol}.`,
      };
    }

    setWallet((current) => ({
      usd: current.usd,
      holdings: {
        ...current.holdings,
        [fromId]: current.holdings[fromId] - fromAmount,
        [toId]: current.holdings[toId] + toAmount,
      },
    }));

    return {
      ok: true,
      message: `Swapped ${fromAmount} ${fromCoin.symbol} for ${toAmount.toFixed(6)} ${toCoin.symbol}.`,
    };
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        totalValue: getTotalValue(wallet),
        onTrade,
        reserveUsd,
        refundUsd,
        swapCoins,
      }}
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
