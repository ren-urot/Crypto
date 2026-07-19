import PageHeader from "@/components/PageHeader";
import SpotDcaView from "@/components/trading-tools/SpotDcaView";

export default function SpotDcaPage() {
  return (
    <>
      <PageHeader
        title="Spot DCA (Martingale)"
        description="Triggered by indicators, for volatile markets, medium and long terms."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <SpotDcaView />
      </section>
    </>
  );
}
