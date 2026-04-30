"use client";

import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { displayNames } from "@/lib/types";

type SuggestType = "wedding_party" | "faq" | "timeline";

interface SuggestButtonProps<T> {
  type: SuggestType;
  onResult: (items: T[]) => void;
  label?: string;
}

// Calls /api/generate with a list-type request and hands the resulting array
// off to the parent editor. Pulls the names + (for timeline) ceremony time
// and venue from WeddingContext so parents don't need to thread props.
export default function SuggestButton<T>({
  type,
  onResult,
  label = "Suggest a starter set",
}: SuggestButtonProps<T>) {
  const { data } = useWedding();
  const [loading, setLoading] = useState(false);

  async function suggest() {
    if (loading) return;
    setLoading(true);
    try {
      const names = displayNames(data.name1, data.name2);
      const context: Record<string, string | undefined> = { names };
      if (type === "timeline") {
        context.ceremonyTime = data.ceremonyTime;
        context.ceremonyVenue = data.ceremonyVenue;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...context }),
      });
      const json = (await res.json()) as { result?: T[] };
      if (Array.isArray(json.result)) onResult(json.result);
    } catch (err) {
      console.error("SuggestButton error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={suggest}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#D4C9B8] bg-white px-3 py-2 text-[12px] font-medium text-[#5C4F3D] transition-colors hover:border-[#1A1A1A] hover:bg-[#FAF7F2] hover:text-[#1A1A1A] disabled:cursor-wait disabled:opacity-60"
    >
      {loading ? (
        <svg
          className="h-3 w-3 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
          />
        </svg>
      )}
      {loading ? "Generating…" : label}
    </button>
  );
}
