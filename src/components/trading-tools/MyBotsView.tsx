"use client";

import Link from "next/link";
import { LineChart, Repeat, Repeat2, Users, Inbox } from "lucide-react";
import { formatUsd, getCoin } from "@/lib/dashboard-data";
import { useBots, type BotType } from "@/lib/bots-context";
import { useWallet } from "@/lib/wallet-context";

const TYPE_ICON: Record<BotType, typeof LineChart> = {
  grid: LineChart,
  arbitrage: Repeat,
  dca: Repeat2,
  copy: Users,
};

const TYPE_LABEL: Record<BotType, string> = {
  grid: "Spot grid",
  arbitrage: "Smart arbitrage",
  dca: "Spot DCA",
  copy: "Copy trading",
};

const QUICK_LINKS = [
  { href: "/trading-tools/spot-grid", icon: LineChart, label: "Spot grid" },
  { href: "/trading-tools/smart-arbitrage", icon: Repeat, label: "Smart arbitrage" },
  { href: "/trading-tools/spot-dca", icon: Repeat2, label: "Spot DCA" },
  { href: "/trading-tools/spot-copy-trading", icon: Users, label: "Spot copy trading" },
];

export default function MyBotsView() {
  const { bots, removeBot } = useBots();
  const { refundUsd } = useWallet();

  function handleStop(id: string) {
    const refund = removeBot(id);
    refundUsd(refund);
  }

  if (bots.length === 0) {
    return (
      <div className="mx-auto max-w-[700px] text-center">
        <div className="rounded-[20px] bg-white p-10">
          <Inbox size={40} className="mx-auto text-[#c9c9c9]" />
          <p className="mt-4 text-[#929292]">
            No active bots yet. Start one of these strategies to see it here.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-[20px] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <link.icon size={22} className="text-[#39079e]" />
              <span className="font-semibold text-[#2a2a2a]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] space-y-3">
      {bots.map((bot) => {
        const Icon = TYPE_ICON[bot.type];
        const coin = getCoin(bot.coinId);
        return (
          <div
            key={bot.id}
            className="flex items-center justify-between rounded-[20px] bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f2f4] text-[#39079e]">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#929292] uppercase">
                  {TYPE_LABEL[bot.type]} · {coin.symbol}
                </p>
                <p className="font-semibold text-[#2a2a2a]">{bot.summary}</p>
                <p className="mt-1 text-sm text-[#929292]">
                  Reserved {formatUsd(bot.investment)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStop(bot.id)}
              className="rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-[#39079e] uppercase hover:bg-[#f2f2f4]"
            >
              Stop &amp; refund
            </button>
          </div>
        );
      })}
    </div>
  );
}
