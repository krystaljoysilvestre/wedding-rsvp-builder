"use client";

import { useState, type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function FormSection({
  title,
  children,
  defaultOpen = true,
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[#EDE8E0]/60 bg-white/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: open ? "#3D2B1F" : "#8B7355" }}
        >
          {title}
        </span>
        <svg
          className="h-3 w-3 text-[#B8A48E] transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-[#EDE8E0]/60 px-4 pt-4 pb-4">
          <div className="space-y-4">{children}</div>
        </div>
      )}
    </div>
  );
}
