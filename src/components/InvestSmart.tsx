import Link from "next/link";
import InvestSmartIllustration from "./InvestSmartIllustration";

export default function InvestSmart() {
  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 py-10">
      <div className="mx-auto grid max-w-[1228px] md:-translate-y-[80px] items-center gap-10 rounded-[40px] bg-white p-10 md:grid-cols-2 md:p-16">
        <div>
          <h2 className="font-semibold text-[30px] text-[#39079e]">
            Invest Smart
          </h2>
          <p className="mt-6 max-w-[385px] text-base leading-relaxed text-[#2d2d2d]">
            Get full statistic information about the behaviour of buyers and
            sellers will help you to make the decision.
          </p>
          <Link
            href="/features"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </Link>
        </div>

        <InvestSmartIllustration />
      </div>
    </section>
  );
}
