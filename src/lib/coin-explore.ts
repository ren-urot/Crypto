import { COINS, type Coin, type CoinId } from "./dashboard-data";

export type TradingPair = {
  pair: string;
  price: number;
};

export function getTradingPairs(coin: Coin): TradingPair[] {
  return [
    { pair: `${coin.symbol}/USDT`, price: coin.price },
    { pair: `${coin.symbol}/USDC`, price: coin.price * 0.9998 },
  ];
}

const FX_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.3,
};

export function getFxConversions(usdPrice: number) {
  return Object.entries(FX_RATES).map(([currency, rate]) => ({
    currency,
    value: usdPrice * rate,
  }));
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getTopPicks(excludeId: CoinId, count = 4): Coin[] {
  return COINS.filter((coin) => coin.id !== excludeId).slice(0, count);
}
