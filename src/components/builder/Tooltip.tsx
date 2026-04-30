"use client";

import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
  /** Which side of the trigger the tooltip appears on. Default: "bottom". */
  side?: "bottom" | "top";
}

// Lightweight CSS-only tooltip — no portal, no state. Wraps a single
// trigger element; appears on hover after a short delay. Uses the same
// dark `#1A1A1A` chip the rest of the app uses for status pills, so it
// reads as part of the warm-cream chrome rather than browser default.
export default function Tooltip({
  label,
  children,
  side = "bottom",
}: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity delay-300 group-hover:opacity-100 ${
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
