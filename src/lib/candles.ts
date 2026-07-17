import { createSeededRandom } from "./seeded-random";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Fixed reference timestamp (2026-07-17T00:00:00Z), NOT Date.now() — the
// series must render identically on the server and after client hydration.
const REFERENCE_TIME = Math.floor(
  new Date("2026-07-17T00:00:00Z").getTime() / 1000,
);
const HOUR_SECONDS = 3600;

export function generateCandles(
  coinId: string,
  currentPrice: number,
  count = 60,
): Candle[] {
  const random = createSeededRandom(coinId);

  const rawCloses: number[] = [1];
  for (let i = 1; i < count; i++) {
    const changePercent = (random() - 0.5) * 0.04;
    rawCloses.push(rawCloses[i - 1] * (1 + changePercent));
  }
  const scale = currentPrice / rawCloses[rawCloses.length - 1];

  const candles: Candle[] = [];
  const prevClose = rawCloses[0] * scale * (1 + (random() - 0.5) * 0.02);
  for (let i = 0; i < count; i++) {
    const close = rawCloses[i] * scale;
    const open = i === 0 ? prevClose : candles[i - 1].close;
    const high = Math.max(open, close) * (1 + random() * 0.008);
    const low = Math.min(open, close) * (1 - random() * 0.008);
    candles.push({
      time: REFERENCE_TIME - (count - 1 - i) * HOUR_SECONDS,
      open,
      high,
      low,
      close,
    });
  }
  return candles;
}
