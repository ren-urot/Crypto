import AboutIllustration from "@/components/AboutIllustration";

const STATS = [
  { label: "Wallets trusted", value: "10M+" },
  { label: "Transactions processed", value: "$30B+" },
  { label: "Founded", value: "2019" },
  { label: "Countries served", value: "40+" },
];

export default function AboutPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 pt-16 pb-16">
      <div className="mx-auto max-w-[1228px] space-y-10">
        <div className="grid items-center gap-10 rounded-[20px] bg-white p-10 md:grid-cols-2 md:p-16">
          <p className="max-w-[700px] text-base leading-relaxed text-[#2d2d2d] md:text-lg">
            Crypto started with a simple idea: trading digital assets
            shouldn&apos;t require a finance degree or a tolerance for
            hidden fees. Since launch, we&apos;ve built a platform that
            pairs bank-grade security with an interface anyone can use,
            from a first-time buyer to a full-time trader.
          </p>

          <AboutIllustration />
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[20px] bg-white p-8 text-center transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <p className="font-semibold text-3xl text-[#39079e]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[#2d2d2d]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
