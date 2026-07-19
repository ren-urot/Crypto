export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="bg-[#f2f2f4] px-4 md:px-9 pt-10 pb-10">
      <div className="mx-auto max-w-[1228px] rounded-[20px] bg-[#39079e] px-9 py-[12px] md:px-16 md:py-[31px]">
        <h1 className="font-semibold text-[38px] leading-tight text-white md:text-[48px]">
          {title}
        </h1>
        <p className="mt-4 max-w-[600px] text-base leading-relaxed text-white/70 md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
