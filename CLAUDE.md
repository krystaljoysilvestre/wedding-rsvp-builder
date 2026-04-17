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

**Coded with Love** — an AI-powered conversational wedding website builder. Users chat with an AI planner to provide details (names, date, venue, story), and a live preview renders a cinematic wedding website in real time. A form-based Edit panel provides direct field editing alongside the chat.

## Architecture

### Routes

- `/` — Marketing landing page with GSAP scroll animations
- `/builder` — Main builder: split-screen with preview (left) + collapsible chat/edit panel (right)
- `/api/generate` — OpenAI text generation (tagline, story, welcome, note, story_refine)
- `/api/chat` — AI-powered free-form editing via structured JSON responses

### State Flow

All wedding data lives in `WeddingContext` (`src/context/WeddingContext.tsx`), a React Context providing:
- `data: WeddingData` — the full website state (~20 fields)
- `update(partial)` — shallow merge into data (triggers re-render in preview)
- `scrollTarget` / `setScrollTarget` — tells preview to scroll to a section
- `generating` / `setGenerating` — loading overlay state

**Both ChatPanel and EditPanel read/write the same context.** Changes from either panel instantly update the preview.

### Conversation Engine

`src/lib/conversation.ts` defines a step-based flow with 27 steps across 5 phases. Each step has:
- `message` — assistant's prompt text
- `quickReplies` — optional button suggestions
- `selectionOnly` — when true, text input is hidden (user must pick a button)
- `field` — which WeddingData field this step writes to

ChatPanel (`src/components/chat/ChatPanel.tsx`) uses a `stepRef` (not just state) to avoid stale closures in async handlers. This is critical — always read from `stepRef.current` inside `advanceConversation`.

### Theme System

`src/lib/themes.ts` defines 4 themes (romantic, elegant, minimal, cinematic), each with:
- Colors, typography (font family, weight, style), ornament style, section padding, border radius, hero/closing images
- Google Fonts loaded in `layout.tsx` as CSS variables (`--font-cormorant`, `--font-playfair`, `--font-inter`, `--font-cinzel`, etc.)

Custom color motifs override theme accents in `WeddingPreview.tsx` via `useMemo` — hex colors map to curated Unsplash images per palette.

### API Routes

**`/api/generate`** — Takes `{ type, names, theme, ... }`, returns `{ result: string }`. Five prompt templates for different content types. Falls back to hardcoded elegant copy on error.

**`/api/chat`** — Takes `{ message, weddingData, history }`, returns `{ message, updates, suggestions, scrollTo }`. Uses OpenAI to detect intent and return structured field updates for non-linear editing.

### Image Handling

`src/lib/image.ts` provides `processImage()` — resizes to max 1600x1200 via canvas, returns object URL. Designed for easy swap to Vercel Blob (replace object URL return with blob upload URL). Three image fields: `heroImage`, `closingImage`, `logoImage`.

## Key Patterns

**Field → Section Mapping**: Both ChatPanel and EditPanel maintain maps (`STEP_TO_SECTION`, `FIELD_SECTION`) that connect data fields to preview section IDs (`section-hero`, `section-details`, etc.). When a field changes, `setScrollTarget` scrolls the preview to that section.

**Ornament Component**: `src/components/preview/Ornament.tsx` renders theme-appropriate decorative elements (floral leaves for romantic, geometric diamonds for elegant, nothing for minimal, lines for cinematic). Used consistently across all preview sections.

**Separate Names**: Couple names are stored as `name1` and `name2` (not a single string). The `displayNames()` helper in `types.ts` combines them. Preview components receive both props directly — HeroSection renders them as separate animated elements.

**GSAP in Preview**: `WeddingPreview.tsx` manages all GSAP animations in a single `useEffect` with `gsap.context()`. Always call `ctx.revert()` in cleanup. ScrollTrigger uses the scroll container ref as `scroller`, not the window.

**Hydration Safety**: The landing page uses pre-computed particle data (not `Math.random()`) to avoid SSR/client mismatches. Any randomized visual elements must be deterministic or rendered only in `useEffect`.

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

Three project skills are available:

- `/preview-section` — Scaffold a new wedding template section (gallery, map, etc.) with correct props, theme integration, scroll targeting, and GSAP animation hooks
- `/chat-step` — Add a new conversation step to the guided onboarding flow with proper type, handler, field mapping, and romantic tone
- `/theme-variant` — Add a new visual theme (bohemian, rustic, etc.) with fonts, colors, ornaments, and landing page template card

@AGENTS.md
