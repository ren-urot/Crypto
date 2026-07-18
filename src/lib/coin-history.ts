import { createSeededRandom } from "./seeded-random";

export type HistoricalPeriod = "7d" | "30d" | "1y";

const HISTORICAL_RANGES: Record<HistoricalPeriod, [number, number]> = {
  "7d": [-15, 15],
  "30d": [-30, 30],
  "1y": [-50, 120],
};

export function getHistoricalChange(
  coinId: string,
  period: HistoricalPeriod,
): number {
  const random = createSeededRandom(`${coinId}-change-${period}`);
  const [min, max] = HISTORICAL_RANGES[period];
  return min + random() * (max - min);
}

export function getAllTimeHigh(coinId: string, currentPrice: number): number {
  const random = createSeededRandom(`${coinId}-ath`);
  const multiplier = 1.3 + random() * 2.7;
  return currentPrice * multiplier;
}
