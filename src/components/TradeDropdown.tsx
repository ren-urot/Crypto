"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  ArrowLeftRight,
  CandlestickChart,
  Hexagon,
  LineChart,
  Zap,
  Bot,
} from "lucide-react";

const TRADING_INSTRUMENTS = [
  {
    href: "/crypto-calculator",
    icon: RefreshCcw,
    title: "Convert",
    description: "Quick conversion, zero trading fees, no slippage",
    chevron: false,
  },
  {
    href: "/trade",
    icon: ArrowLeftRight,
    title: "Spot",
    description: "Buy and sell crypto with ease",
    chevron: true,
  },
  {
    href: "/futures",
    icon: CandlestickChart,
    title: "Futures",
    description: "Trade perpetual and expiry futures with leverage",
    chevron: true,
  },
  {
    href: "/dex",
    icon: Hexagon,
    title: "DEX",
    description: "Trade on-chain tokens using your Exchange balance",
    chevron: true,
  },
  {
    href: "/events-options",
    icon: LineChart,
    title: "Events & Options",
    description: "Trade on crypto price movements with events and options",
    chevron: true,
  },
];

const POWERFUL_TOOLS = [
  {
    href: "/grow",
    icon: Zap,
    title: "Flash Earn",
    description: "Earn rewards on new listings, spot, futures, and more trading campaigns",
    chevron: true,
  },
  {
    href: "/trading-bots",
    icon: Bot,
    title: "Trading Bots",
    description: "Automate your trades with bots and community-built strategies",
    chevron: true,
  },
];

function DropdownRow({
  href,
  icon: Icon,
  title,
  description,
  chevron,
  onClick,
}: {
  href: string;
  icon: typeof RefreshCcw;
  title: string;
  description: string;
  chevron: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-[#f2f2f4]"
    >
      <Icon size={24} className="mt-1 shrink-0 text-[#2a2a2a]" />
      <div className="flex-1">
        <p className="font-semibold text-[#2a2a2a]">{title}</p>
        <p className="mt-1 text-sm text-[#929292]">{description}</p>
      </div>
      {chevron && <ChevronRight size={18} className="mt-1 shrink-0 text-[#929292]" />}
    </Link>
  );
}

export default function TradeDropdown() {
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
        Trade
        <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-3 max-h-[80vh] w-[380px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <p className="text-sm font-semibold text-[#929292]">Trading instruments</p>
          <div className="mt-3 space-y-5">
            {TRADING_INSTRUMENTS.map((item) => (
              <DropdownRow key={item.href} {...item} onClick={() => setIsOpen(false)} />
            ))}
          </div>

          <div className="my-5 border-t border-[#e5e5e5]" />

          <p className="text-sm font-semibold text-[#929292]">Powerful tools</p>
          <div className="mt-3 space-y-5">
            {POWERFUL_TOOLS.map((item) => (
              <DropdownRow key={item.href} {...item} onClick={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
