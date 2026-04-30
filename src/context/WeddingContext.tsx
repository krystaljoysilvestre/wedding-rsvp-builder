"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { WeddingData } from "@/lib/types";

const STORAGE_KEY = "wedding-builder-draft";

interface WeddingContextValue {
  data: WeddingData;
  generating: boolean;
  scrollTarget: string | null;
  /** Field name the editor should focus + highlight. Set by preview-section
   *  clicks; consumed by EditPanel (opens the right step + scrolls to the
   *  field) and MobileLayout (switches to the Edit tab). Cleared after the
   *  editor handles it. */
  editTarget: string | null;
  /** Preview sections that map to whatever the user is editing right now —
   *  written by EditPanel when its current step or Advanced state changes,
   *  read by WeddingPreview to add an "active" highlight on those sections. */
  activeSections: string[];
  /** When true, consumers render the preview without section locks — used
   *  by the `/preview-demo/[theme]` route so gallery iframes and the
   *  preview modal show the full template without "Add your …" hints. */
  demoMode: boolean;
  /** Timestamp of the last successful localStorage write. Null until the
   *  first save (or always null when persistence is disabled). */
  lastSavedAt: Date | null;
  update: (partial: Partial<WeddingData>) => void;
  setGenerating: (v: boolean) => void;
  setScrollTarget: (id: string | null) => void;
  setEditTarget: (field: string | null) => void;
  setActiveSections: (sections: string[]) => void;
  reset: () => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

const INITIAL: WeddingData = {};

interface WeddingProviderProps {
  children: ReactNode;
  initialData?: WeddingData;
  demoMode?: boolean;
  /** When true, hydrate from + autosave to localStorage. Builder turns this
   *  on; preview/share routes leave it off. */
  persist?: boolean;
}

export function WeddingProvider({
  children,
  initialData,
  demoMode = false,
  persist = false,
}: WeddingProviderProps) {
  const [data, setData] = useState<WeddingData>(initialData ?? INITIAL);
  const [generating, setGenerating] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hydrated, setHydrated] = useState(!persist);

  // One-time hydration from localStorage on mount. Merges stored data
  // *under* the current data so any in-flight updates from sibling effects
  // (e.g. ThemeQueryInitializer applying ?theme= from the URL) win.
  useEffect(() => {
    if (!persist) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WeddingData;
        setData((current) => ({ ...parsed, ...current }));
        setLastSavedAt(new Date());
      }
    } catch {
      // ignore — corrupt storage gets ignored, user just starts fresh
    }
    setHydrated(true);
  }, [persist]);

  // Debounced autosave — fires 400ms after the last change, only after
  // hydration has run so we don't overwrite stored data with the empty
  // initial state.
  useEffect(() => {
    if (!persist || !hydrated) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLastSavedAt(new Date());
      } catch {
        // localStorage might be full or disabled — fail silently
      }
    }, 400);
    return () => clearTimeout(t);
  }, [data, persist, hydrated]);

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
        editTarget,
        activeSections,
        demoMode,
        lastSavedAt,
        update,
        setGenerating,
        setScrollTarget,
        setEditTarget,
        setActiveSections,
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
