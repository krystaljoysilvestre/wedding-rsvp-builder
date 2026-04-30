"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";

function relative(d: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function LastSaved() {
  const { lastSavedAt } = useWedding();
  const [, setTick] = useState(0);

  // Re-render every 30s so the relative time stays roughly fresh.
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  return (
    <span
      className="text-[10px] italic text-[#A09580]"
      title={lastSavedAt.toLocaleString()}
    >
      Saved · {relative(lastSavedAt)}
    </span>
  );
}
