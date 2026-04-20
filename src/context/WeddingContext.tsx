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
  /** When true, consumers render the preview without section locks — used
   *  by the `/preview-demo/[theme]` route so gallery iframes and the
   *  preview modal show the full template without "Add your …" hints. */
  demoMode: boolean;
  update: (partial: Partial<WeddingData>) => void;
  setGenerating: (v: boolean) => void;
  setScrollTarget: (id: string | null) => void;
  reset: () => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

const INITIAL: WeddingData = {};

interface WeddingProviderProps {
  children: ReactNode;
  initialData?: WeddingData;
  demoMode?: boolean;
}

export function WeddingProvider({
  children,
  initialData,
  demoMode = false,
}: WeddingProviderProps) {
  const [data, setData] = useState<WeddingData>(initialData ?? INITIAL);
  const [generating, setGenerating] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const update = useCallback(
    (partial: Partial<WeddingData>) =>
      setData((prev) => ({ ...prev, ...partial })),
    []
  );

  const reset = useCallback(() => setData(initialData ?? INITIAL), [initialData]);

  return (
    <WeddingContext.Provider
      value={{
        data,
        generating,
        scrollTarget,
        demoMode,
        update,
        setGenerating,
        setScrollTarget,
        reset,
      }}
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
