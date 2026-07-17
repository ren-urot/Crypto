import Image from "next/image";

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[652/607] w-full max-w-[652px]">
      <Image
        src="/assets/hero.svg"
        alt=""
        fill
        className="object-contain"
        sizes="652px"
        priority
      />
    </div>
  );
}
