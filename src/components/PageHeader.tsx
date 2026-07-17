export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="bg-black px-9 pt-16 pb-10 md:pt-24">
      <div className="mx-auto max-w-[1228px]">
        <h1 className="font-semibold text-[38px] leading-tight text-white md:text-[48px]">
          {title}
        </h1>
        <p className="mt-4 max-w-[600px] text-base leading-relaxed text-[#909292] md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
