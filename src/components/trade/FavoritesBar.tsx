import { Star } from "lucide-react";
import { COINS, type CoinId } from "@/lib/dashboard-data";

export default function FavoritesBar({
  selectedCoinId,
  onSelect,
  favorites,
  onToggleFavorite,
}: {
  selectedCoinId: CoinId;
  onSelect: (coinId: CoinId) => void;
  favorites: CoinId[];
  onToggleFavorite: () => void;
}) {
  const favoriteCoins = COINS.filter((coin) => favorites.includes(coin.id));
  const isCurrentFavorite = favorites.includes(selectedCoinId);

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-[20px] bg-white p-4">
      <span className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#929292]">
        <Star size={14} />
        Favorites
      </span>
      {favoriteCoins.length === 0 ? (
        <span className="text-sm text-[#929292]">No favorites yet.</span>
      ) : (
        favoriteCoins.map((coin) => (
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
        ))
      )}
      <button
        type="button"
        onClick={onToggleFavorite}
        className="shrink-0 rounded-full border border-[#e5e5e5] px-4 py-1.5 text-sm font-semibold text-[#39079e] hover:bg-[#f2f2f4]"
      >
        {isCurrentFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </button>
    </div>
  );
}
