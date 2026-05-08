"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

type GenerateType = "tagline" | "story" | "welcome" | "note";

const TONES = [
  { id: "romantic", label: "Romantic" },
  { id: "casual", label: "Casual" },
  { id: "heartfelt", label: "Heartfelt" },
  { id: "witty", label: "Witty" },
  { id: "cinematic", label: "Cinematic" },
];

type Mode = "closed" | "actions" | "tone" | "refine";

interface AIAssistProps {
  type: GenerateType;
  names?: string;
  theme?: string;
  /** Current value of the field — used as the source for Refine and (for
   *  story) as a seed for Generate. */
  input?: string;
  hasValue?: boolean;
  /** When true, position the icon at bottom-right (chat-compose feel) for
   *  textareas. Default false → vertically centered at right edge. */
  multiline?: boolean;
  onGenerated: (text: string) => void;
  /** The wrapped input or textarea. */
  children: ReactNode;
}

/**
 * Inline AI assist that wraps an input or textarea. The sparkle icon sits
 * inside the input chrome (right edge for inputs, bottom-right for
 * textareas) and reveals on focus / hover / has-value (always on mobile,
 * since touch has no hover signal). Clicking opens an action row above the
 * input with Generate/Regenerate, Refine, and Change tone — the row morphs
 * into tone chips or a refine textarea inline rather than a nested popover.
 */
export default function AIGenerateButton({
  type,
  names,
  theme,
  input,
  hasValue = false,
  multiline = false,
  onGenerated,
  children,
}: AIAssistProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("closed");
  const [instruction, setInstruction] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (mode === "closed") return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  function close() {
    setMode("closed");
    setInstruction("");
  }

  async function generate(tone?: string) {
    if (loading) return;
    close();
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
    close();
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

  // Icon visibility: always on mobile, when has value, when open, when
  // loading. Otherwise on focus-within or hover (driven by group-* classes
  // on the wrapper). The wrapper's `group` enables those.
  const alwaysVisible =
    hasValue || isMobile || mode !== "closed" || loading;
  const visibilityClasses = alwaysVisible
    ? "opacity-100"
    : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100";

  const iconPosClasses = multiline
    ? "bottom-2 right-2"
    : "right-2 top-1/2 -translate-y-1/2";

  const primaryLabel = hasValue ? "Regenerate" : "Generate";

  return (
    <div ref={ref} className="relative group">
      {children}

      {/* Action row — slides above the input when mode is open. */}
      {mode !== "closed" && (
        <div
          className="ai-actions-in absolute bottom-full right-0 mb-2 z-50 max-w-full overflow-hidden rounded-xl border border-[#EDE8E0] bg-white px-1.5 py-1.5 shadow-lg"
          role="menu"
        >
          {mode === "actions" && (
            <div className="flex flex-wrap items-center gap-1">
              <Chip onClick={() => generate()} icon={<MiniSparkle />}>
                {primaryLabel}
              </Chip>
              {hasValue && (
                <>
                  <Chip
                    onClick={() => setMode("refine")}
                    icon={<PencilIcon />}
                  >
                    Refine
                  </Chip>
                  <Chip
                    onClick={() => setMode("tone")}
                    icon={<ToneIcon />}
                    trailing={<Caret />}
                  >
                    Change tone
                  </Chip>
                </>
              )}
            </div>
          )}

          {mode === "tone" && (
            <div className="flex flex-wrap items-center gap-1">
              <BackChip onClick={() => setMode("actions")} />
              {TONES.map((t) => (
                <Chip key={t.id} onClick={() => generate(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          )}

          {mode === "refine" && (
            <div className="w-72 max-w-[80vw] p-1.5">
              <p className="text-[12px] font-medium text-[#1A1A1A]">
                How should we change it?
              </p>
              <p className="mt-0.5 text-[11px] italic text-[#8B7355]">
                Try &ldquo;make it shorter,&rdquo; &ldquo;more romantic,&rdquo;
                or &ldquo;mention how we met.&rdquo;
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
                className="mt-2 w-full resize-none rounded-md border border-[#E0D9CE] bg-white px-2 py-1.5 text-[12px] text-[#1A1A1A] placeholder:text-[#A09580] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("actions")}
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
      )}

      {/* Inline AI sparkle icon — overlaid on the input, revealed on focus/
          hover (or always on mobile / when there is content / when loading). */}
      <button
        type="button"
        onClick={() => setMode((m) => (m === "closed" ? "actions" : "closed"))}
        disabled={loading}
        aria-label={mode === "closed" ? "Open AI assist" : "Close AI assist"}
        aria-expanded={mode !== "closed"}
        className={`absolute ${iconPosClasses} ${visibilityClasses} flex h-7 w-7 items-center justify-center rounded-full transition-opacity duration-200 hover:bg-[#FAF7F2] disabled:cursor-not-allowed`}
      >
        {loading ? <ShimmerSpinner /> : <ShimmerSparkle />}
      </button>
    </div>
  );
}

// ─── Internal subcomponents ─────────────────────────────────────────

function Chip({
  children,
  icon,
  trailing,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#EDE8E0] bg-[#FDFBF7] px-2.5 py-1 text-[12px] font-medium text-[#1A1A1A] transition-colors hover:border-[#B8A48E] hover:bg-[#FAF7F2]"
      role="menuitem"
    >
      {icon}
      {children}
      {trailing}
    </button>
  );
}

function BackChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium text-[#5C4F3D] transition-colors hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
      role="menuitem"
      aria-label="Back"
    >
      ←
    </button>
  );
}

// ─── Inline icons (heroicons-style outline) ──────────────────────────

// Trigger sparkle with a soft pink → lavender → blue gradient — reads as
// "AI" without going neon. The same gradient is used by ShimmerSpinner so
// the loading state stays on-theme.
function ShimmerSparkle() {
  return (
    <svg
      className="shimmer-pulse h-4 w-4"
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
      className="h-4 w-4 animate-spin"
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

// Mini sparkle for the Generate/Regenerate chip — same shape, currentColor.
function MiniSparkle() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
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

function PencilIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
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

// Speaker / tone glyph for the Change-tone chip.
function ToneIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9V5a3 3 0 116 0v4m-6 0a3 3 0 016 0m-6 0v6a3 3 0 006 0V9M5 12v3a7 7 0 0014 0v-3"
      />
    </svg>
  );
}

function Caret() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
