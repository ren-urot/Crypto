"use client";

export default function SpotFuturesToggle({
  value,
  onChange,
}: {
  value: "spot" | "futures";
  onChange: (next: "spot" | "futures") => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[#f2f2f4] p-1 text-xs font-semibold uppercase">
      <button
        type="button"
        onClick={() => onChange("spot")}
        className={`rounded-full px-4 py-1.5 transition-colors ${
          value === "spot" ? "bg-[#39079e] text-white" : "text-[#929292]"
        }`}
      >
        Spot
      </button>
      <button
        type="button"
        onClick={() => onChange("futures")}
        className={`rounded-full px-4 py-1.5 transition-colors ${
          value === "futures" ? "bg-[#39079e] text-white" : "text-[#929292]"
        }`}
      >
        Futures
      </button>
    </div>
  );
}
