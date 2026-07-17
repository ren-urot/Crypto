export default function StartMining() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-10">
      <div className="mx-auto flex max-w-[1228px] flex-col items-start gap-8 rounded-[40px] bg-white p-10 md:flex-row md:items-center md:justify-between md:p-16">
        <div>
          <h2 className="font-semibold text-2xl text-[#39079e]">
            Start mining now
          </h2>
          <p className="mt-2 max-w-[380px] text-sm leading-relaxed text-[#2d2d2d]">
            Join now with Crypto to get the latest news and start mining now
          </p>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full max-w-[467px] border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#929292] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
        />

        <button
          type="submit"
          className="w-full shrink-0 rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#e6a205] md:w-auto"
        >
          Subscribe
        </button>
      </div>
    </section>
  );
}
