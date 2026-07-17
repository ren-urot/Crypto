export type CoinId =
  | "BTC"
  | "ETH"
  | "SOL"
  | "XRP"
  | "ADA"
  | "DOGE"
  | "BNB"
  | "MATIC"
  | "LTC"
  | "DOT";

export type Coin = {
  id: CoinId;
  name: string;
  symbol: CoinId;
  price: number;
  change24h: number;
  volume24h: number;
};

export const COINS: Coin[] = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 62000, change24h: 2.34, volume24h: 28_500_000_000 },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3400, change24h: -1.12, volume24h: 12_300_000_000 },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 145, change24h: 5.67, volume24h: 3_800_000_000 },
  { id: "XRP", name: "XRP", symbol: "XRP", price: 0.62, change24h: 3.1, volume24h: 1_900_000_000 },
  { id: "ADA", name: "Cardano", symbol: "ADA", price: 0.45, change24h: -0.85, volume24h: 620_000_000 },
  { id: "DOGE", name: "Dogecoin", symbol: "DOGE", price: 0.15, change24h: 8.9, volume24h: 1_400_000_000 },
  { id: "BNB", name: "BNB", symbol: "BNB", price: 590, change24h: 0.45, volume24h: 1_100_000_000 },
  { id: "MATIC", name: "Polygon", symbol: "MATIC", price: 0.55, change24h: -2.2, volume24h: 340_000_000 },
  { id: "LTC", name: "Litecoin", symbol: "LTC", price: 95, change24h: 1.05, volume24h: 480_000_000 },
  { id: "DOT", name: "Polkadot", symbol: "DOT", price: 6.8, change24h: -0.3, volume24h: 210_000_000 },
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
    XRP: 0,
    ADA: 0,
    DOGE: 0,
    BNB: 0,
    MATIC: 0,
    LTC: 0,
    DOT: 0,
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

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
