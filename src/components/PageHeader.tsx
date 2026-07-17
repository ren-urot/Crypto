import { Bitcoin } from "lucide-react";

export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="bg-[#f2f2f4] px-9 pt-10 pb-10">
      <div className="relative mx-auto flex max-w-[1228px] items-center overflow-hidden rounded-[20px] bg-black px-9 py-[12px] md:px-16 md:py-[31px]">
        <div className="relative z-10">
          <h1 className="font-semibold text-[38px] leading-tight text-white md:text-[48px]">
            {title}
          </h1>
          <p className="mt-4 max-w-[600px] text-base leading-relaxed text-[#909292] md:text-lg">
            {description}
          </p>
        </div>
        <Bitcoin
          className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white/10 md:block"
          size={160}
          strokeWidth={1.5}
        />
      </div>
    </section>
  );
}
