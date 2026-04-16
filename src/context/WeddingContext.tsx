"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { WeddingData } from "@/lib/types";

interface WeddingContextValue {
  data: WeddingData;
  generating: boolean;
  scrollTarget: string | null;
  update: (partial: Partial<WeddingData>) => void;
  setGenerating: (v: boolean) => void;
  setScrollTarget: (id: string | null) => void;
  reset: () => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

const INITIAL: WeddingData = {};

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeddingData>(INITIAL);
  const [generating, setGenerating] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const update = useCallback(
    (partial: Partial<WeddingData>) =>
      setData((prev) => ({ ...prev, ...partial })),
    []
  );

  const reset = useCallback(() => setData(INITIAL), []);

  return (
    <WeddingContext.Provider
      value={{ data, generating, scrollTarget, update, setGenerating, setScrollTarget, reset }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used within WeddingProvider");
  return ctx;
}
