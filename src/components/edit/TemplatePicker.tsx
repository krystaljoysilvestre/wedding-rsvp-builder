"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getTheme, THEME_NAMES } from "@/lib/themes";
import type { ThemeName } from "@/lib/types";

interface TemplatePickerProps {
  open: boolean;
  current?: ThemeName;
  onSelect: (theme: ThemeName) => void;
  onClose: () => void;
}

export default function TemplatePicker({
  open,
  current,
  onSelect,
  onClose,
}: TemplatePickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a template"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#EDE8E0] bg-[#FDFBF7] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EDE8E0] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">
              Choose a template
            </h2>
            <p className="text-[12px] text-[#8B7355]">
              Pick a style — your details carry over.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A09580] transition-colors hover:text-[#1A1A1A]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {THEME_NAMES.map((slug) => {
              const theme = getTheme(slug);
              const isSelected = current === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onSelect(slug)}
                  aria-pressed={isSelected}
                  className={`group relative overflow-hidden rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-[#1A1A1A] shadow-md"
                      : "border-[#EDE8E0] hover:border-[#5C4F3D]"
                  }`}
                >
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url('${theme.heroImage}')` }}
                  />

                  {theme.isPremium && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                      <svg
                        className="h-2.5 w-2.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z" />
                      </svg>
                      Premium
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-white">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M3 6l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="bg-[#FDFBF7] px-3 py-2">
                    <p className="text-[12px] font-medium text-[#1A1A1A]">
                      {theme.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
