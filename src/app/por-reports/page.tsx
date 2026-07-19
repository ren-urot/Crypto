import AssetsTabs from "@/components/assets/AssetsTabs";

export default function PorReportsPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-8">
      <div className="mx-auto max-w-[1100px]">
        <AssetsTabs />
      </div>
      <div className="mt-8 mx-auto max-w-[700px] rounded-[20px] bg-white p-8">
        <h2 className="font-semibold text-lg text-[#39079e]">Proof of Reserves</h2>
        <p className="mt-3 text-base leading-relaxed text-[#2d2d2d]">
          This app doesn&apos;t hold any real user funds, so there are no real reserves to audit
          or report on. Every balance, order, and bot you see here is dummy data generated for
          this demo — nothing here should be read as a real financial disclosure.
        </p>
      </div>
    </section>
  );
}
