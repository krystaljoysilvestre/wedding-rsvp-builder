# Editor UX Roadmap

How `/builder` evolves from a *form-based site builder* into something that **feels like relief from wedding stress, not another todo list**. Companion to [ARCHITECTURE.md](./ARCHITECTURE.md) — that doc covers system phases (auth, payments, publishing). This doc covers the in-app editor experience.

Source: a "first-time bride-to-be" walkthrough captured 2026-04-29.

## Phase summary

| # | Phase | Effort | Backend? |
|---|---|---|---|
| 1 | Copy & framing pass | 0.5 day | No |
| 2 | Step structure cleanup (kill Step 2) | 1 day | No |
| 3 | Step 4 inline reveal | 1–2 days | No |
| 4 | Address & time UX | 1 day | No |
| 5 | Reassurance (autosave + owner preview) | 1–2 days | None (share-draft removed pending Phase 2 auth) |
| 6 | AI assist for chores | 1–2 days | Uses existing `/api/generate` |
| 7 | Celebration moments | 1 day | No |
| 8 | Mobile polish | 3–5 days | No |

**Suggested order:** 1 → 2 → 3 → 4 ships in ~1 focused week and gives the biggest perceived improvement. 5–8 are independent — pick by what hurts most.

---

## Phase 1 — Copy & framing pass

**Goal:** Every label sounds like something the bride would say to her aunt.

| From | To |
|---|---|
| Hero image | Main photo |
| Closing image | Ending photo |
| Tagline | A few words about you two |
| Welcome message | Welcome note |
| Note to guests | Note to your guests |
| Travel & accommodation | How to get here |
| Map address | Where it is |
| Music playlist URL | Spotify or Apple Music link |
| Save-the-date message | Save-the-date note |
| Wedding hashtag | Your wedding hashtag |
| Step 1 title: "Step 1: Start Your Wedding" | "The basics" |
| Step 1 description | "We'll start here. Everything else is optional." |
| Step 3 title: "Step 3: Details" | "When and where" |
| Step 3 description | "The day's logistics — for your guests." |
| Step 4 description | "Add anything else that makes the site yours." |

**Files:** [src/components/edit/EditPanel.tsx](src/components/edit/EditPanel.tsx), [src/components/edit/SectionManager.tsx](src/components/edit/SectionManager.tsx), [src/components/edit/ImageUpload.tsx](src/components/edit/ImageUpload.tsx).

---

## Phase 2 — Step structure cleanup

**Goal:** Three real steps for three real decisions. Today Step 2 is a single toggle.

- Remove Step 2 entirely.
- The RSVP toggle moves into the bottom of Step 1, just above the Continue button: *"Show an RSVP form on the site (you can wire it up later)."*
- Renumber: old Step 3 → Step 2 (When and where), old Step 4 → Step 3 (Make it personal).
- StepProgress chips: **Basics / Where / Personal touches**.

**Files:**
- [EditPanel.tsx](src/components/edit/EditPanel.tsx) — `StepProgress` steps array, `FIELD_TO_STEP`, `STEP_TO_SECTIONS`, `STEP_TO_PREVIEW`, completion logic, `ContinueButton` labels.

---

## Phase 3 — Step 4 inline reveal

**Goal:** "Make it personal" stops looking like a checklist of 13 forms.

**Today:** SectionManager + below it, all 13 conditional editor blocks each gated on `has(sectionId)`. Adding a section reveals a far-away editor the user has to scroll to.

**New:** the editor block for a newly-added section expands **inline below its row** in the active list, like an accordion, scrolled into view + auto-focused.

**Sketch:**
- `SectionManager` accepts an `editorFor: (id: SectionId) => ReactNode` prop. Each active row renders its editor below itself when expanded.
- Adding a section → push to active list → set new section's row `expanded = true` → scroll + focus.
- Clicking a row toggles its expansion.
- EditPanel's Step 4 simplifies to a single `<SectionManager editorFor={...} />` call.

**Files:**
- [SectionManager.tsx](src/components/edit/SectionManager.tsx) — wire `editorFor` prop, accordion expand-state per row.
- [EditPanel.tsx](src/components/edit/EditPanel.tsx) — pass per-section editors via `editorFor`, drop the gated 13-block.

---

## Phase 4 — Address & time UX

**Goal:** Stop punishing real-world data entry.

- **Addresses → multi-line textarea** with placeholder modeling the Filipino format:
  ```
  Antonio's Tagaytay
  4150 Aguinaldo Highway
  Tagaytay City, Cavite
  ```
  Render with line breaks preserved in [DetailsSection.tsx](src/components/preview/DetailsSection.tsx).
- **Times → real `<TimePicker>`** (custom-styled, 12-hour + AM/PM). If a picker is too heavy, normalize text on blur ("4pm" / "4:00pm" / "16:00" → "4:00 PM").
- **Ceremony type** — drop the dropdown's `Other` option. Make the field optional, or convert to free-text with autosuggest. The current "Other" path produces awkward fallback copy.

**Files:**
- New: `src/components/edit/TimePicker.tsx`.
- [EditPanel.tsx](src/components/edit/EditPanel.tsx) — address textareas, time picker swap.
- [DetailsSection.tsx](src/components/preview/DetailsSection.tsx) — `whiteSpace: "pre-line"` on address paragraph.

---

## Phase 5 — Reassurance & share-draft

**Goal:** Two persistent fears go away: *"Will I lose my work?"* and *"I want my partner to see this."*

**v1 (shipped, partial):** "Last saved · just now" indicator in the preview-header right cluster + `WeddingContext` autosave to localStorage + the `/preview` route (owner-only fullscreen via localStorage). [src/components/builder/LastSaved.tsx](src/components/builder/LastSaved.tsx), [src/app/preview/page.tsx](src/app/preview/page.tsx), [src/context/WeddingContext.tsx](src/context/WeddingContext.tsx).

**v1 share-draft — removed.** A `ShareDraftButton` + `/share` route briefly shipped as a URL-hash partner-preview. Removed because watermarks weren't an adequate guard against using shared URLs as a free publishing channel for premium content. The "Send to my partner" feature returns in v2 only — done properly the first time.

**v2 (after Phase 2 of [ARCHITECTURE.md](./ARCHITECTURE.md)):**
- Reintroduce partner-share as a signed `/preview/[siteId]?token=…` URL — owner-bound, expirable, revocable, premium-aware. See ARCHITECTURE.md Phase 2 bullet.
- Swap "Last saved" copy for a real cloud-saved indicator + recovery prompt on next open.
- Replace the `/preview` interim auth proxy (currently localStorage) with a real session check.

---

## Phase 6 — AI assist for chores

**Goal:** Filling in 8 bridesmaids feels like *approving suggestions*, not data entry.

New `/api/generate` types added to [src/app/api/generate/route.ts](src/app/api/generate/route.ts):
- `wedding_party` — returns 4 sample members with relationship-typical Filipino names + roles.
- `faq` — returns 4–5 typical Filipino-wedding FAQs (parking, dress code, kids, gift preferences, Filipino-time).
- `timeline` — returns a standard 8-event wedding-day timeline.

Each chore-y editor gets a "Suggest sample" button that calls the API and pre-populates rows the user can edit.

**Files:**
- [src/app/api/generate/route.ts](src/app/api/generate/route.ts) — new prompt templates.
- [src/components/edit/OptionalSectionEditors.tsx](src/components/edit/OptionalSectionEditors.tsx) — `PartyEditor` + `FaqEditor` "Suggest" buttons.
- [src/components/edit/TimelineEditor.tsx](src/components/edit/TimelineEditor.tsx) — "Suggest typical timeline" button.

---

## Phase 7 — Celebration moments

**Goal:** Finishing things feels rewarding, not tickbox-y.

- **Step 1 completion** — when `step1Complete` first flips true, a one-shot ✨ pulse plays near the completion line; preview tagline does a single calligraphic shimmer.
- **Photo upload** — subtle "Beautiful" microcopy fades in for 2s.
- **AI tagline returns** — preview tagline fades the new value in with a tiny scale-up.
- **Continue button click** — micro-pulse before the section closes.

Visual polish only. Each effect should be ≤ 200 lines of CSS/animation.

**Files:**
- New: `src/components/edit/CompletionFlash.tsx`.
- [src/app/globals.css](src/app/globals.css) — new keyframes.
- [src/components/preview/WeddingPreview.tsx](src/components/preview/WeddingPreview.tsx) — tagline shimmer hook.

---

## Phase 8 — Mobile polish

**Goal:** First-time mobile users finish the editor as comfortably as desktop users.

- Edit/Preview toggle moves to a bottom-fixed pill bar.
- Edit panel becomes a bottom-sheet drawer that drags up — preview stays visible behind it.
- Touch-target audit: every hit area ≥ 44 px.
- Photo upload uses `capture="environment"` so mobile users can shoot directly.
- Optional: paste-Google-Maps-URL → autofill venue name + address.
- StepProgress sticks during scroll on mobile.

**Files:**
- [src/app/builder/page.tsx](src/app/builder/page.tsx) — `MobileLayout` overhaul.
- [src/components/edit/ImageUpload.tsx](src/components/edit/ImageUpload.tsx) — `capture` attribute.
- New: `src/lib/parseMapsUrl.ts` (optional).

---

## Out of scope

- Multi-language editor (UI stays English; dummy data is Filipino).
- Co-editing with a partner — returns in Phase 5 v2 (post-auth signed-link share); the v1 URL-hash share was removed pending the proper version.
- Auto-translating the guest-facing site to Tagalog.
- Wedding-planner accounts (tracked in ARCHITECTURE.md post-launch).

## Verification

Per phase:
1. `grep -in "hero image\|tagline" src/components/edit/` returns nothing user-facing.
2. StepProgress shows 3 chips; `rsvpEnabled` field lives in Step 1.
3. Adding a Step 4 section inline-expands its editor; no editor blocks visible until added.
4. Times normalize on blur; multi-line addresses preserve line breaks in preview.
5. ReviewModal "Open in new tab" opens `/preview` in a fresh tab (owner-only via localStorage); "Last saved" updates as you type.
6. Each "Suggest" button populates rows from `/api/generate`.
7. Step 1 completion plays ✨ once per session; preview tagline shimmers on AI return.
8. Mobile editor scrolls smoothly with bottom-sheet drawer; iOS Safari photo upload triggers camera.

`npm run build` must pass after each phase.
