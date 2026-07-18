import PageHeader from "@/components/PageHeader";
import DexSwapView from "@/components/dex/DexSwapView";

export default function DexPage() {
  return (
    <>
      <PageHeader
        title="DEX"
        description="Trade on-chain tokens using your Exchange balance."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <DexSwapView />
      </section>
    </>
  );
}
