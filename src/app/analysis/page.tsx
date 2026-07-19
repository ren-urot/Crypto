import AssetsTabs from "@/components/assets/AssetsTabs";
import AnalysisView from "@/components/assets/AnalysisView";

export default function AnalysisPage() {
  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 py-8">
      <div className="mx-auto max-w-[1100px]">
        <AssetsTabs />
      </div>
      <div className="mt-8">
        <AnalysisView />
      </div>
    </section>
  );
}
