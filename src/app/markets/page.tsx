import MarketSummaryCards from "@/components/markets/MarketSummaryCards";
import MarketsView from "@/components/markets/MarketsView";

export default function MarketsPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 pt-8 pb-16">
      <div className="mx-auto max-w-[1228px]">
        <MarketSummaryCards />
      </div>
      <div className="mt-8">
        <MarketsView />
      </div>
    </section>
  );
}
