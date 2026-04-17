---
name: preview-section
description: Create a new preview section for the wedding template. Use when adding a new visual section to the wedding website preview (e.g. gallery, map, accommodation).
---

When creating a new preview section:

1. Create `src/components/preview/{SectionName}Section.tsx`
2. Follow the existing pattern:
   - Accept `theme: ThemeConfig` and `viewport: Viewport` props
   - Use `theme.sectionPadding` / `theme.sectionPaddingMobile` for padding
   - Use `theme.headingFont`, `theme.headingWeight`, `theme.headingStyle` for headings
   - Use `theme.bodyFont`, `theme.bodyWeight` for body text
   - Use `theme.labelSpacing` for uppercase label letter-spacing
   - Use the `<Ornament>` component from `./Ornament.tsx` for decorative dividers
   - Add `className="reveal-section"` to the root `<section>` for GSAP scroll animation
3. Add the section to `WeddingPreview.tsx`:
   - Import the component
   - Wrap in `<div id="section-{name}">` for scroll targeting
   - Conditionally render based on relevant WeddingData fields
4. If the section needs new data:
   - Add fields to `WeddingData` in `src/lib/types.ts`
   - Add to `FIELD_SECTION` in `EditPanel.tsx` mapping to the section ID
   - Add to `STEP_TO_SECTION` in `ChatPanel.tsx`
   - Add form fields in `EditPanel.tsx` under the appropriate `<FormSection>`
5. Match the design palette:
   - Backgrounds: `theme.bg` or `theme.bgAlt`
   - Text: `theme.text`, `theme.textMuted`, `theme.accentMuted`
   - Section labels: `fontSize: 10`, `uppercase`, `letterSpacing: theme.labelSpacing`
