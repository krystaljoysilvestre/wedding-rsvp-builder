"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ModalTemplate {
  slug: string;
  name: string;
  tier: "free" | "premium";
  desc: string;
  colors: string[];
  font: string;
}

interface TemplatePreviewModalProps {
  open: boolean;
  template: ModalTemplate | null;
  onClose: () => void;
}

export default function TemplatePreviewModal({
  open,
  template,
  onClose,
}: TemplatePreviewModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const useBtnRef = useRef<HTMLButtonElement>(null);

  // Esc + focus management + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the primary CTA once the modal is visible
    const t = setTimeout(() => useBtnRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open || !template) return null;

  const isPremium = template.tier === "premium";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6 md:p-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${template.name} template preview`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: live preview iframe */}
        <div className="relative flex-1 bg-[#FDFBF7]">
          <iframe
            key={template.slug}
            src={`/preview-demo/${template.slug}?mode=full`}
            title={`${template.name} full preview`}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
          />
        </div>

        {/* Right: meta + CTA */}
        <aside className="flex w-full flex-col border-t border-[#E8E4DE] bg-white p-7 md:w-[360px] md:flex-shrink-0 md:border-l md:border-t-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B8A48E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {isPremium ? "Premium Template" : "Free Template"}
            </span>
            {isPremium && (
              <svg
                className="h-3 w-3 text-[#C4917B]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <rect x="3" y="7" width="10" height="7" rx="1" />
                <path d="M5 7V5a3 3 0 016 0v2" />
              </svg>
            )}
          </div>

          <h3
            className="mt-3"
            style={{
              fontFamily: template.font,
              fontSize: "clamp(1.8rem, 3vw, 2.2rem)",
              fontWeight: 400,
              color: template.colors[2] ?? "#1A1A1A",
              lineHeight: 1.1,
            }}
          >
            {template.name}
          </h3>

          <p
            className="mt-4 text-sm leading-relaxed text-[#666]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {template.desc}
          </p>

          {/* Palette */}
          <div className="mt-7">
            <p
              className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.3em] text-[#999]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Palette
            </p>
            <div className="flex gap-2">
              {template.colors.map((c, i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full"
                  style={{
                    background: c,
                    border:
                      c === "#FFFFFF" || c === "#FAFAFA"
                        ? "1px solid #E5E5E5"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Font sample */}
          <div className="mt-6">
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#999]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Typography
            </p>
            <p
              style={{
                fontFamily: template.font,
                fontSize: "1.6rem",
                color: template.colors[2] ?? "#1A1A1A",
                fontWeight: 400,
              }}
            >
              Jane &amp; James
            </p>
          </div>

          <div className="flex-1" />

          {/* CTA */}
          <button
            ref={useBtnRef}
            type="button"
            onClick={() => {
              router.push(`/builder?theme=${template.slug}`);
              onClose();
            }}
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-none border border-[#C9A96E] bg-[#C9A96E] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A] transition-colors duration-500 hover:bg-transparent hover:text-[#C9A96E]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Use this template
            <svg
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </aside>
      </div>
    </div>
  );
}
