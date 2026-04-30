"use client";

import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { getTheme, THEME_PALETTES } from "@/lib/themes";
import TemplatePicker from "@/components/edit/TemplatePicker";
import type { ThemeName } from "@/lib/types";

// Compact trigger that shows the current template label and opens the
// full TemplatePicker modal. Lives in the preview header so styling
// choices are visible alongside the rendered preview, not buried inside
// Step 1 (which is about content, not look).
export default function TemplatePickerButton() {
  const { data, update } = useWedding();
  const [open, setOpen] = useState(false);
  const themeLabel = getTheme(data.theme).label;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#5C4F3D]">
          Change style:{" "}
          <span className="font-medium text-[#1A1A1A]">{themeLabel}</span>
        </span>
        <span className="text-[#C4B8A4]" aria-hidden>
          ·
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[12px] font-medium text-[#5C4F3D] underline decoration-[#A09580] underline-offset-2 transition-colors hover:text-[#1A1A1A] hover:decoration-[#1A1A1A]"
        >
          Change
        </button>
      </div>
      <TemplatePicker
        open={open}
        current={data.theme}
        onSelect={(theme: ThemeName) => {
          update({ theme, colors: THEME_PALETTES[theme] });
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
