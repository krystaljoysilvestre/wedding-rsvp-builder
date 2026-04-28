"use client";

import { useState, type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  description?: string;
  defaultOpen?: boolean;
  alwaysOpen?: boolean;
  open?: boolean;
  onToggle?: (next: boolean) => void;
  id?: string;
}

export default function FormSection({
  title,
  children,
  description,
  defaultOpen = true,
  alwaysOpen = false,
  open,
  onToggle,
  id,
}: FormSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = alwaysOpen || (isControlled ? open : internalOpen);

  function handleToggle() {
    const next = !isOpen;
    if (isControlled) onToggle?.(next);
    else setInternalOpen(next);
  }

  const Header = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-semibold"
          style={{ color: "#1A1A1A" }}
        >
          {title}
        </div>
        {description && (
          <div className="mt-0.5 text-[12px]" style={{ color: "#8B7355" }}>
            {description}
          </div>
        )}
      </div>
      {!alwaysOpen && (
        <svg
          className="h-3.5 w-3.5 shrink-0 mt-1 text-[#A09580] transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      )}
    </div>
  );

  return (
    <section
      id={id}
      className="border-t border-[#EDE8E0] py-6 first:border-t-0 first:pt-0 scroll-mt-4"
    >
      {alwaysOpen ? (
        <div>{Header}</div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className="block w-full text-left"
        >
          {Header}
        </button>
      )}
      {isOpen && <div className="mt-5 space-y-4">{children}</div>}
    </section>
  );
}
