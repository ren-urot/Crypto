import PageHeader from "@/components/PageHeader";
import SpotCopyTradingView from "@/components/trading-tools/SpotCopyTradingView";

export default function SpotCopyTradingPage() {
  return (
    <>
      <PageHeader
        title="Spot copy trading"
        description="Reap high returns with a community of top traders."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <SpotCopyTradingView />
      </section>
    </>
  );
}
