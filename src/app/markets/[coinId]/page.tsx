import { notFound } from "next/navigation";
import { COINS, type CoinId } from "@/lib/dashboard-data";

export default async function CoinDetailsPage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = await params;
  const coin = COINS.find(
    (c) => c.id === (coinId.toUpperCase() as CoinId),
  );

  if (!coin) {
    notFound();
  }

  return (
    <section className="bg-[#f2f2f4] px-9 pt-8 pb-16">
      <div className="mx-auto max-w-[1228px]">
        <p className="text-[#929292]">
          Detailed {coin.name} ({coin.symbol}) data coming soon.
        </p>
      </div>
    </section>
  );
}
