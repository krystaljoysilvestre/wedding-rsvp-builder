# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev      # Start dev server (Next.js 16, Turbopack)
npm run build    # Production build (also runs TypeScript type-check)
npm run lint     # ESLint
npm start        # Serve production build
```

No test framework is configured. Verify changes with `npm run build` (catches type errors).

## Project Overview

**Coded with Love** — an AI-powered wedding website builder. The flow is form-first: users see a fully-rendered preview from frame one (with curated dummy content per template) and edit it through a step-based form on the side. AI is surfaced as inline assist (✨ Generate) on a few content fields (tagline, story, welcome, note-to-guests) — not as a chat driver.

For the **target architecture and phase roadmap** (auth, Postgres, RSVP system, publishing, payments, admin dashboard), see [ARCHITECTURE.md](./ARCHITECTURE.md). Read it before architectural work.

## Architecture

### Routes

- `/` — Marketing landing page with GSAP scroll animations + template gallery + preview modal
- `/builder` — Main builder: edit panel on the left, live preview on the right (collapsible). Mobile uses a Preview/Edit tab toggle.
- `/preview-demo/[theme]` — Internal full-template preview used by gallery iframes and the modal preview. Uses `demoMode=true` so click-to-edit, hover affordances, and the onboarding hint are all suppressed.
- `/api/generate` — OpenAI text generation (`tagline`, `story`, `welcome`, `note`, `story_refine`). Accepts an optional `tone` override that takes precedence over the theme tone in the prompt.

### State Flow

All wedding data lives in `WeddingContext` (`src/context/WeddingContext.tsx`), a React Context providing:
- `data: WeddingData` — the full website state
- `update(partial)` — shallow merge into `data` (triggers re-render in preview)
- `scrollTarget` / `setScrollTarget` — tells the preview to scroll to a specific section ID
- `editTarget` / `setEditTarget` — set by preview-section clicks; consumed by `EditPanel` (opens the right step + scrolls + briefly highlights the field) and `MobileLayout` (auto-switches to the Edit tab)
- `activeSections` / `setActiveSections` — preview sections that correspond to whatever step is currently open in the editor; drives the bidirectional "this is what I'm editing right now" highlight
- `generating` / `setGenerating` — loading overlay state for AI calls
- `demoMode: boolean` — when true, suppresses interactive affordances (click-to-edit, hover pills, onboarding hint). Used by `/preview-demo/[theme]`.

### Theme System

`src/lib/themes.ts` defines **17 themes** (romantic, elegant, minimal, cinematic, garden, modern, artdeco, boho, coastal, vintage, daisy, rustic, watercolor, tropical, whimsical, regal, industrial). Each `ThemeConfig` includes:
- Colors, typography (font family, weight, style), ornament style, section padding, border radius, hero/closing images
- `sections: SectionId[]` — **per-theme section curation**: which sections appear and in what order. Hero is conventionally first, Closing last; themes vary the middle. Minimal is stripped to 4 sections; Industrial leads with logistics; Cinematic puts countdown right after Hero, etc.
- `isPremium?: boolean` — visual marker only; payment gating ships in Phase 5 of [ARCHITECTURE.md](./ARCHITECTURE.md).

Google Fonts are loaded in `layout.tsx` as CSS variables (`--font-cormorant`, `--font-playfair`, `--font-inter`, `--font-cinzel`, etc.).

Custom color motifs override theme accents in `WeddingPreview.tsx` via `useMemo` — hex colors map to curated Unsplash images per palette.

### Section System

There are **16 section types** in total, all enumerated by `SectionId` in `src/lib/themes.ts`:

**Core (always available):** `hero`, `story`, `countdown`, `details`, `timeline`, `dresscode`, `rsvp`, `closing`

**Optional:** `gallery`, `travel`, `registry`, `faq`, `weddingParty`, `map`, `hashtag`, `saveTheDate`

Each section is registered in `SECTION_METADATA` with a `label`, `description`, and optional `isPremium` flag. The metadata catalog is the source of truth for the section manager UI and any "what sections exist?" lookup.

**User-customized order:** When `data.userSections` is non-empty, it overrides the theme's default `sections` array. Hero is always force-pinned to slot 0 by the renderer regardless. Users manage this via the **SectionManager** in Step 4 of the editor (drag-to-reorder via `@dnd-kit/sortable`, plus add/remove).

**Section rendering** in `WeddingPreview.tsx` is driven by a `sectionsById: Record<SectionId, ReactNode>` map and a `sectionList` derived from `data.userSections ?? theme.sections`. Toggle-gated sections (`countdown`, `rsvp`) resolve to `null` when their toggle is off in non-demoMode.

### API Routes

**`/api/generate`** — Takes `{ type, names, theme, tone?, input?, story?, instruction? }`, returns `{ result: string }`. Five prompt templates (`tagline`, `story`, `welcome`, `note`, `story_refine`). Falls back to hardcoded copy on error. The optional `tone` field overrides the theme tone — the AI Generate dropdown uses this to offer Romantic / Casual / Heartfelt / Witty / Cinematic variants.

### Image Handling

`src/lib/image.ts` provides `processImage()` — resizes to max 1600×1200 via canvas, returns an object URL. Designed for easy swap to Vercel Blob (replace object-URL return with blob upload URL). Image fields on `WeddingData`: `heroImage`, `closingImage`, `logoImage`, `galleryImages` (array).

## Key Patterns

**Field → Section Mapping**: `EditPanel.tsx` maintains two maps:
- `FIELD_SECTION` (field name → preview section ID) — drives `setScrollTarget` when a field gets focus, so the preview scrolls to where the change will appear.
- `FIELD_TO_STEP` (field name → step number 1/2/3/4 or "advanced") — used by the `editTarget` effect; preview-section clicks land on the right step.

**STEP_TO_SECTIONS** in `EditPanel.tsx` is the inverse — when a step is open, which preview sections light up as "active."

**Click-to-edit**: Each preview section is wrapped in `ClickToEdit` (defined inside `WeddingPreview.tsx`). Hover shows a small `Edit` pill in the top-right; click anywhere on the section sets `editTarget` to that section's primary field. The editor's `useEffect` watches `editTarget`, opens the matching step, scrolls to the field, briefly applies a `field-highlight` class. Disabled in `demoMode`.

**Active-section sync**: When the user opens a step, `EditPanel` writes to `activeSections` based on `STEP_TO_SECTIONS`. Each `ClickToEdit` reads `active = activeSections.includes(id)` and renders a stronger ring + bg tint. A brief flash overlay (`section-activate-flash` keyframe in `globals.css`) plays when a section transitions into the active state.

**Debounced field updates**: Text inputs use `DebouncedInput` / `DebouncedTextarea` from `BlurField.tsx` — they hold local state and commit to the wedding context 250ms after the last keystroke (with a flush on blur as a safety net). Selects, toggles, color pickers, and image uploads commit immediately.

**Ornament Component**: `src/components/preview/Ornament.tsx` renders theme-appropriate decorative dividers (floral leaves for romantic, geometric diamonds for elegant, nothing for minimal, lines for cinematic). Used consistently across all preview sections.

**Separate Names**: Couple names are stored as `name1` and `name2` (not a single string). The `displayNames()` helper in `types.ts` combines them. `HeroSection` renders them as separate animated elements (vertical Marisol / & / Tate stacking).

**GSAP in Preview**: `WeddingPreview.tsx` manages all GSAP animations in a single `useEffect` with `gsap.context()`. Always call `ctx.revert()` in cleanup. ScrollTrigger uses the scroll container ref as `scroller`, not the window.

**Hydration Safety**: `CountdownSection` initializes its time state to all-zeros and populates real values via `useEffect` — `Date.now()` differs between SSR and client and was breaking hydration. Any time-dependent or random visual elements must be deterministic or rendered only in `useEffect`. The landing page also uses pre-computed particle data (not `Math.random()`).

## Design Palette

The editor UI uses a consistent warm palette:
- Backgrounds: `#FDFBF7`, `#FAF7F2`, `#F5F3EF`
- Borders: `#EDE8E0`, `#E0D9CE`, `#DDD5CA`
- Text: `#1A1A1A`, `#2C2C2C`, `#5C4F3D`, `#8B7355`
- Muted: `#A09580`, `#B8A48E`, `#C4B8A4`, `#D4C9B8`

Match these values when adding new UI elements to maintain visual consistency.

## Environment

Requires `OPENAI_API_KEY` in `.env.local` for AI features. The app works without it — AI calls fall back to default copy.

## Custom Skills

- `/preview-section` — Scaffold a new wedding template section. After scaffolding, register the section in `SECTION_METADATA` (with `label` + `description` + optional `isPremium`), add it to `sectionsById` in `WeddingPreview.tsx`, add per-section dummy data to `SHARED_OPTIONAL_DUMMY` in `dummyData.ts`, and add an editor block in Step 4 of `EditPanel.tsx`.
- `/theme-variant` — Add a new visual theme. Includes the `sections: SectionId[]` field on `ThemeConfig` for curating which sections appear and in what order. See [TEMPLATES.md](./TEMPLATES.md) for a non-technical contributor guide.

For the broader visual-collaboration playbook (briefs that work, the brief→screenshot→critique loop, add-vs-refine judgment, palette refresh), see [DESIGN.md](./DESIGN.md).

@AGENTS.md
@ARCHITECTURE.md

