---
name: theme-variant
description: Add a new wedding theme variant (template). Use when creating a new visual style option (e.g. "bohemian", "rustic", "art deco").
---

## Brief template (ask the user to fill in)

```
Name:          <lowercase slug, e.g. "bohemian">
Label:         <display name, e.g. "Bohemian">
Vibe:          <one sentence — e.g. "Sunset desert wedding, warm and free-spirited">
Palette:       <palette description — pick 5 hex values to fit>
Heading font:  <Google Font name, or a vibe; default: an elegant serif>
Body font:     <Google Font name, or a vibe; default: a sans-serif>
Ornament:      floral | geometric | lines | none   (or propose a new style)
Hero image:    <Unsplash URL or search term>
Closing image: <Unsplash URL or search term>
```

If any field is missing, ask the user once for that specific field, then proceed. Don't ask the user to fill in hex values themselves — derive them from the vibe + palette description.

## Files to update

1. **`src/lib/types.ts`** — add the slug to `ThemeName` union.
2. **`src/app/layout.tsx`** — import Google Fonts, add `variable: "--font-<slug>"`, add the variable to the `<html>` className.
3. **`src/lib/themes.ts`** — three updates:
   - Add the full `ThemeConfig` entry to the `themes` object.
   - Add a `{ primary, accent }` entry to `THEME_PALETTES` (seeded into `data.colors` when the template is chosen).
   - Add the slug to `THEME_NAMES` (order matters — this is the order in the TemplateSwitcher).
4. **`src/components/preview/Ornament.tsx`** — only if the brief asks for a new ornament style, add a new SVG branch and extend `OrnamentStyle` in `themes.ts`.
5. **`src/lib/conversation.ts`** — add the label to the `theme` step's `quickReplies` array.
6. **`src/components/chat/ChatPanel.tsx`** — add the slug to the `themeMap` in the theme step handler (around line 240).
7. **`src/components/preview/TemplateSwitcher.tsx`** — add an entry to the local `TEMPLATES` array with `{ name, label, swatch }`.
8. **`src/app/page.tsx`** — add to the landing-page `TEMPLATES` array with hero image URL, 3 swatch colors (bg, accent, text), CSS font variable, and a short description.

## Verification

- `npm run build` — passes with no type errors.
- `npm run dev`, visit `/` — new template card appears in the landing gallery.
- Visit `/builder?theme=<slug>` — preview loads with the new palette, fonts, and ornament.
- Click through TemplateSwitcher pills — swap is smooth, other fields preserved.
- Start a chat at `/builder`, reach the theme step — the new label appears as a quick reply.

## Design principles

- **Distinct, not reskinned.** A new template should feel noticeably different from the existing 4 in typography, spacing, OR ornament — ideally all three.
- **Contrast matters.** Dark themes need WCAG AA contrast on body text. Romantic/Elegant/Minimal/Cinematic all pass — check yours.
- **One hero moment.** Each template has a signature move: Romantic's florals, Elegant's geometric crispness, Minimal's negative space, Cinematic's gold. Your new template should have one too.
- **Two-font max.** A display/heading font + a body font. More than two starts to feel cluttered.

## Reference: read Elegant first

Elegant is the most boilerplate-like. Read it end-to-end before adding a new template:
- `src/lib/themes.ts` → `elegant` config
- `src/components/preview/Ornament.tsx` → the `geometric` branch
- `src/app/page.tsx` → the `Elegant` entry in `TEMPLATES`
- `src/app/layout.tsx` → the Playfair + DM Sans font registration
- `src/components/preview/TemplateSwitcher.tsx` → the `elegant` pill

Every new template needs an analog in each of those places.
