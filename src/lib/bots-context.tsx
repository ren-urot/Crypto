"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CoinId } from "./dashboard-data";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safe-storage";

export type BotType = "grid" | "arbitrage" | "dca" | "copy";

export type Bot = {
  id: string;
  type: BotType;
  coinId: CoinId;
  investment: number;
  summary: string;
  order: number;
};

type BotsContextValue = {
  bots: Bot[];
  addBot: (bot: Omit<Bot, "id" | "order">) => void;
  removeBot: (id: string) => number;
};

const BotsContext = createContext<BotsContextValue | null>(null);
const STORAGE_KEY = "crypto-demo-bots";

export function BotsProvider({ children }: { children: ReactNode }) {
  const [bots, setBots] = useState<Bot[]>([]);
  const botCounterRef = useRef(0);

  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Bot[];
      setBots(parsed);
      botCounterRef.current = parsed.reduce((max, bot) => Math.max(max, bot.order), 0);
    } catch {
      safeRemoveItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(bots));
  }, [bots]);

  function addBot(bot: Omit<Bot, "id" | "order">) {
    botCounterRef.current += 1;
    const order = botCounterRef.current;
    setBots((current) => [{ ...bot, id: `bot-${order}`, order }, ...current]);
  }

  function removeBot(id: string): number {
    const bot = bots.find((b) => b.id === id);
    setBots((current) => current.filter((b) => b.id !== id));
    return bot?.investment ?? 0;
  }

  return (
    <BotsContext.Provider value={{ bots, addBot, removeBot }}>{children}</BotsContext.Provider>
  );
}

export function useBots(): BotsContextValue {
  const ctx = useContext(BotsContext);
  if (!ctx) {
    throw new Error("useBots must be used within a BotsProvider");
  }
  return ctx;
}
