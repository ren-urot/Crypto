import AssetsTabs from "@/components/assets/AssetsTabs";
import MyAssetsView from "@/components/assets/MyAssetsView";

export default function AssetsPage() {
  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 py-8">
      <div className="mx-auto max-w-[1100px]">
        <AssetsTabs />
      </div>
      <div className="mt-8">
        <MyAssetsView />
      </div>
    </section>
  );
}
