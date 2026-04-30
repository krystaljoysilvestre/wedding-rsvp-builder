"use client";

import type { TimelineItem } from "@/lib/types";
import { inputClass } from "./FormField";
import SuggestButton from "./SuggestButton";

interface TimelineEditorProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export default function TimelineEditor({
  items,
  onChange,
}: TimelineEditorProps) {
  function updateItem(index: number, field: keyof TimelineItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { label: "", time: "" }]);
  }

  return (
    <div className="space-y-2.5">
      {items.length === 0 && (
        <SuggestButton<TimelineItem>
          type="timeline"
          onResult={(generated) => onChange(generated)}
          label="Suggest a typical timeline"
        />
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            type="text"
            value={item.time}
            onChange={(e) => updateItem(i, "time", e.target.value)}
            placeholder="4:00 PM"
            className={`${inputClass} !w-24 flex-shrink-0`}
          />
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(i, "label", e.target.value)}
            placeholder="Event name"
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="mt-2 flex-shrink-0 text-[#C4B8A4] transition-colors hover:text-[#8B7355]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#D4C9B8] px-3 py-2 text-[11px] font-medium text-[#8B7355] transition-colors hover:border-[#B8A48E] hover:bg-[#FAF7F2]"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add event
      </button>
    </div>
  );
}
