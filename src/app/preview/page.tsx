"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WeddingProvider } from "@/context/WeddingContext";
import WeddingPreview from "@/components/preview/WeddingPreview";
import type { WeddingData } from "@/lib/types";

// Owner-only fullscreen preview. Reads the editor's draft from localStorage
// so a recipient on a different browser/session sees an empty fallback —
// the page is naturally tied to the owner's machine.
//
// SECURITY NOTE — TEMPORARY:
// localStorage is a poor-man's session check until real auth ships
// (see ARCHITECTURE.md Phase 2). It is NOT a security guarantee:
//   - Same-machine attackers (e.g. shared computer) can read localStorage.
//   - Anyone with localStorage write access can fake an owner session.
// When `@auth/drizzle-adapter` lands, replace the localStorage check with a
// server-side session check + signed `/preview/[siteId]` per
// ARCHITECTURE.md → "Routing topology". The interim doesn't aim to be
// secure — it just keeps `/preview` from rendering on a stranger's
// browser, which is enough to deter casual link-bypass.
export default function PreviewPage() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("wedding-builder-draft");
      if (stored) {
        setData(JSON.parse(stored) as WeddingData);
      }
    } catch {
      // Corrupt localStorage — treat as empty.
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-[18px] font-medium text-[#1A1A1A]">
            Preview unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#5C4F3D]">
            This preview is only visible from the browser where you&rsquo;re
            building the site. Open this page in the same browser, or sign in
            once accounts are available.
          </p>
          <Link
            href="/builder"
            className="mt-5 inline-block text-[12px] font-medium text-[#1A1A1A] underline underline-offset-2 hover:no-underline"
          >
            Go to builder →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <WeddingProvider initialData={data} demoMode>
        <WeddingPreview />
      </WeddingProvider>
    </div>
  );
}
