"use client";

interface TimePickerProps {
  value?: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
}

type Period = "AM" | "PM";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

function parseTime(s?: string): { hour: number; minute: number; period: Period } {
  const fallback = { hour: 4, minute: 0, period: "PM" as Period };
  if (!s) return fallback;
  const trimmed = s.trim().toLowerCase();

  // 24-hour like "16:00" or "16:30" (no am/pm marker)
  if (!/(am|pm)/.test(trimmed)) {
    const m24 = /^(\d{1,2}):?(\d{2})?$/.exec(trimmed);
    if (m24) {
      let hour = parseInt(m24[1], 10);
      const minute = m24[2] ? parseInt(m24[2], 10) : 0;
      const period: Period = hour >= 12 ? "PM" : "AM";
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
      return { hour, minute, period };
    }
  }

  // 12-hour like "4pm", "4:30 pm", "11:15 AM"
  const m12 = /^(\d{1,2}):?(\d{2})?\s*(am|pm)$/.exec(trimmed);
  if (m12) {
    const hour = parseInt(m12[1], 10);
    const minute = m12[2] ? parseInt(m12[2], 10) : 0;
    const period = m12[3].toUpperCase() as Period;
    return { hour, minute, period };
  }

  return fallback;
}

function formatTime(hour: number, minute: number, period: Period): string {
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
}

const pickerSelectClass =
  "rounded-md border border-[#E0D9CE] bg-white px-2 py-1.5 text-[13px] text-[#1A1A1A] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none transition-all appearance-none cursor-pointer";

export default function TimePicker({
  value,
  onChange,
  onFocus,
}: TimePickerProps) {
  const isSet = Boolean(value);

  if (!isSet) {
    return (
      <button
        type="button"
        onClick={() => {
          onFocus?.();
          onChange(formatTime(4, 0, "PM"));
        }}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#E0D9CE] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5C4F3D] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
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
        Add time
      </button>
    );
  }

  const parsed = parseTime(value);

  function update(patch: Partial<{ hour: number; minute: number; period: Period }>) {
    const next = { ...parsed, ...patch };
    onChange(formatTime(next.hour, next.minute, next.period));
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Hour"
        value={parsed.hour}
        onChange={(e) => update({ hour: parseInt(e.target.value, 10) })}
        onFocus={onFocus}
        className={pickerSelectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-[#5C4F3D]">:</span>
      <select
        aria-label="Minute"
        value={parsed.minute}
        onChange={(e) => update({ minute: parseInt(e.target.value, 10) })}
        onFocus={onFocus}
        className={pickerSelectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <div className="ml-1 inline-flex overflow-hidden rounded-md border border-[#E0D9CE]">
        {(["AM", "PM"] as Period[]).map((p) => {
          const active = parsed.period === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => update({ period: p })}
              onFocus={onFocus}
              aria-pressed={active}
              className={`px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white text-[#5C4F3D] hover:bg-[#FAF7F2]"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear time"
        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#FAF7F2] hover:text-[#C53030]"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
