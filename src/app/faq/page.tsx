import PageHeader from "@/components/PageHeader";
import FaqAccordion from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        description="Answers to the questions we hear most from traders and miners."
      />
      <section className="bg-[#f2f2f4] px-4 md:px-9 pb-16">
        <FaqAccordion />
      </section>
    </>
  );
}
