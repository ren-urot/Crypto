import PageHeader from "@/components/PageHeader";

export default function BorrowingRulesPage() {
  return (
    <>
      <PageHeader
        title="Spot borrowing rules"
        description="How margin buying power works on this demo platform."
      />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <div className="mx-auto max-w-[700px] rounded-[20px] bg-white p-8">
          <p className="text-base leading-relaxed text-[#2d2d2d]">
            Enabling margin on this demo shows extra buying power (10x your USDT balance) on the
            Trade page order form, so you can see how leverage changes the numbers. It&apos;s a
            display-only simulation — orders you place still settle against your real dummy
            balance, and there&apos;s no borrowing, interest, or liquidation happening behind it.
          </p>
        </div>
      </section>
    </>
  );
}
