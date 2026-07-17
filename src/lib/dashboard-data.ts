export type CoinId = "BTC" | "ETH" | "SOL";

export type Coin = {
  id: CoinId;
  name: string;
  symbol: CoinId;
  price: number;
};

export const COINS: Coin[] = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 62000 },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3400 },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 145 },
];

export type Wallet = {
  usd: number;
  holdings: Record<CoinId, number>;
};

export const INITIAL_WALLET: Wallet = {
  usd: 10000,
  holdings: {
    BTC: 0.25,
    ETH: 2.5,
    SOL: 40,
  },
};

export function getCoin(id: CoinId): Coin {
  const coin = COINS.find((c) => c.id === id);
  if (!coin) throw new Error(`Unknown coin: ${id}`);
  return coin;
}

export function getTotalValue(wallet: Wallet): number {
  return (
    wallet.usd +
    COINS.reduce(
      (sum, coin) => sum + wallet.holdings[coin.id] * coin.price,
      0,
    )
  );
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
