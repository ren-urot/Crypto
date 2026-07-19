import { notFound } from "next/navigation";
import { COINS, type CoinId } from "@/lib/dashboard-data";
import CoinDetailView from "@/components/markets/CoinDetailView";

export default async function CoinDetailsPage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = await params;
  const coin = COINS.find((c) => c.id === (coinId.toUpperCase() as CoinId));

  if (!coin) {
    notFound();
  }

  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 pt-8 pb-16">
      <div className="mx-auto max-w-[1228px]">
        <CoinDetailView coin={coin} />
      </div>
    </section>
  );
}
