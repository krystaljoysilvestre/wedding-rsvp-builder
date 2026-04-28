---
name: preview-section
description: Create a new preview section for the wedding template. Use when adding a new visual section to the wedding website preview (e.g. gallery, map, accommodation).
---

For the visual-design considerations this skill doesn't cover (rhythm with neighboring sections, ornament continuity, mobile breakpoint feel), see [DESIGN.md](../../../DESIGN.md) section 7.

When creating a new preview section:

1. **Build the section component** at `src/components/preview/{SectionName}Section.tsx`. Follow the existing pattern:
   - Accept `theme: ThemeConfig` and `viewport: Viewport` props
   - Use `theme.sectionPadding` / `theme.sectionPaddingMobile` for padding
   - Use `theme.headingFont`, `theme.headingWeight`, `theme.headingStyle` for headings
   - Use `theme.bodyFont`, `theme.bodyWeight` for body text
   - Use `theme.labelSpacing` for uppercase label letter-spacing
   - Use the `<Ornament>` component from `./Ornament.tsx` for decorative dividers
   - Add `className="reveal-section"` to the root `<section>` for GSAP scroll animation

2. **Register the section ID** in `src/lib/themes.ts`:
   - Add the new ID to the `SectionId` union type.
   - Add an entry to `SECTION_METADATA` with `label`, `description`, and optional `isPremium: true`. This drives the section manager UI.

3. **Add to data shape** in `src/lib/types.ts`:
   - Add the new field(s) to `WeddingData`. For complex shapes (lists), define a sub-interface (see `RegistryLink`, `FaqItem`, `PartyMember` for examples).

4. **Add dummy content** in `src/lib/dummyData.ts`:
   - Add the new field(s) to `SHARED_OPTIONAL_DUMMY` so every theme has believable preview content out of the box.

5. **Wire the section into the preview** in `src/components/preview/WeddingPreview.tsx`:
   - Import the new section component.
   - Add a new entry to the `sectionsById` map keyed by your `SectionId`. Wrap it in `<ClickToEdit id="section-{id}" field="{primaryField}" enabled={!demoMode} active={activeSections.includes("section-{id}")} onActivate={setEditTarget}>`. The `field` should be the primary editable field for that section — used for click-to-edit.
   - If the section is gated by a toggle (like countdown / rsvp), conditionally render the `ClickToEdit` only when `(demoMode || data.someToggle)`.

6. **Wire editor support** in `src/components/edit/EditPanel.tsx`:
   - Add the new field(s) to `FIELD_SECTION` (field → preview section id, used when editor field is focused) and `FIELD_TO_STEP` (field → step number — Step 4 for optional sections, Advanced for color/image overrides).
   - Add an editor block inside Step 4's `Section content` block, conditional on `has({sectionId})`. For list-shaped fields, build a small list editor or extend the helpers in `src/components/edit/OptionalSectionEditors.tsx`.

7. **(Optional) Add to a theme's defaults** in `src/lib/themes.ts`:
   - If your section should ship enabled by default for a given theme, add its id to that theme's `sections` array. Otherwise it'll only appear when the user explicitly adds it via the SectionManager.

8. **Match the design palette**:
   - Backgrounds: `theme.bg` or `theme.bgAlt`
   - Text: `theme.text`, `theme.textMuted`, `theme.accentMuted`
   - Section labels: `fontSize: 10`, `uppercase`, `letterSpacing: theme.labelSpacing`

Verification: `npm run build` passes; the new section appears in the section manager (Step 4 → Add more); adding it from the manager makes it render in the preview with dummy content; click-to-edit on the rendered section navigates to the matching editor block in Step 4.
