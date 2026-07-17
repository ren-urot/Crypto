import Link from "next/link";
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  return (
    <section className="bg-[#f2f2f4]">
      <div className="mx-auto grid max-w-[1520px] items-center gap-12 px-9 py-16 md:grid-cols-2 md:py-24">
        <div className="translate-x-[80px] -translate-y-[100px]">
          <h1 className="font-semibold text-[42px] leading-[1.25] text-[#39079e] uppercase md:text-[56px]">
            Fastest &amp; secure platform to invest in crypto
          </h1>
          <p className="mt-8 max-w-[514px] text-lg leading-relaxed text-[#2d2d2d] md:text-xl">
            Buy and sell cryptocurrencies, trusted by 10M wallets with over
            $30 billion in transactions.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-block rounded-full bg-[#ffb506] px-10 py-5 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>

        <div className="-translate-x-[80px] -translate-y-[40px] animate-float motion-reduce:animate-none">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
