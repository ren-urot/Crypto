import GrowProfitIllustration from "./GrowProfitIllustration";

export default function GrowProfit() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <div className="mx-auto grid max-w-[1228px] items-center gap-10 rounded-[40px] bg-white p-10 md:h-[385px] md:grid-cols-2 md:grid-rows-[257px] md:p-16">
        <div>
          <h2 className="font-semibold text-[30px] leading-tight text-[#39079e]">
            Grow your profit and track
            <br />
            your investment
          </h2>
          <p className="mt-6 max-w-[412px] text-base leading-relaxed text-[#2d2d2d]">
            Use advanced analytical tools. Clear Trading View charts let you
            track current and historical profit investments.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205]"
          >
            Learn More
          </a>
        </div>

        <GrowProfitIllustration />
      </div>
    </section>
  );
}
