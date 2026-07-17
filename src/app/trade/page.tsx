import PageHeader from "@/components/PageHeader";
import TradeView from "@/components/trade/TradeView";

export default function TradePage() {
  return (
    <>
      <PageHeader
        title="Trade"
        description="Buy and sell crypto with live-feeling markets, an order book, and full order history, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[1400px]">
          <TradeView />
        </div>
      </section>
    </>
  );
}
