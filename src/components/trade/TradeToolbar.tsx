"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

export default function TradeToolbar({
  marginEnabled,
  onToggleMargin,
  isPanelCollapsed,
  onToggleCollapsed,
}: {
  marginEnabled: boolean;
  onToggleMargin: () => void;
  isPanelCollapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [showToolsNote, setShowToolsNote] = useState(false);

  return (
    <div className="flex items-center justify-end gap-5 rounded-[20px] bg-white px-4 py-2">
      <span className="text-sm font-semibold text-[#39079e]">Trade</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowToolsNote((prev) => !prev)}
          className="text-sm font-semibold text-[#929292] hover:text-[#2a2a2a]"
        >
          Tools
        </button>
        {showToolsNote && (
          <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-[#e5e5e5] bg-white p-3 text-xs text-[#929292] shadow-2xl">
            Chart drawing tools are coming soon.
          </div>
        )}
      </div>

      <span className="h-5 w-px bg-[#e5e5e5]" />

      <label className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
        Margin
        <button
          type="button"
          role="switch"
          aria-checked={marginEnabled}
          onClick={onToggleMargin}
          className={`h-5 w-9 rounded-full transition-colors ${
            marginEnabled ? "bg-[#39079e]" : "bg-[#e5e5e5]"
          }`}
        >
          <span
            className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              marginEnabled ? "translate-x-[1.125rem]" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>

      <span className="h-5 w-px bg-[#e5e5e5]" />

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={isPanelCollapsed ? "Expand order panel" : "Collapse order panel"}
        className="text-[#929292] hover:text-[#39079e]"
      >
        {isPanelCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
      </button>
    </div>
  );
}
