import { createSeededRandom } from "./seeded-random";

export function getFundingRate(coinId: string): number {
  const random = createSeededRandom(`${coinId}-funding-rate`);
  return -0.05 + random() * 0.1;
}

export function getOpenInterest(coinId: string, volume24h: number): number {
  const random = createSeededRandom(`${coinId}-open-interest`);
  return volume24h * (0.3 + random() * 0.9);
}
