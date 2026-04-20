"use client";

import { useWedding } from "@/context/WeddingContext";
import { THEME_PALETTES, isPremiumTheme } from "@/lib/themes";
import type { ThemeName } from "@/lib/types";

const TEMPLATES: { name: ThemeName; label: string; swatch: string }[] = [
  { name: "romantic", label: "Romantic", swatch: "#C4917B" },
  { name: "elegant", label: "Elegant", swatch: "#0A0A0A" },
  { name: "minimal", label: "Minimal", swatch: "#555555" },
  { name: "garden", label: "Garden", swatch: "#7A9A6B" },
  { name: "modern", label: "Modern", swatch: "#1A1A1A" },
  { name: "cinematic", label: "Cinematic", swatch: "#C9A96E" },
  { name: "artdeco", label: "Art Deco", swatch: "#D4A73A" },
  { name: "boho", label: "Boho", swatch: "#C46947" },
  { name: "coastal", label: "Coastal", swatch: "#4A7898" },
  { name: "vintage", label: "Vintage", swatch: "#A32B3A" },
  { name: "daisy", label: "Daisy", swatch: "#2E56A3" },
  { name: "rustic", label: "Rustic", swatch: "#8B5A2B" },
  { name: "watercolor", label: "Watercolor", swatch: "#C9A7C5" },
  { name: "tropical", label: "Tropical", swatch: "#2F6B4A" },
  { name: "whimsical", label: "Whimsical", swatch: "#E3A1B8" },
  { name: "regal", label: "Regal", swatch: "#7A3E5F" },
  { name: "industrial", label: "Industrial", swatch: "#4A4A4A" },
];

export default function TemplateSwitcher() {
  const { data, update } = useWedding();
  const active = data.theme ?? "elegant";

  function pick(theme: ThemeName) {
    // Always apply the template's palette when swapping — the user expects
    // template changes to restyle fully, not just swap typography.
    update({ theme, colors: THEME_PALETTES[theme] });
  }

  return (
    <div className="flex items-center gap-2 border-b border-[#EDE8E0] bg-[#FDFBF7] px-4 py-2.5 overflow-x-auto">
      <span
        className="hidden sm:inline text-[9px] font-medium uppercase tracking-[0.3em] text-[#B8A48E] mr-2 flex-shrink-0"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Template
      </span>
      {TEMPLATES.map((t) => {
        const isActive = active === t.name;
        const isPremium = isPremiumTheme(t.name);
        return (
          <button
            key={t.name}
            type="button"
            onClick={() => pick(t.name)}
            title={isPremium ? `${t.label} — Premium` : t.label}
            className="flex h-7 items-center gap-1.5 rounded-full border px-3 text-[10px] font-medium uppercase tracking-[0.15em] transition-all duration-300 flex-shrink-0"
            style={{
              fontFamily: "var(--font-dm-sans)",
              borderColor: isActive ? t.swatch : "#E0D9CE",
              background: isActive ? `${t.swatch}12` : "white",
              color: isActive ? t.swatch : "#8B7355",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: t.swatch }}
            />
            {t.label}
            {isPremium && (
              <svg
                className="h-2.5 w-2.5 flex-shrink-0"
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
          </button>
        );
      })}
    </div>
  );
}
