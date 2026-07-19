import AssetsTabs from "@/components/assets/AssetsTabs";
import TradingFeesView from "@/components/assets/TradingFeesView";

export default function TradingFeesPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-8">
      <div className="mx-auto max-w-[1100px]">
        <AssetsTabs />
      </div>
      <div className="mt-8">
        <TradingFeesView />
      </div>
    </section>
  );
}
