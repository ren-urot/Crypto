import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";

const SECTIONS: Record<string, { title: string; description: string }> = {
  profile: {
    title: "Profile",
    description: "Manage your display name, avatar, and public profile details.",
  },
  security: {
    title: "Security",
    description: "Manage your password, two-factor authentication, and login activity.",
  },
  verification: {
    title: "Verification",
    description: "Complete identity verification to unlock higher account limits.",
  },
  "country-region": {
    title: "Country/Region",
    description: "Manage the country or region associated with your account.",
  },
  preferences: {
    title: "Preferences",
    description: "Manage your display currency, language, and notification settings.",
  },
  "sub-accounts": {
    title: "Sub-accounts",
    description: "Create and manage sub-accounts under your main account.",
  },
  "api-connections": {
    title: "API and connections",
    description: "Manage API keys and connected third-party apps.",
  },
  "third-party-authorization": {
    title: "Third-party authorization",
    description: "Manage apps and services authorized to access your account.",
  },
};

export default async function AccountSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const entry = SECTIONS[section];

  if (!entry) {
    notFound();
  }

  return (
    <>
      <PageHeader title={entry.title} description={entry.description} />
      <section className="bg-[#f2f2f4] px-9 py-16">
        <p className="text-[#929292]">Coming soon.</p>
      </section>
    </>
  );
}
