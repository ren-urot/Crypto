import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";

const TOOLS: Record<string, { title: string; description: string }> = {
  "spot-grid": {
    title: "Spot grid",
    description: "Buy low, sell high automatically by trading uptrends and downtrends in a range.",
  },
  "smart-arbitrage": {
    title: "Smart arbitrage",
    description: "Easy arbitrage with simple reinvestment and automated smart trades.",
  },
  "spot-dca": {
    title: "Spot DCA (Martingale)",
    description:
      "Dollar-cost average into a position, triggered by indicators, for volatile markets over medium and long terms.",
  },
  "spot-copy-trading": {
    title: "Spot copy trading",
    description: "Reap high returns by copying trades from a community of top traders.",
  },
};

export default async function TradingToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const entry = TOOLS[tool];

  if (!entry) {
    notFound();
  }

  return (
    <>
      <PageHeader title={entry.title} description={entry.description} />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <p className="text-[#929292]">Coming soon.</p>
      </section>
    </>
  );
}
