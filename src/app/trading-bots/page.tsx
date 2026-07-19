import PageHeader from "@/components/PageHeader";
import MyBotsView from "@/components/trading-tools/MyBotsView";

export default function TradingBotsPage() {
  return (
    <>
      <PageHeader
        title="Trading bots"
        description="Multiple strategies to help you trade with ease."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <MyBotsView />
      </section>
    </>
  );
}
