"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WeddingProvider, useWedding } from "@/context/WeddingContext";
import EditPanel from "@/components/edit/EditPanel";
import WeddingPreview from "@/components/preview/WeddingPreview";
import { useIsMobile } from "@/lib/useIsMobile";
import { THEME_NAMES, THEME_PALETTES } from "@/lib/themes";
import type { ThemeName } from "@/lib/types";

type MobileTab = "preview" | "edit";

function ThemeQueryInitializer() {
  const searchParams = useSearchParams();
  const { update } = useWedding();

  useEffect(() => {
    const raw = searchParams.get("theme");
    if (!raw) return;
    if (!THEME_NAMES.includes(raw as ThemeName)) return;
    const theme = raw as ThemeName;
    update({ theme, colors: THEME_PALETTES[theme] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function BuilderPage() {
  const isMobile = useIsMobile();

  return (
    <WeddingProvider>
      <Suspense fallback={null}>
        <ThemeQueryInitializer />
      </Suspense>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </WeddingProvider>
  );
}

// ─── Mobile: 2-tab layout (preview / edit) ────────────────────────────

function MobileLayout() {
  const [tab, setTab] = useState<MobileTab>("edit");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FDFBF7]">
      <div className="flex border-b border-[#EDE8E0] bg-[#FDFBF7]">
        <MobileTabButton
          label="Preview"
          active={tab === "preview"}
          onClick={() => setTab("preview")}
        />
        <MobileTabButton
          label="Edit"
          active={tab === "edit"}
          onClick={() => setTab("edit")}
        />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 ${tab === "preview" ? "block" : "hidden"}`}
        >
          <WeddingPreview />
        </div>
        <div
          className={`absolute inset-0 ${tab === "edit" ? "block" : "hidden"}`}
        >
          <EditPanel />
        </div>
      </div>
    </div>
  );
}

function MobileTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
      style={{ color: active ? "#1A1A1A" : "#B8A48E" }}
    >
      {label}
      <span
        className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-[#1A1A1A] transition-all duration-400"
        style={{
          width: active ? 32 : 0,
          opacity: active ? 1 : 0,
        }}
      />
    </button>
  );
}

// ─── Desktop: split-screen with collapsible edit panel ────────────────

function DesktopLayout() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Preview — left side */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-w-0 flex-1 overflow-hidden">
          <WeddingPreview />
        </div>
      </div>

      {/* Right panel — collapsible */}
      <div
        className="relative flex shrink-0 border-l border-[#EDE8E0]"
        style={{
          width: panelOpen ? undefined : 48,
          transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Collapsed peek strip */}
        <div
          className="absolute inset-0 flex flex-col items-center bg-[#FDFBF7]"
          style={{
            opacity: panelOpen ? 0 : 1,
            pointerEvents: panelOpen ? "none" : "auto",
            transition: "opacity 400ms ease",
            transitionDelay: panelOpen ? "0ms" : "300ms",
          }}
        >
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="group flex h-full w-full flex-col items-center justify-center gap-4 transition-colors hover:bg-[#FAF7F2]"
          >
            <svg
              className="h-4 w-4 text-[#B8A48E] transition-colors duration-300 group-hover:text-[#5C4F3D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              />
            </svg>
            <span
              className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#B8A48E] transition-colors duration-300 group-hover:text-[#5C4F3D]"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Edit
            </span>
          </button>
        </div>

        {/* Full panel */}
        <div
          className="flex h-full w-full flex-col md:w-100 lg:w-105"
          style={{
            opacity: panelOpen ? 1 : 0,
            transform: panelOpen ? "translateX(0)" : "translateX(20px)",
            pointerEvents: panelOpen ? "auto" : "none",
            transition:
              "opacity 400ms ease, transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: panelOpen ? "200ms" : "0ms",
          }}
        >
          {/* Header */}
          <div className="flex items-center border-b border-[#EDE8E0] bg-[#FDFBF7] px-4 py-3">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="text-[#D4C9B8] transition-colors hover:text-[#5C4F3D]"
              title="Collapse panel"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
            <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
              Edit
            </span>
          </div>

          {/* Edit panel */}
          <div className="flex-1 overflow-hidden">
            <EditPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
