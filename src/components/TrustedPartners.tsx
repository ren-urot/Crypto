import Image from "next/image";

export default function TrustedPartners() {
  return (
    <section className="bg-[#f2f2f4] px-9">
      <div className="relative mx-auto max-w-[1270px] -translate-y-[100px]">
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 translate-y-[calc(-50%+20px)] rounded-full bg-[#858585] px-8 py-3 text-sm font-medium tracking-wide text-white">
          Trusted Partners
        </span>

        <div className="flex scale-[0.8] flex-wrap items-center justify-between gap-10 rounded-[260px] bg-white px-16 py-10">
          <div className="flex flex-col items-center gap-2">
            <Image src="/assets/partners/binance-icon.svg" alt="" width={63} height={74} />
            <span className="text-lg font-bold tracking-tight text-[#231f20]">
              BINANCE
            </span>
          </div>

          <Image
            src="/assets/partners/paywell.svg"
            alt="PayWell"
            width={119}
            height={78}
          />

          <Image
            src="/assets/partners/pay.svg"
            alt="PAY"
            width={143}
            height={70}
          />

          <Image
            src="/assets/partners/bitcoin.svg"
            alt="BitCoin"
            width={93}
            height={98}
          />

          <div className="flex flex-col items-center gap-2">
            <Image src="/assets/partners/coin-icon.svg" alt="" width={66} height={66} />
            <span className="text-lg font-bold tracking-tight text-[#231f20]">
              Coin
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
