import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Crypto platform, you agree to be bound by these Terms of Service. If you do not agree, you should not use the platform.",
  },
  {
    title: "2. Use of Service",
    body: "You may use Crypto only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You agree to provide accurate information when creating an account and to notify us promptly of any unauthorized use of your account.",
  },
  {
    title: "4. Limitation of Liability",
    body: "Cryptocurrency markets are volatile. Crypto is not liable for losses resulting from market fluctuations, third-party actions, or events outside our reasonable control.",
  },
  {
    title: "5. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        description="Please read these terms carefully before using the Crypto platform."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[900px] space-y-8 rounded-[40px] bg-white p-10 md:p-16">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-semibold text-xl text-[#39079e]">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#2d2d2d]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
