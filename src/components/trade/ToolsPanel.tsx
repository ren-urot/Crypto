import Link from "next/link";
import { LineChart, Repeat, Repeat2, Bot, Users, ChevronRight } from "lucide-react";

const TOOLS = [
  {
    href: "/trading-tools/spot-grid",
    icon: LineChart,
    title: "Spot grid",
    description: "Buy low sell high / Trade uptrends / Short, medium, and long terms",
  },
  {
    href: "/trading-tools/smart-arbitrage",
    icon: Repeat,
    title: "Smart arbitrage",
    description: "Easy arbitrage / Simple reinvest / Smart trades",
  },
  {
    href: "/trading-tools/spot-dca",
    icon: Repeat2,
    title: "Spot DCA (Martingale)",
    description:
      "Triggered by indicators / For volatile markets / Dollar cost averaging / Medium and long terms",
  },
  {
    href: "/trading-bots",
    icon: Bot,
    title: "Trading bots",
    description: "Multiple strategies to help you trade with ease",
  },
  {
    href: "/trading-tools/spot-copy-trading",
    icon: Users,
    title: "Spot copy trading",
    description: "Reap high returns with a community of top traders",
  },
];

export default function ToolsPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="absolute top-full right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-2xl">
      <div className="space-y-1">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[#f2f2f4]"
          >
            <tool.icon size={22} className="mt-0.5 shrink-0 text-[#2a2a2a]" />
            <div className="flex-1">
              <p className="font-semibold text-[#2a2a2a]">{tool.title}</p>
              <p className="mt-1 text-xs text-[#929292]">{tool.description}</p>
            </div>
            <ChevronRight size={16} className="mt-1 shrink-0 text-[#929292]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
