import type { ReactNode } from "react";

// Minimal layout for the preview-demo route. Inherits the fonts + html shell
// from the root layout (so CSS vars like --font-cormorant still resolve), but
// adds no global chrome of its own. Keeps the iframe payload lean.
export default function PreviewDemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
