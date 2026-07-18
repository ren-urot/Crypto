"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Handshake, CirclePlus, Calculator } from "lucide-react";

const ITEMS = [
  {
    href: "/p2p-trading",
    icon: Handshake,
    title: "P2P trading",
    description: "Buy/Sell with zero trading fees via 100+ payment methods",
  },
  {
    href: "/buy-crypto",
    icon: CirclePlus,
    title: "Buy and Sell",
    description: "Visa, Mastercard, and others",
  },
  {
    href: "/crypto-calculator",
    icon: Calculator,
    title: "Crypto calculator",
    description: "Check real-time conversion rates and crypto values",
  },
];

export default function BuyCryptoDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 font-semibold text-xs tracking-[0.1em] text-[#2a2a2a] uppercase transition-colors hover:text-[#39079e]"
      >
        Buy Crypto
        <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-3 w-[360px] rounded-2xl bg-white p-6 shadow-2xl">
          <div className="space-y-6">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-[#f2f2f4]"
                >
                  <Icon size={24} className="mt-1 shrink-0 text-[#2a2a2a]" />
                  <div>
                    <p className="font-semibold text-[#2a2a2a]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#929292]">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
