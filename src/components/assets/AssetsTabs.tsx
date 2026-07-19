"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", href: "/assets" },
  { label: "Analysis", href: "/analysis" },
  { label: "Order center", href: "/order-center" },
  { label: "Fees", href: "/trading-fees" },
  { label: "PoR reports", href: "/por-reports" },
];

export default function AssetsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-8 overflow-x-auto border-b border-[#e5e5e5]">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 pb-4 text-sm font-semibold whitespace-nowrap ${
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
