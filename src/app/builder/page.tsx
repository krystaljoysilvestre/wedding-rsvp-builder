"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WeddingProvider, useWedding } from "@/context/WeddingContext";
import EditPanel, { type CtaConfig } from "@/components/edit/EditPanel";
import WeddingPreview from "@/components/preview/WeddingPreview";
import Tooltip from "@/components/builder/Tooltip";
import ReviewModal from "@/components/builder/ReviewModal";
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
  const [reviewOpen, setReviewOpen] = useState(false);

  // Desktop ends Step 3 with the full Review modal (preview + publish).
  // Mobile already has a fullscreen preview tab, so it gets a leaner CTA:
  // a muted "Publish" button that taps to a brief inline coming-soon note.
  const desktopCta: CtaConfig = {
    label: "Review & Publish",
    onClick: () => setReviewOpen(true),
  };
  const mobileCta: CtaConfig = {
    label: "Publish",
    onClick: () => {},
    muted: true,
    note: "Publishing comes next — we're building it.",
  };

  return (
    <WeddingProvider persist>
      <Suspense fallback={null}>
        <ThemeQueryInitializer />
      </Suspense>
      {isMobile ? (
        <MobileLayout cta={mobileCta} />
      ) : (
        <DesktopLayout cta={desktopCta} />
      )}
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
    </WeddingProvider>
  );
}

// ─── Mobile: 2-tab layout (preview / edit) ────────────────────────────

interface LayoutProps {
  cta: CtaConfig;
}

function MobileLayout({ cta }: LayoutProps) {
  const [tab, setTab] = useState<MobileTab>("edit");
  const { editTarget } = useWedding();

  // Click-to-edit: a preview section was clicked while the user is on the
  // Preview tab. Switch to Edit so the editor's own useEffect can take
  // over (open the right step, scroll, highlight).
  useEffect(() => {
    if (editTarget) setTab("edit");
  }, [editTarget]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FDFBF7]">
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 ${tab === "preview" ? "block" : "hidden"}`}
        >
          <WeddingPreview />
        </div>
        <div
          className={`absolute inset-0 ${tab === "edit" ? "block" : "hidden"}`}
        >
          <EditPanel cta={cta} />
        </div>
      </div>

      {/* Bottom-fixed tab bar — thumb-friendly on phones; honors the iOS
          safe-area inset so the buttons sit above the home indicator. */}
      <div
        className="flex border-t border-[#EDE8E0] bg-[#FDFBF7]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
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
      className="relative flex-1 py-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
      style={{ color: active ? "#1A1A1A" : "#B8A48E" }}
    >
      {label}
      <span
        className="absolute top-0 left-1/2 h-0.5 -translate-x-1/2 bg-[#1A1A1A] transition-all duration-400"
        style={{
          width: active ? 32 : 0,
          opacity: active ? 1 : 0,
        }}
      />
    </button>
  );
}

// ─── Desktop: split-screen with collapsible edit panel ────────────────

const PANEL_MIN_WIDTH = 320;
const PANEL_MAX_WIDTH = 720;
const PANEL_DEFAULT_WIDTH = 420;
const PANEL_WIDTH_STORAGE_KEY = "editor-panel-width";

function DesktopLayout({ cta }: LayoutProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);

  // Hydrate width from localStorage on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n) && n >= PANEL_MIN_WIDTH && n <= PANEL_MAX_WIDTH) {
          setPanelWidth(n);
        }
      }
    } catch {
      // localStorage unavailable — fall through to default
    }
  }, []);

  // Persist on drag end (skips per-frame writes during the drag itself).
  useEffect(() => {
    if (dragging) return;
    try {
      window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(panelWidth));
    } catch {
      // ignore
    }
  }, [panelWidth, dragging]);

  // Drag handlers + body cursor lock while dragging.
  useEffect(() => {
    if (!dragging) return;
    function onMove(e: PointerEvent) {
      const next = Math.max(
        PANEL_MIN_WIDTH,
        Math.min(PANEL_MAX_WIDTH, e.clientX),
      );
      setPanelWidth(next);
    }
    function onUp() {
      setDragging(false);
    }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — collapsible + resizable. When collapsed, width
          drops to 0 and the preview takes the full viewport; the
          "Open editor" button in WeddingPreview's header brings it back. */}
      <div
        className="relative flex shrink-0 overflow-hidden border-r border-[#EDE8E0]"
        style={{
          width: panelOpen ? panelWidth : 0,
          // Hide the right border when fully collapsed (no panel, no edge).
          borderRightWidth: panelOpen ? 1 : 0,
          // Disable transition during drag so the panel tracks the cursor;
          // re-enable for collapse/expand animation otherwise.
          transition: dragging
            ? "none"
            : "width 600ms cubic-bezier(0.4, 0, 0.2, 1), border-right-width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Full panel */}
        <div
          className="flex h-full w-full flex-col"
          style={{
            opacity: panelOpen ? 1 : 0,
            transform: panelOpen ? "translateX(0)" : "translateX(-20px)",
            pointerEvents: panelOpen ? "auto" : "none",
            transition:
              "opacity 400ms ease, transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: panelOpen ? "200ms" : "0ms",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EDE8E0] bg-[#FDFBF7] px-4 py-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
              Make it yours
            </span>
            <Tooltip label="Collapse editor">
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Collapse editor"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#F5F3EF] hover:text-[#1A1A1A]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <rect x="3" y="5" width="18" height="14" rx="1.5" />
                  <path d="M9 5v14" />
                </svg>
              </button>
            </Tooltip>
          </div>

          {/* Edit panel — desktop suppresses the in-panel Saved/Share row
              because those controls live in the preview toolbar instead. */}
          <div className="flex-1 overflow-hidden">
            <EditPanel showHeaderChrome={false} cta={cta} />
          </div>
        </div>

        {/* Resize handle — sits on the right edge of the panel; invisible
            until hover, then a thin warm strip. Only shown when the panel
            is open. */}
        {panelOpen && (
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor panel"
            className={`absolute top-0 right-0 z-20 h-full w-1.5 cursor-col-resize transition-colors ${
              dragging
                ? "bg-[#1A1A1A]/20"
                : "hover:bg-[#1A1A1A]/10"
            }`}
            style={{ touchAction: "none" }}
          />
        )}
      </div>

      {/* Preview — right side */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-w-0 flex-1 overflow-hidden">
          <WeddingPreview
            onOpenEditor={!panelOpen ? () => setPanelOpen(true) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
