"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Play } from "lucide-react";

export default function EnableBorrowingModal({
  onCancel,
  onEnable,
}: {
  onCancel: () => void;
  onEnable: () => void;
}) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-2xl text-[#2a2a2a]">Enable borrowing</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-[#929292] hover:text-[#2a2a2a]"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-6 text-base leading-relaxed text-[#2d2d2d]">
          Borrowing increases how much you can trade and magnifies both your profits and losses.
          Watch this video to learn about the rules and risks of borrowing.
        </p>

        <div className="mt-6 flex aspect-video items-center justify-center rounded-xl bg-[#f2f2f4]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#39079e] shadow">
            <Play size={22} fill="currentColor" />
          </span>
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm text-[#2a2a2a]">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
          />
          I understand the{" "}
          <Link href="/borrowing-rules" className="font-semibold text-[#39079e] hover:underline">
            spot borrowing rules
          </Link>
        </label>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!understood}
            onClick={onEnable}
            className="rounded-full bg-[#39079e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d0680] disabled:cursor-not-allowed disabled:bg-[#e5e5e5] disabled:text-[#929292]"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
