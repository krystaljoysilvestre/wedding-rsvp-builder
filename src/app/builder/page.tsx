"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WeddingProvider, useWedding } from "@/context/WeddingContext";
import ChatPanel from "@/components/chat/ChatPanel";
import EditPanel from "@/components/edit/EditPanel";
import WeddingPreview from "@/components/preview/WeddingPreview";
import TemplateSwitcher from "@/components/preview/TemplateSwitcher";
import { useIsMobile } from "@/lib/useIsMobile";
import { THEME_NAMES, THEME_PALETTES } from "@/lib/themes";
import type { ThemeName } from "@/lib/types";

type Tab = "chat" | "edit";
type MobileTab = "preview" | "chat" | "edit";

function ThemeQueryInitializer() {
  const searchParams = useSearchParams();
  const { data, update } = useWedding();

  useEffect(() => {
    const raw = searchParams.get("theme");
    if (!raw) return;
    if (!THEME_NAMES.includes(raw as ThemeName)) return;
    const theme = raw as ThemeName;
    const patch: Parameters<typeof update>[0] = { theme };
    if (!data.colors) patch.colors = THEME_PALETTES[theme];
    update(patch);
    // Run once on mount — intentionally omit deps so later state updates don't retrigger.
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

// ─── Mobile: 3-tab layout ─────────────────────────────────────────────

function MobileLayout() {
  const [tab, setTab] = useState<MobileTab>("chat");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FDFBF7]">
      {/* Template switcher — always visible */}
      <TemplateSwitcher />

      {/* Mobile tab bar */}
      <div className="flex border-b border-[#EDE8E0] bg-[#FDFBF7]">
        <MobileTabButton label="Preview" active={tab === "preview"} onClick={() => setTab("preview")} />
        <MobileTabButton label="Chat" active={tab === "chat"} onClick={() => setTab("chat")} />
        <MobileTabButton label="Edit" active={tab === "edit"} onClick={() => setTab("edit")} />
      </div>

      {/* Active pane */}
      <div className="flex-1 overflow-hidden">
        {tab === "preview" && <WeddingPreview />}
        {tab === "chat" && <ChatPanel />}
        {tab === "edit" && <EditPanel />}
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

// ─── Desktop: split-screen with collapsible panel ─────────────────────

function DesktopLayout() {
  const [tab, setTab] = useState<Tab>("chat");
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Preview — left side */}
      <div className="flex flex-1 flex-col">
        <TemplateSwitcher />
        <div className="flex-1 overflow-hidden">
          <WeddingPreview />
        </div>
      </div>

      {/* Right panel — collapsible with peek strip */}
      <div
        className="relative flex flex-shrink-0 border-l border-[#EDE8E0]"
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
            {/* Double chevron — expand */}
            <svg
              className="h-4 w-4 text-[#B8A48E] transition-colors duration-300 group-hover:text-[#5C4F3D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>

            {/* Vertical label */}
            <span
              className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#B8A48E] transition-colors duration-300 group-hover:text-[#5C4F3D]"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {tab === "chat" ? "Chat" : "Edit"}
            </span>

            {/* Sparkle icon with glow + pulse */}
            <div className="peek-icon">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="peek-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8A0BF" />
                    <stop offset="40%" stopColor="#BA90C6" />
                    <stop offset="100%" stopColor="#C0DBEA" />
                  </linearGradient>
                </defs>
                <path
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  stroke="url(#peek-grad)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Full panel */}
        <div
          className="flex h-full w-full flex-col md:w-[400px] lg:w-[420px]"
          style={{
            opacity: panelOpen ? 1 : 0,
            transform: panelOpen ? "translateX(0)" : "translateX(20px)",
            pointerEvents: panelOpen ? "auto" : "none",
            transition: "opacity 400ms ease, transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: panelOpen ? "200ms" : "0ms",
          }}
        >
          {/* Tab bar with collapse button */}
          <div className="flex items-center border-b border-[#EDE8E0] bg-[#FDFBF7]">
            {/* Collapse button */}
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="group flex h-full items-center px-3 text-[#D4C9B8] transition-colors duration-300 hover:text-[#5C4F3D]"
              title="Collapse panel"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Tabs */}
            <button
              type="button"
              onClick={() => setTab("chat")}
              className="relative flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: tab === "chat" ? "#1A1A1A" : "#B8A48E" }}
            >
              Chat
              <span
                className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-[#1A1A1A] transition-all duration-400"
                style={{
                  width: tab === "chat" ? 32 : 0,
                  opacity: tab === "chat" ? 1 : 0,
                }}
              />
            </button>
            <button
              type="button"
              onClick={() => setTab("edit")}
              className="relative flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: tab === "edit" ? "#1A1A1A" : "#B8A48E" }}
            >
              Edit Details
              <span
                className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-[#1A1A1A] transition-all duration-400"
                style={{
                  width: tab === "edit" ? 32 : 0,
                  opacity: tab === "edit" ? 1 : 0,
                }}
              />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {tab === "chat" ? <ChatPanel /> : <EditPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
