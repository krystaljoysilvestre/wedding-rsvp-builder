"use client";

import { ReactNode } from "react";

interface SectionLockProps {
  /** When true, the dummy content underneath is behind an overlay. */
  locked: boolean;
  /** Short uppercase hint shown on the overlay badge. */
  hint: string;
  /** Hex color (with optional alpha) of the overlay wash. */
  overlayBg?: string;
  /** Whether the hint badge is on a light or dark wash. Auto-inferred from overlayBg contrast. */
  badgeTone?: "light" | "dark";
  children: ReactNode;
}

/**
 * Wraps a preview section. When `locked`, overlays the section with a
 * translucent wash and a centered "Add your [thing]" badge. The child always
 * renders underneath so the unlock transition is a pure fade, not a remount.
 */
export default function SectionLock({
  locked,
  hint,
  overlayBg = "#FDFBF7",
  badgeTone = "dark",
  children,
}: SectionLockProps) {
  return (
    <div className="relative isolate">
      {children}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          // z-index forces the wash + badge above any absolutely-positioned
          // foreground layers inside the section (hero image, ornaments, etc.).
          zIndex: 50,
          opacity: locked ? 1 : 0,
          // Almost-transparent wash — content underneath stays clearly visible.
          background: `linear-gradient(${overlayBg}1A, ${overlayBg}33)`,
          transition: "opacity 520ms ease",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-sm transition-transform duration-500"
          style={{
            fontFamily: "var(--font-dm-sans)",
            transform: locked ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
            background: badgeTone === "dark" ? "rgba(26,26,26,0.92)" : "rgba(255,255,255,0.92)",
            borderColor: badgeTone === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
            color: badgeTone === "dark" ? "#F5E6C8" : "#1A1A1A",
          }}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <rect x="3" y="7" width="10" height="7" rx="1" />
            <path d="M5 7V5a3 3 0 016 0v2" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-[0.28em]">
            {hint}
          </span>
        </div>
      </div>
    </div>
  );
}
