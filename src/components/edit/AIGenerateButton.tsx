"use client";

import { useEffect, useRef, useState } from "react";

type GenerateType = "tagline" | "story" | "welcome" | "note";

const TONES = [
  { id: "romantic", label: "Romantic" },
  { id: "casual", label: "Casual" },
  { id: "heartfelt", label: "Heartfelt" },
  { id: "witty", label: "Witty" },
  { id: "cinematic", label: "Cinematic" },
];

interface AIGenerateButtonProps {
  type: GenerateType;
  names?: string;
  theme?: string;
  input?: string;
  hasValue?: boolean;
  onGenerated: (text: string) => void;
}

export default function AIGenerateButton({
  type,
  names,
  theme,
  input,
  hasValue = false,
  onGenerated,
}: AIGenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function generate(tone?: string) {
    if (loading) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, names, theme, tone, input }),
      });
      const data = (await res.json()) as { result?: string };
      if (data.result) onGenerated(data.result);
    } catch (err) {
      console.error("AIGenerateButton error:", err);
    } finally {
      setLoading(false);
    }
  }

  const primaryLabel = hasValue ? "Regenerate" : "Generate";
  const PrimaryIcon = hasValue ? RefreshIcon : SparkleIcon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5C4F3D] transition-colors hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <svg
            className="h-3 w-3 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <PrimaryIcon />
        )}
        {loading ? "Generating…" : primaryLabel}
        {!loading && (
          <svg
            className="h-2.5 w-2.5 text-[#A09580]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-45 overflow-hidden rounded-lg border border-[#EDE8E0] bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => generate()}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-[#1A1A1A] hover:bg-[#FAF7F2]"
          >
            <PrimaryIcon />
            {primaryLabel}
          </button>
          <div className="my-1 border-t border-[#EDE8E0]" />
          <div className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-[0.15em] text-[#A09580]">
            Tone
          </div>
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => generate(t.id)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#5C4F3D] transition-colors hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline icons (heroicons-style outline) ──────────────────────────

function SparkleIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-3.181-13.45a8.25 8.25 0 00-11.667 0l-3.181 3.183m0 0V9.348m0-4.992h4.992"
      />
    </svg>
  );
}
