import { COINS, type CoinId } from "@/lib/dashboard-data";

export default function QuickSelectBar({
  selectedCoinId,
  onSelect,
}: {
  selectedCoinId: CoinId;
  onSelect: (coinId: CoinId) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-[20px] bg-white p-4">
      <span className="shrink-0 text-sm font-semibold text-[#929292]">Quick select</span>
      {COINS.map((coin) => (
        <button
          key={coin.id}
          type="button"
          onClick={() => onSelect(coin.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            coin.id === selectedCoinId
              ? "bg-[#39079e] text-white"
              : "bg-[#f2f2f4] text-[#2a2a2a] hover:bg-[#e5e5e5]"
          }`}
        >
          {coin.symbol}/USDT
        </button>
      ))}
    </div>
  );
}
