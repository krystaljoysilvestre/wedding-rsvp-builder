"use client";

import { useRef, useState } from "react";
import type { StoryMilestone } from "@/lib/types";
import { processImage, validateFile } from "@/lib/image";
import { inputClass } from "./FormField";

interface StoryTimelineEditorProps {
  items: StoryMilestone[];
  onChange: (items: StoryMilestone[]) => void;
}

export default function StoryTimelineEditor({
  items,
  onChange,
}: StoryTimelineEditorProps) {
  function updateItem(
    index: number,
    field: keyof StoryMilestone,
    value: string | undefined,
  ) {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { year: "", label: "" }]);
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            type="text"
            value={item.year}
            onChange={(e) => updateItem(i, "year", e.target.value)}
            placeholder="2019"
            className={`${inputClass} w-20! shrink-0`}
          />
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="First met at the bookstore"
            className={`${inputClass} flex-1`}
          />
          <MilestoneImageButton
            value={item.image}
            onChange={(url) => updateItem(i, "image", url)}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            aria-label="Remove milestone"
            className="mt-2 shrink-0 text-[#C4B8A4] transition-colors hover:text-[#8B7355]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#D4C9B8] px-3 py-2 text-[11px] font-medium text-[#8B7355] transition-colors hover:border-[#B8A48E] hover:bg-[#FAF7F2]"
      >
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
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add milestone
      </button>
    </div>
  );
}

// ─── Compact image button (per-milestone) ──────────────────────────────

function MilestoneImageButton({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    const err = validateFile(file);
    if (err) return;
    setLoading(true);
    try {
      const url = await processImage(file);
      onChange(url);
    } catch {
      /* swallow — keep the row usable */
    } finally {
      setLoading(false);
    }
  }

  if (value) {
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Replace milestone image"
          className="block h-10 w-10 overflow-hidden rounded-lg border border-[#E0D9CE] bg-cover bg-center transition-opacity hover:opacity-80"
          style={{ backgroundImage: `url('${value}')` }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          aria-label="Remove milestone image"
          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#E0D9CE] bg-white text-[#8B7355] shadow-sm transition-colors hover:text-[#C53030]"
        >
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        aria-label="Add milestone image"
        title="Add image"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#D4C9B8] bg-white text-[#A09580] transition-colors hover:border-[#B8A48E] hover:bg-[#FAF7F2] disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#B8A48E] border-t-transparent" />
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
