import PageHeader from "@/components/PageHeader";

const FEATURES = [
  {
    title: "Why you should choose Crypto",
    description:
      "Experience the next generation cryptocurrency platform. No financial borders, extra fees, and fake reviews — just a straightforward way to buy, sell, and hold the assets you care about.",
  },
  {
    title: "Invest Smart",
    description:
      "Get full statistic information about the behaviour of buyers and sellers. Our analytics surface market trends early, helping you make decisions backed by data instead of guesswork.",
  },
  {
    title: "Detailed Statistics",
    description:
      "View all mining related information in realtime, at any point at any location, and decide which polls you want to mine in — with historical performance at a glance.",
  },
  {
    title: "Grow your profit and track your investment",
    description:
      "Use advanced analytical tools. Clear Trading View charts let you track current and historical profit on every investment, so you always know where you stand.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        title="Features"
        description="The tools that make Crypto the fastest and most secure way to manage your portfolio."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto flex max-w-[1228px] flex-col gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[40px] bg-white p-10 md:p-16"
            >
              <h2 className="font-semibold text-2xl text-[#39079e]">
                {feature.title}
              </h2>
              <p className="mt-4 max-w-[700px] text-base leading-relaxed text-[#2d2d2d]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
