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
| 9 | Premium pricing UX | 1 day | None directly (front-end only; Stripe lives in [ARCHITECTURE.md](./ARCHITECTURE.md) Phase 5) |

**Suggested order:** 1 → 2 → 3 → 4 ships in ~1 focused week and gives the biggest perceived improvement. 5–8 are independent — pick by what hurts most.

---

## Phase 1 — Copy & framing pass

**Goal:** Every label sounds like something the bride would say to her aunt.

| From | To |
|---|---|
| Hero image | Main photo |
| Closing image | Ending photo |
| Tagline | Your wedding tagline |
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
- Renumber: old Step 3 → Step 2 (When and where), old Step 4 → Step 3 (Customize).
- StepProgress chips: **Basics / Where / Customize**.

**Files:**
- [EditPanel.tsx](src/components/edit/EditPanel.tsx) — `StepProgress` steps array, `FIELD_TO_STEP`, `STEP_TO_SECTIONS`, `STEP_TO_PREVIEW`, completion logic, `ContinueButton` labels.

---

## Phase 3 — Step 4 inline reveal

**Goal:** "Customize" stops looking like a checklist of 13 forms.

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

## Phase 9 — Premium pricing UX

**Goal:** Make the cost of premium content honest in the editor without nagging. Couples see the price the moment they choose a premium item; the actual checkout still happens once at Publish (Phase 5 of [ARCHITECTURE.md](./ARCHITECTURE.md)).

- `SectionInfo` row label shows a price pill instead of the generic gold "Premium" pill when `priceCents > 0` (e.g. **"Premium · PHP 199"**)
- `PremiumPublishNote` (already shipped) updates copy to mention the section's specific price: *"Adds PHP 199 at publish. Watermark removal included."*
- TemplatePicker thumbnails show price overlay on premium themes (e.g. **"PHP 999"** ribbon in the corner)
- Step 3 CTA dynamically rolls up to **"Review & Publish · PHP 1,596"** when items in the cart; reverts to **"Review & Publish"** when nothing premium is selected
- Editor stays unblocked — premium items are addable, droppable, swappable. The cart total is the only signal of pending cost.

> **Templates drive format, fields, AND section availability.**
> - Per-section **format variants** (gallery as `grid` vs `carousel`, story as `prose` vs `timeline`) are template-driven — the editor never grows section-format toggles.
> - Templates can declare **custom fields** beyond core `WeddingData` (a Cinematic template might need `cinematicSubtitle`). The editor renders inputs for those dynamically via `<CustomFieldsRenderer>` + `<DynamicField>`.
> - Templates declare which **sections they support** (derived from their `data-cwl-section` blocks). The editor's "Add more" list in Step 3 only offers sections the active template can render. Couples switching templates: sections the new template doesn't support vanish silently from the preview but data persists.
>
> See [TEMPLATES.md](./TEMPLATES.md) (Section availability + Custom fields subsections) and Phase 9 of [ARCHITECTURE.md](./ARCHITECTURE.md) for the architecture.

**Files:**
- [src/lib/themes.ts](src/lib/themes.ts) — replace `isPremium?: boolean` with `priceCents?: number` on `ThemeConfig` and on `SectionMeta`. Set the four current premium sections (Map 9900, Save the Date 9900, Travel 19900, Wedding Party 19900). All 17 themes leave `priceCents` undefined for v1.
- [src/components/edit/SectionManager.tsx](src/components/edit/SectionManager.tsx) — price pill on `SectionInfo`.
- [src/components/edit/EditPanel.tsx](src/components/edit/EditPanel.tsx) — `PremiumPublishNote` copy with price; Step 3 CTA roll-up.
- [src/components/edit/TemplatePicker.tsx](src/components/edit/TemplatePicker.tsx) — price overlay on premium-theme thumbnails.

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
9. Adding a premium section shows price pill on the row + price-aware note inside the expanded editor; Step 3 CTA shows running total in PHP.

`npm run build` must pass after each phase.
