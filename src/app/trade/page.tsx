"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MarketList from "@/components/trade/MarketList";
import PriceChart from "@/components/trade/PriceChart";
import { getCoin, type CoinId } from "@/lib/dashboard-data";

export default function TradePage() {
  const [selectedCoinId, setSelectedCoinId] = useState<CoinId>("BTC");
  const coin = getCoin(selectedCoinId);

  return (
    <>
      <PageHeader
        title="Trade"
        description="Buy and sell crypto with live-feeling markets, an order book, and full order history, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[280px_1fr]">
          <MarketList
            selectedCoinId={selectedCoinId}
            onSelect={setSelectedCoinId}
          />
          <PriceChart coinId={selectedCoinId} currentPrice={coin.price} />
        </div>
      </section>
    </>
  );
}
