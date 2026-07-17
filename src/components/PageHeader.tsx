export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="bg-[#f2f2f4] px-9 pt-10 pb-10">
      <div className="mx-auto max-w-[1228px] rounded-[20px] bg-black px-9 py-16 md:px-16 md:py-24">
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
