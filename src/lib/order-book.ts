import { createSeededRandom } from "./seeded-random";

export type OrderBookRow = { price: number; amount: number };

export function generateOrderBook(
  coinId: string,
  currentPrice: number,
  depth = 8,
): { bids: OrderBookRow[]; asks: OrderBookRow[] } {
  const random = createSeededRandom(`${coinId}-book`);

  const bids: OrderBookRow[] = [];
  let price = currentPrice;
  for (let i = 0; i < depth; i++) {
    price = price * (1 - random() * 0.002 - 0.0002);
    bids.push({ price, amount: 0.1 + random() * 5 });
  }

  price = currentPrice;
  const asks: OrderBookRow[] = [];
  for (let i = 0; i < depth; i++) {
    price = price * (1 + random() * 0.002 + 0.0002);
    asks.push({ price, amount: 0.1 + random() * 5 });
  }

  return { bids, asks };
}
