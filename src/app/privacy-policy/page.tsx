import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  {
    title: "Data We Collect",
    body: "We collect information you provide directly, such as your name and email address, as well as usage data like device type and pages visited.",
  },
  {
    title: "How We Use Your Data",
    body: "We use your data to operate and improve the platform, communicate with you about your account, and comply with legal obligations.",
  },
  {
    title: "Cookies",
    body: "Crypto uses cookies to keep you signed in and to understand how the platform is used. You can disable cookies in your browser, though some features may not work as expected.",
  },
  {
    title: "Your Rights",
    body: "You can request access to, correction of, or deletion of your personal data at any time by contacting our support team.",
  },
  {
    title: "Contact Us",
    body: "Questions about this policy can be sent to our team through the Contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description="How Crypto collects, uses, and protects your information."
      />
      <section className="bg-[#f2f2f4] px-4 md:px-9 pb-16">
        <div className="mx-auto max-w-[900px] space-y-8 rounded-[20px] bg-white p-10 md:p-16">
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
