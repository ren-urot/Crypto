import { BarChart3, PieChart, ShieldCheck, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    title: "Why you should choose Crypto",
    description:
      "Experience the next generation cryptocurrency platform. No financial borders, extra fees, and fake reviews, just a straightforward way to buy, sell, and hold the assets you care about.",
    icon: ShieldCheck,
  },
  {
    title: "Invest Smart",
    description:
      "Get full statistic information about the behaviour of buyers and sellers. Our analytics surface market trends early, helping you make decisions backed by data instead of guesswork.",
    icon: BarChart3,
  },
  {
    title: "Detailed Statistics",
    description:
      "View all mining related information in realtime, at any point at any location, and decide which polls you want to mine in, with historical performance at a glance.",
    icon: PieChart,
  },
  {
    title: "Grow your profit and track your investment",
    description:
      "Use advanced analytical tools. Clear Trading View charts let you track current and historical profit on every investment, so you always know where you stand.",
    icon: TrendingUp,
  },
];

export default function FeaturesPage() {
  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 pt-16 pb-16">
      <div className="mx-auto flex max-w-[1228px] flex-col gap-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[20px] bg-white p-10 md:p-16"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f2f2f4]">
              <feature.icon className="size-7 text-[#39079e]" />
            </div>
            <h2 className="mt-6 font-semibold text-2xl text-[#39079e]">
              {feature.title}
            </h2>
            <p className="mt-4 max-w-[700px] text-base leading-relaxed text-[#2d2d2d]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
