import DetailedStatsIllustration from "./DetailedStatsIllustration";

export default function DetailedStats() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <div className="-mt-[70px] mx-auto grid max-w-[1228px] items-center gap-10 rounded-[40px] bg-white p-10 md:h-[385px] md:grid-cols-2 md:grid-rows-[257px] md:p-16">
        <DetailedStatsIllustration />

        <div>
          <h2 className="font-semibold text-[30px] text-[#39079e]">
            Detailed Statistics
          </h2>
          <p className="mt-6 max-w-[374px] text-base leading-relaxed text-[#2d2d2d]">
            View all mining related information in realtime, at any point at
            any location and decide which polls you want to mine in.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
