"use client";

import { useParams, useSearchParams, notFound } from "next/navigation";
import { WeddingProvider } from "@/context/WeddingContext";
import WeddingPreview from "@/components/preview/WeddingPreview";
import { THEME_NAMES } from "@/lib/themes";
import { DUMMY_DATA } from "@/lib/dummyData";
import type { ThemeName } from "@/lib/types";

// Renders a chosen template with its full dummy data and no builder chrome.
// Consumed by:
//   - gallery iframes (mode=thumbnail) — only the top of the render shows,
//     since the parent iframe wrapper clips to a small height
//   - the preview modal (mode=full) — shows the full scrollable preview
export default function PreviewDemoPage() {
  const params = useParams<{ theme: string }>();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as "thumbnail" | "full") ?? "thumbnail";

  const themeRaw = params.theme;
  if (!THEME_NAMES.includes(themeRaw as ThemeName)) {
    notFound();
  }
  const theme = themeRaw as ThemeName;
  const initialData = { ...DUMMY_DATA[theme], theme };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#FDFBF7",
        // Thumbnail mode: clip to viewport so the iframe's scaled parent
        // only needs the top portion. Full mode: let the page scroll.
        maxHeight: mode === "thumbnail" ? "100vh" : undefined,
        overflow: mode === "thumbnail" ? "hidden" : undefined,
      }}
    >
      <WeddingProvider initialData={initialData} demoMode>
        <WeddingPreview />
      </WeddingProvider>
    </div>
  );
}
