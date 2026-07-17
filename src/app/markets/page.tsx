import PageHeader from "@/components/PageHeader";
import MarketsView from "@/components/markets/MarketsView";

export default function MarketsPage() {
  return (
    <>
      <PageHeader
        title="Markets"
        description="Live-feeling prices, 24h change, and market cap across every asset on Crypto, all with dummy data."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <MarketsView />
      </section>
    </>
  );
}
