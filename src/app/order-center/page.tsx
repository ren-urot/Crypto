import AssetsTabs from "@/components/assets/AssetsTabs";
import OrderCenterView from "@/components/assets/OrderCenterView";

export default function OrderCenterPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-8">
      <div className="mx-auto max-w-[1100px]">
        <AssetsTabs />
      </div>
      <div className="mt-8">
        <OrderCenterView />
      </div>
    </section>
  );
}
