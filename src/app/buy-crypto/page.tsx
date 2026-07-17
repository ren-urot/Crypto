import PageHeader from "@/components/PageHeader";
import BuyCryptoView from "@/components/buy-crypto/BuyCryptoView";

export default function BuyCryptoPage() {
  return (
    <>
      <PageHeader
        title="Buy crypto in a few steps"
        description="Bitcoin, Ethereum, Solana, and more popular crypto."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <BuyCryptoView />
      </section>
    </>
  );
}
