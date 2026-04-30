"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function buildCalendarGrid(viewMonth: Date): Date[] {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOfGrid = new Date(firstOfMonth);
  startOfGrid.setDate(1 - firstOfMonth.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startOfGrid);
    d.setDate(startOfGrid.getDate() + i);
    days.push(d);
  }
  return days;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  onFocus,
  ariaLabel,
  placeholder = "Your wedding date",
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseDate(value), [value]);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Re-anchor view month when selected date changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const grid = useMemo(() => buildCalendarGrid(viewMonth), [viewMonth]);
  const today = useMemo(() => new Date(), []);

  function selectDate(d: Date) {
    onChange(formatDate(d));
    setOpen(false);
  }

  function prevMonth() {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          onFocus?.();
        }}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-left text-[14px] transition-all hover:border-[#B8A48E] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none ${
          value ? "text-[#1A1A1A]" : "text-[#A09580]"
        } ${className}`}
      >
        <span>{value || placeholder}</span>
        <svg
          className="h-4 w-4 shrink-0 text-[#A09580]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-lg border border-[#EDE8E0] bg-white p-3 shadow-lg"
        >
          {/* Month header */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="rounded-md p-1 text-[#5C4F3D] transition-colors hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-[13px] font-medium text-[#1A1A1A]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="rounded-md p-1 text-[#5C4F3D] transition-colors hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="py-1 text-center text-[10px] font-medium uppercase tracking-widest text-[#A09580]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
              const isSelected = selectedDate ? sameDay(day, selectedDate) : false;
              const isToday = sameDay(day, today);

              const base =
                "aspect-square rounded-md text-[12px] font-medium transition-colors";
              const stateClass = isSelected
                ? "bg-[#1A1A1A] text-white hover:bg-[#2C2C2C]"
                : isToday
                  ? "border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF7F2]"
                  : isCurrentMonth
                    ? "text-[#1A1A1A] hover:bg-[#FAF7F2]"
                    : "text-[#C4B8A4] hover:bg-[#FAF7F2]";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(day)}
                  aria-label={formatDate(day)}
                  aria-current={isSelected ? "date" : undefined}
                  className={`${base} ${stateClass}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
