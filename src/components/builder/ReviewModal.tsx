"use client";

import { useEffect } from "react";
import { useWedding, WeddingProvider } from "@/context/WeddingContext";
import WeddingPreview from "@/components/preview/WeddingPreview";
import Tooltip from "./Tooltip";

interface ReviewModalProps {
  onClose: () => void;
}

// HubSpot-style review modal: ~32 px from each viewport edge, dimmed
// backdrop, white frame with header / body / footer. Body renders the
// user's wedding site without editor chrome (demoMode). Footer holds an
// "Open in new tab" link + a disabled "Publish" CTA placeholder until
// the publishing pipeline ships in Phase 4 of ARCHITECTURE.md.
//
// "Open in new tab" → opens `/preview`, which hydrates from localStorage
// and is owner-only by construction (other browsers have empty
// localStorage and see a fallback). This is intentionally separate from
// the URL-hash `/share` flow used by ShareDraftButton — `/share` is
// public-shareable + watermarked; `/preview` is the owner's full-fidelity
// view.
//
// Same-document rendering inside the modal means user-uploaded images
// (object URLs) render correctly. The new-tab `/preview` route also
// reads the same browser's localStorage so photos render there too.
export default function ReviewModal({ onClose }: ReviewModalProps) {
  const { data } = useWedding();

  // Lock body scroll while modal is up.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // ESC closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function openInNewTab() {
    // Opens the owner-only `/preview` route — that page reads its data
    // from this browser's localStorage, so anyone on a different
    // browser/session sees a fallback. See `/preview/page.tsx` for the
    // security note on the localStorage-as-session interim.
    window.open("/preview", "_blank", "noopener");
  }

  return (
    <>
      {/* Dimmed backdrop — clicking it closes the modal. */}
      <div
        className="fixed inset-0 z-90 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal frame */}
      <div
        className="fixed inset-8 z-100 flex flex-col overflow-hidden rounded-xl bg-[#FDFBF7] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE8E0] bg-white px-5 py-3">
          <div className="flex items-baseline gap-2">
            <h2
              id="review-modal-title"
              className="text-[14px] font-medium text-[#1A1A1A]"
            >
              Review your site
            </h2>
            <span className="text-[11px] italic text-[#A09580]">
              How guests will see it
            </span>
          </div>
          <Tooltip label="Back to editor" side="bottom">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to editor"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#F5F3EF] hover:text-[#1A1A1A]"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>

        {/* Body — wedding preview in demoMode (no editor chrome). */}
        <div className="flex-1 overflow-hidden">
          <WeddingProvider initialData={data} demoMode>
            <WeddingPreview />
          </WeddingProvider>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#EDE8E0] bg-white px-5 py-3">
          <button
            type="button"
            onClick={openInNewTab}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5C4F3D] underline decoration-[#A09580] underline-offset-2 transition-colors hover:text-[#1A1A1A] hover:decoration-[#1A1A1A]"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-4.5L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            Open in new tab
          </button>

          <Tooltip label="Publishing comes next — we're building it" side="top">
            {/* Visual disabled state without the `disabled` attribute, so
                hover events still fire and the tooltip works. */}
            <button
              type="button"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
              className="cursor-not-allowed rounded-lg bg-[#1A1A1A]/30 px-5 py-2.5 text-[13px] font-medium text-white shadow-sm"
            >
              Publish
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
