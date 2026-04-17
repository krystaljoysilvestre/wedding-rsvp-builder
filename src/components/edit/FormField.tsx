import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{ color: "#8B7355" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Shared input class ──────────────────────────────────────────────

export const inputClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[13px] text-[#2C2C2C] placeholder:text-[#C4B8A4] focus:border-[#B8A48E] focus:ring-2 focus:ring-[#D4C9B8]/30 focus:outline-none transition-all";

export const selectClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[13px] text-[#2C2C2C] focus:border-[#B8A48E] focus:ring-2 focus:ring-[#D4C9B8]/30 focus:outline-none transition-all appearance-none cursor-pointer";

export const textareaClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[13px] text-[#2C2C2C] placeholder:text-[#C4B8A4] focus:border-[#B8A48E] focus:ring-2 focus:ring-[#D4C9B8]/30 focus:outline-none transition-all resize-y";
