import PageHeader from "@/components/PageHeader";
import CryptoCalculatorView from "@/components/CryptoCalculatorView";

export default function CryptoCalculatorPage() {
  return (
    <>
      <PageHeader
        title="Crypto calculator"
        description="Check conversion rates and crypto values using this app's dummy prices."
      />
      <section className="bg-[#f2f2f4] px-4 md:px-9 py-16">
        <CryptoCalculatorView />
      </section>
    </>
  );
}
