import { createSeededRandom } from "./seeded-random";
import { generateCandles } from "./candles";
import { COINS, type Coin, type CoinId } from "./dashboard-data";

export type GridBacktestResult = {
  crossings: number;
  estimatedProfit: number;
  estimatedProfitPercent: number;
};

export function backtestGrid(
  coin: Coin,
  lower: number,
  upper: number,
  gridCount: number,
  investment: number,
): GridBacktestResult {
  if (gridCount <= 0 || upper <= lower || investment <= 0) {
    return { crossings: 0, estimatedProfit: 0, estimatedProfitPercent: 0 };
  }

  const candles = generateCandles(coin.id, coin.price, 90);
  const gridSpacing = (upper - lower) / gridCount;
  const perOrderInvestment = investment / gridCount;
  const midPrice = (lower + upper) / 2;

  const lines: number[] = [];
  for (let i = 0; i <= gridCount; i++) lines.push(lower + gridSpacing * i);

  let crossings = 0;
  for (let i = 1; i < candles.length; i++) {
    const prevClose = candles[i - 1].close;
    const close = candles[i].close;
    for (const line of lines) {
      if ((prevClose < line && close >= line) || (prevClose > line && close <= line)) {
        crossings++;
      }
    }
  }

  const profitPerCrossing = perOrderInvestment * (gridSpacing / midPrice);
  const estimatedProfit = crossings * profitPerCrossing * 0.5;
  const estimatedProfitPercent = (estimatedProfit / investment) * 100;

  return { crossings, estimatedProfit, estimatedProfitPercent };
}

export type DcaBacktestResult = {
  ordersTriggered: number;
  totalInvested: number;
  averageEntryPrice: number;
  finalPrice: number;
  profitPercent: number;
};

export function backtestDca(
  coin: Coin,
  baseOrder: number,
  deviationPercent: number,
  multiplier: number,
  maxOrders: number,
): DcaBacktestResult {
  const candles = generateCandles(coin.id, coin.price, 90);

  let lastEntryPrice = candles[0].close;
  let ordersTriggered = 1;
  let totalInvested = baseOrder;
  let totalUnits = baseOrder / lastEntryPrice;
  let nextOrderSize = baseOrder * multiplier;

  for (let i = 1; i < candles.length && ordersTriggered < maxOrders; i++) {
    const close = candles[i].close;
    const dropPercent = ((lastEntryPrice - close) / lastEntryPrice) * 100;
    if (dropPercent >= deviationPercent) {
      totalInvested += nextOrderSize;
      totalUnits += nextOrderSize / close;
      lastEntryPrice = close;
      ordersTriggered++;
      nextOrderSize *= multiplier;
    }
  }

  const averageEntryPrice = totalInvested / totalUnits;
  const finalPrice = candles[candles.length - 1].close;
  const currentValue = totalUnits * finalPrice;
  const profitPercent = ((currentValue - totalInvested) / totalInvested) * 100;

  return { ordersTriggered, totalInvested, averageEntryPrice, finalPrice, profitPercent };
}

export function getArbitrageSpread(coinId: string): number {
  const random = createSeededRandom(`${coinId}-arb-spread`);
  return 0.02 + random() * 0.13;
}

export type DemoTrader = {
  id: string;
  name: string;
  return30d: number;
  followers: number;
  coinId: CoinId;
};

const DEMO_TRADER_LETTERS = ["A", "B", "C", "D"] as const;

export function getDemoTraders(): DemoTrader[] {
  return DEMO_TRADER_LETTERS.map((letter, index) => {
    const coin = COINS[index % COINS.length];
    const random = createSeededRandom(`demo-trader-${letter}`);
    return {
      id: `demo-trader-${letter}`,
      name: `Demo Trader ${letter}`,
      return30d: -10 + random() * 60,
      followers: Math.floor(50 + random() * 5000),
      coinId: coin.id,
    };
  });
}
