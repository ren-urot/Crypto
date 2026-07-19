"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  User,
  PieChart,
  ShieldCheck,
  IdCard,
  Globe,
  Hexagon,
  Wallet2,
  Code2,
  UserCheck,
  LogOut,
  Copy,
} from "lucide-react";
import { useSession } from "@/lib/session-context";

const DEMO_UID = "702914830651278402";

const MENU_ITEMS = [
  { href: "/dashboard", icon: PieChart, label: "Overview" },
  { href: "/account/profile", icon: User, label: "Profile" },
  { href: "/account/security", icon: ShieldCheck, label: "Security" },
  { href: "/account/verification", icon: IdCard, label: "Verification" },
  { href: "/account/country-region", icon: Globe, label: "Country/Region" },
  { href: "/account/preferences", icon: Hexagon, label: "Preferences" },
  { href: "/account/sub-accounts", icon: Wallet2, label: "Sub-accounts" },
  { href: "/account/api-connections", icon: Code2, label: "API and connections" },
  {
    href: "/account/third-party-authorization",
    icon: UserCheck,
    label: "Third-party authorization",
  },
];

function maskEmail(email: string | null): string {
  if (!email) return "demo***@example.com";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 3)}***@${domain}`;
}

export default function AccountDropdown() {
  const router = useRouter();
  const { email, logout } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  function handleCopyUid() {
    navigator.clipboard?.writeText(DEMO_UID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleLogout() {
    setIsOpen(false);
    logout();
    router.push("/");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Account menu"
        className="text-[#2a2a2a] hover:text-[#39079e]"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-30 mt-2 w-80 rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f4] text-[#39079e]">
              <User size={20} />
            </span>
            <div>
              <p className="font-semibold text-[#2a2a2a]">{maskEmail(email)}</p>
              <p className="flex items-center gap-1 text-xs text-[#929292]">
                UID: {DEMO_UID}
                <button
                  type="button"
                  onClick={handleCopyUid}
                  aria-label="Copy UID"
                  className="text-[#929292] hover:text-[#39079e]"
                >
                  <Copy size={12} />
                </button>
                {copied && <span className="text-[#39079e]">Copied</span>}
              </p>
            </div>
          </div>
          <span className="mt-3 inline-block rounded-full border border-[#e5e5e5] px-3 py-1 text-xs font-semibold text-[#2a2a2a]">
            Regular user
          </span>

          <button
            type="button"
            className="mt-4 w-full rounded-full border border-[#e5e5e5] py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
          >
            Switch sub-account
          </button>

          <div className="my-4 border-t border-[#e5e5e5]" />

          <div className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
              >
                <item.icon size={18} className="text-[#2a2a2a]" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-[#e5e5e5]" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
