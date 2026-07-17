import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Have a question about your account, a trade, or a mining pool? Send us a message."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <ContactForm />
      </section>
    </>
  );
}
