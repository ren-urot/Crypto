"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Markets", href: "/markets" },
  { label: "Rankings", href: "/markets/rankings" },
  { label: "Trading data", href: "/markets/trading-data" },
];

export default function MarketsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-8 border-b border-[#e5e5e5]">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-4 text-sm font-semibold uppercase tracking-[0.05em] ${
              isActive
                ? "border-b-2 border-[#39079e] text-[#39079e]"
                : "text-[#929292] hover:text-[#2a2a2a]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
