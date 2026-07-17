import WhyChooseIllustration from "./WhyChooseIllustration";

export default function WhyChoose() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <div className="mx-auto grid max-w-[1228px] -translate-y-[60px] items-center gap-10 rounded-[40px] bg-white px-10 py-0 md:grid-cols-2 md:px-16 md:py-6">
        <div>
          <h2 className="font-semibold text-[33px] leading-[1.2] text-[#39079e] md:text-[40px]">
            Why you should
            <br />
            choose Crypto
          </h2>
          <p className="mt-6 max-w-[480px] text-base leading-relaxed text-[#2d2d2d] md:text-lg">
            Experience the next generation cryptocurrency platform. No
            financial borders, extra fees, and fake reviews.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-[#ffb506] px-8 py-4 text-xs font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg"
          >
            Learn More
          </a>
        </div>

        <WhyChooseIllustration />
      </div>
    </section>
  );
}
