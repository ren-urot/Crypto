"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  ChevronDown,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  Percent,
  FileText,
} from "lucide-react";

const ITEMS = [
  { href: "/assets", icon: CreditCard, label: "My assets" },
  { href: "/buy-crypto", icon: ArrowDownToLine, label: "Deposit" },
  { href: "/withdraw", icon: ArrowUpFromLine, label: "Withdraw" },
  { href: "/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { href: "/analysis", icon: BarChart3, label: "Analysis" },
  { href: "/order-center", icon: ClipboardList, label: "Order center" },
  { href: "/trading-fees", icon: Percent, label: "My trading fees" },
  { href: "/por-reports", icon: FileText, label: "PoR reports" },
];

export default function AssetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-xs font-semibold tracking-[0.05em] text-[#2a2a2a] uppercase hover:text-[#39079e]"
      >
        Assets
        <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-30 mt-2 w-64 rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-2xl">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#f2f2f4]"
            >
              <item.icon size={20} className="shrink-0 text-[#2a2a2a]" />
              <span className="font-semibold text-[#2a2a2a]">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
