"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CoinId } from "./dashboard-data";

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

let botCounter = 0;

export function BotsProvider({ children }: { children: ReactNode }) {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Bot[];
      setBots(parsed);
      botCounter = parsed.reduce((max, bot) => Math.max(max, bot.order), 0);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persistBots(next: Bot[]) {
    setBots(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addBot(bot: Omit<Bot, "id" | "order">) {
    botCounter += 1;
    persistBots([{ ...bot, id: `bot-${botCounter}`, order: botCounter }, ...bots]);
  }

  function removeBot(id: string): number {
    const bot = bots.find((b) => b.id === id);
    persistBots(bots.filter((b) => b.id !== id));
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
