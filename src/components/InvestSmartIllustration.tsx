import Image from "next/image";

export default function InvestSmartIllustration() {
  return (
    <div className="relative mx-auto aspect-[586/323] w-full max-w-[586px]">
      <Image
        src="/assets/invest.svg"
        alt=""
        fill
        className="object-contain"
        sizes="586px"
      />
    </div>
  );
}
