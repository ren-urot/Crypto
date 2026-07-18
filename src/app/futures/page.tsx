import PageHeader from "@/components/PageHeader";
import FuturesView from "@/components/futures/FuturesView";

export default function FuturesPage() {
  return (
    <>
      <PageHeader
        title="Futures"
        description="Trade perpetual and expiry futures with leverage."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <FuturesView />
      </section>
    </>
  );
}
