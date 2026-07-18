"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COINS, formatUsd, formatPercent, type CoinId } from "@/lib/dashboard-data";

export default function CoinSwitcher({
  selectedCoinId,
  onSelect,
}: {
  selectedCoinId: CoinId;
  onSelect: (coinId: CoinId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  const filtered = COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[#39079e] hover:text-[#2d0680]"
      >
        <span className="font-semibold">{selectedCoinId}/USDT</span>
        <ChevronDown size={16} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 w-72 rounded-xl border border-[#e5e5e5] bg-white p-3 shadow-2xl">
          <input
            type="text"
            autoFocus
            placeholder="Search markets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] bg-[#f2f2f4] px-3 py-2 text-sm text-[#2d2d2d] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
          />
          <div className="mt-2 max-h-[320px] space-y-0.5 overflow-y-auto">
            {filtered.map((coin) => {
              const isUp = coin.change24h >= 0;
              return (
                <button
                  key={coin.id}
                  type="button"
                  onClick={() => {
                    onSelect(coin.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                    coin.id === selectedCoinId ? "bg-[#f2f2f4]" : "hover:bg-[#f2f2f4]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#39079e]">{coin.symbol}/USDT</p>
                    <p className="text-xs text-[#929292]">{coin.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#2d2d2d]">{formatUsd(coin.price)}</p>
                    <p className={`text-xs ${isUp ? "text-green-600" : "text-red-600"}`}>
                      {formatPercent(coin.change24h)}
                    </p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#929292]">No markets match &quot;{query}&quot;.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
