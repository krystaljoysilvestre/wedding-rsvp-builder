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
  /** Current value of the field — used as the source for Refine and (for
   *  story) as a seed for Generate. */
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
  const [refineMode, setRefineMode] = useState(false);
  const [instruction, setInstruction] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setRefineMode(false);
        setInstruction("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function closeAll() {
    setOpen(false);
    setRefineMode(false);
    setInstruction("");
  }

  async function generate(tone?: string) {
    if (loading) return;
    closeAll();
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

  async function refine() {
    const trimmed = instruction.trim();
    if (loading || !trimmed) return;
    closeAll();
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `${type}_refine`,
          names,
          theme,
          input,
          instruction: trimmed,
        }),
      });
      const data = (await res.json()) as { result?: string };
      if (data.result) onGenerated(data.result);
    } catch (err) {
      console.error("AIGenerateButton refine error:", err);
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
        title={loading ? "Working…" : "AI assist"}
        aria-label="AI assist"
        className="group flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#FCE7F3]/60 via-[#E9D5FF]/60 to-[#DBEAFE]/60 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? <ShimmerSpinner /> : <ShimmerSparkle />}
      </button>

      {open && !refineMode && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-50 overflow-hidden rounded-lg border border-[#EDE8E0] bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => generate()}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-[#1A1A1A] hover:bg-[#FAF7F2]"
          >
            <PrimaryIcon />
            {primaryLabel}
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={() => setRefineMode(true)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-[#1A1A1A] hover:bg-[#FAF7F2]"
            >
              <PencilIcon />
              Refine
            </button>
          )}
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

      {open && refineMode && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-lg border border-[#EDE8E0] bg-white p-3 shadow-lg">
          <p className="text-[12px] font-medium text-[#1A1A1A]">
            How should we change it?
          </p>
          <p className="mt-0.5 text-[11px] italic text-[#8B7355]">
            Try &ldquo;make it shorter,&rdquo; &ldquo;more romantic,&rdquo; or
            &ldquo;mention how we met.&rdquo;
          </p>
          <textarea
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void refine();
              }
            }}
            rows={3}
            placeholder="Make it shorter…"
            className="mt-2 w-full rounded-md border border-[#E0D9CE] bg-white px-2 py-1.5 text-[12px] text-[#1A1A1A] placeholder:text-[#A09580] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setRefineMode(false);
                setInstruction("");
              }}
              className="text-[11px] font-medium text-[#5C4F3D] hover:text-[#1A1A1A]"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => void refine()}
              disabled={!instruction.trim()}
              className="rounded-md bg-[#1A1A1A] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#2C2C2C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline icons (heroicons-style outline) ──────────────────────────

// Trigger sparkle with a soft pink → lavender → blue gradient — reads as
// "AI" without going neon. The same gradient is used by ShimmerSpinner so
// the loading state stays on-theme.
function ShimmerSparkle() {
  return (
    <svg
      className="shimmer-pulse h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ai-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <path
        stroke="url(#ai-shimmer)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
      />
    </svg>
  );
}

function ShimmerSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ai-shimmer-spin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="#EDE8E0" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="url(#ai-shimmer-spin)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function PencilIcon() {
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
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
    </svg>
  );
}
