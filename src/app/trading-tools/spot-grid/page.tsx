import PageHeader from "@/components/PageHeader";
import SpotGridView from "@/components/trading-tools/SpotGridView";

export default function SpotGridPage() {
  return (
    <>
      <PageHeader
        title="Spot grid"
        description="Buy low sell high automatically by trading uptrends and downtrends in a range."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <SpotGridView />
      </section>
    </>
  );
}
