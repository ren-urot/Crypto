import { createSeededRandom } from "./seeded-random";

export type RecentTrade = {
  price: number;
  amount: number;
  side: "buy" | "sell";
  secondsAgo: number;
};

export function getRecentTrades(
  coinId: string,
  currentPrice: number,
  count = 20,
): RecentTrade[] {
  const random = createSeededRandom(`${coinId}-recent-trades`);

  const trades: RecentTrade[] = [];
  let price = currentPrice;
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = random() > 0.5 ? "buy" : "sell";
    price = price * (1 + (random() - 0.5) * 0.0006);
    trades.push({
      price,
      amount: 0.001 + random() * 0.3,
      side,
      secondsAgo: i * (2 + Math.floor(random() * 6)),
    });
  }
  return trades;
}
