"use client";

import { useRef, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import ToolsPanel from "./ToolsPanel";
import EnableBorrowingModal from "./EnableBorrowingModal";

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
  const [showTools, setShowTools] = useState(false);
  const [showBorrowingModal, setShowBorrowingModal] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useClickOutside(toolsRef, () => setShowTools(false));

  function handleMarginClick() {
    if (marginEnabled) {
      onToggleMargin();
    } else {
      setShowBorrowingModal(true);
    }
  }

  function handleEnableBorrowing() {
    setShowBorrowingModal(false);
    onToggleMargin();
  }

  return (
    <div className="flex items-center justify-end gap-5 rounded-[20px] bg-white px-4 py-2">
      <span className="text-sm font-semibold text-[#39079e]">Trade</span>

      <div ref={toolsRef} className="relative">
        <button
          type="button"
          onClick={() => setShowTools((prev) => !prev)}
          className="text-sm font-semibold text-[#929292] hover:text-[#2a2a2a]"
        >
          Tools
        </button>
        {showTools && <ToolsPanel onNavigate={() => setShowTools(false)} />}
      </div>

      <span className="h-5 w-px bg-[#e5e5e5]" />

      <label className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
        Margin
        <button
          type="button"
          role="switch"
          aria-checked={marginEnabled}
          onClick={handleMarginClick}
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

      {showBorrowingModal && (
        <EnableBorrowingModal
          onCancel={() => setShowBorrowingModal(false)}
          onEnable={handleEnableBorrowing}
        />
      )}
    </div>
  );
}
