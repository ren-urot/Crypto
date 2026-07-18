import { createSeededRandom } from "./seeded-random";

export function getEventTarget(coinId: string, price: number): number {
  const random = createSeededRandom(`${coinId}-event-target`);
  const pct = 5 + random() * 15;
  return price * (1 + pct / 100);
}

export function getYesPriceCents(coinId: string, price: number, target: number): number {
  const random = createSeededRandom(`${coinId}-event-yes`);
  const gapPct = ((target - price) / price) * 100;
  const base = 60 - gapPct * 2;
  const noise = (random() - 0.5) * 10;
  return Math.round(Math.max(5, Math.min(95, base + noise)));
}
