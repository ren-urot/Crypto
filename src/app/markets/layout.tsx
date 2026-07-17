import MarketsTabs from "@/components/markets/MarketsTabs";

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="bg-[#f2f2f4] px-9 pt-10">
        <div className="mx-auto max-w-[1228px]">
          <MarketsTabs />
        </div>
      </section>
      {children}
    </div>
  );
}
