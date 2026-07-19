import PageHeader from "@/components/PageHeader";
import SmartArbitrageView from "@/components/trading-tools/SmartArbitrageView";

export default function SmartArbitragePage() {
  return (
    <>
      <PageHeader
        title="Smart arbitrage"
        description="Easy arbitrage with simple reinvestment and automated smart trades."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <SmartArbitrageView />
      </section>
    </>
  );
}
