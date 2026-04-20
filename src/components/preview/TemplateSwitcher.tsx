"use client";

import { useWedding } from "@/context/WeddingContext";
import { THEME_PALETTES } from "@/lib/themes";
import type { ThemeName } from "@/lib/types";

const TEMPLATES: { name: ThemeName; label: string; swatch: string }[] = [
  { name: "romantic", label: "Romantic", swatch: "#C4917B" },
  { name: "elegant", label: "Elegant", swatch: "#0A0A0A" },
  { name: "minimal", label: "Minimal", swatch: "#555555" },
  { name: "cinematic", label: "Cinematic", swatch: "#C9A96E" },
];

export default function TemplateSwitcher() {
  const { data, update } = useWedding();
  const active = data.theme ?? "elegant";

  function pick(theme: ThemeName) {
    const patch: Parameters<typeof update>[0] = { theme };
    if (!data.colors) patch.colors = THEME_PALETTES[theme];
    update(patch);
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
        return (
          <button
            key={t.name}
            type="button"
            onClick={() => pick(t.name)}
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
          </button>
        );
      })}
    </div>
  );
}
