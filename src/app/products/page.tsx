import { ArrowLeftRight, Cpu, LineChart, Wallet } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const PRODUCTS = [
  {
    title: "Buy & Sell",
    description:
      "Trade major cryptocurrencies instantly at live market prices, with no hidden fees.",
    icon: ArrowLeftRight,
  },
  {
    title: "Secure Wallet",
    description:
      "Store your assets in a wallet protected by multi-layer encryption and cold storage.",
    icon: Wallet,
  },
  {
    title: "Live Trading",
    description:
      "Track markets in real time and execute trades with professional-grade charting tools.",
    icon: LineChart,
  },
  {
    title: "Cloud Mining",
    description:
      "Mine crypto without hardware. Choose a plan and start earning from any device.",
    icon: Cpu,
  },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Everything you need to buy, store, trade, and mine crypto, all from one platform."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto grid max-w-[1228px] gap-8 md:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.title}
              className="rounded-[40px] bg-white p-10 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f2f2f4]">
                <product.icon className="size-7 text-[#39079e]" />
              </div>
              <h2 className="mt-6 font-semibold text-2xl text-[#39079e]">
                {product.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#2d2d2d]">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
