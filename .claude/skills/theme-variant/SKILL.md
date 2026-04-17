---
name: theme-variant
description: Add a new wedding theme variant. Use when creating a new visual style option (e.g. "bohemian", "rustic", "art deco").
---

When adding a new theme:

1. Add the theme name to `ThemeName` union in `src/lib/types.ts`
2. Add a Google Font in `src/app/layout.tsx`:
   - Import from `next/font/google`
   - Create with `variable: "--font-{name}"`
   - Add the variable class to `<html>`
3. Add theme config in `src/lib/themes.ts` → `themes` object:
   ```ts
   themeName: {
     name: "themeName",
     label: "Display Name",
     // Colors
     bg, bgAlt, text, textMuted, accent, accentMuted, border,
     // Typography
     headingFont: "var(--font-{name}), fallback",
     bodyFont: "var(--font-{name}), fallback",
     headingWeight, headingStyle, bodyWeight, labelSpacing,
     // Visuals
     heroOverlay, heroImage, closingImage,
     ornament: "floral" | "geometric" | "none" | "lines",
     borderRadius, dividerWidth,
     sectionPadding, sectionPaddingMobile,
   }
   ```
4. If adding a new ornament style:
   - Add to `OrnamentStyle` type in `themes.ts`
   - Add SVG rendering branch in `src/components/preview/Ornament.tsx`
5. Add as option in:
   - `ChatPanel.tsx` → `themeMap` in the theme step handler
   - `EditPanel.tsx` → theme `<select>` options
   - `conversation.ts` → theme step `quickReplies`
6. Add to landing page `TEMPLATES` array in `src/app/page.tsx` with curated image + colors

Design notes:
- Each theme should feel distinctly different in typography, spacing, and ornament style
- Test all 4 viewports (desktop, tablet, mobile) in the preview
- Ensure dark themes (like cinematic) have proper contrast ratios
