# Designing with Claude

A playbook for collaborating with Claude on the visual side of Coded with Love — themes, palettes, ornaments, sections, and the iterative work of making the preview feel right.

## 1. Why this doc exists

Every other doc in this repo tells you *what* to build (CLAUDE.md, ARCHITECTURE.md) or *where* the file edits go (the two skill SKILL.md files, TEMPLATES.md). None of them teach the part that actually decides whether a template looks good: the loop of briefing Claude, generating, looking at the result, critiquing it, and iterating. This doc owns that loop.

Read this when you want quality, not throughput. If you just need to ship a theme by Friday, TEMPLATES.md and `/theme-variant` are faster. Come back here when something feels generic and you don't know why.

## 2. What's documented elsewhere

Don't search this doc for content that lives somewhere better:

- File-edit mechanics for a new theme → [.claude/skills/theme-variant/SKILL.md](.claude/skills/theme-variant/SKILL.md)
- File-edit mechanics for a new section → [.claude/skills/preview-section/SKILL.md](.claude/skills/preview-section/SKILL.md)
- Non-technical "add my first theme" walkthrough → [TEMPLATES.md](TEMPLATES.md)
- Theme structure, conventions, GSAP / palette / stepRef patterns → [CLAUDE.md](CLAUDE.md)
- Roadmap, premium-tier mechanics, Phase 8 polish goals → [ARCHITECTURE.md](ARCHITECTURE.md)

This doc fills the gap: how to *collaborate* with Claude on visual quality.

## 3. Strengths and weaknesses — calibrate before you brief

| Claude is good at | Claude is bad at |
|---|---|
| Generating 3–5 variations from one brief | Knowing which of the 5 is the right one |
| Holding palette consistency across a theme | Telling you a palette is "trying too hard" |
| Copying an existing pattern faithfully | Restraint — left alone, will keep adding ornament |
| Producing clean ornament SVG from a description | Original illustration with personality |
| Articulating font-pairing rationale | Calling a pairing "boring" without your prompt |
| Maintaining accessibility contrast on request | Noticing contrast unprompted |
| Mechanical follow-through across 5+ files | Knowing when the work is *done* |
| Reskinning a theme cleanly via palette/typography | Noticing when reskinning isn't enough — when distinctness needs structure |

The pattern: Claude is excellent at execution and variation, mediocre at taste. **You are the taste filter.** Treat every Claude-generated design pass as a draft you critique, not a result you accept.

## 4. The collaboration loop

Five steps. Run them in order, every time.

**Brief** — Write what you want in 5–10 lines: vibe, reference, constraints. See section 5 for the shape.

**Generate** — Hand Claude the brief and the relevant skill (`/theme-variant`, `/preview-section`) or just describe the change. Claude produces edits. **Hero/closing image swaps are a sub-iteration** — propose an Unsplash search term, let a human paste the verified URL. Claude can't visually verify a photo without rendering, and guessing photo IDs ships broken images.

**Screenshot** — Run `npm run dev`, visit `/builder?theme=<slug>`, and look at desktop AND mobile. Don't critique from the diff — critique from the rendered preview.

**Critique** — Tell Claude what's wrong in *visual* language, not engineering language. "The accent reads neon when I wanted muted." "The serif is fighting the sans-serif at heading sizes." "The hero photo is generic-beachy." Be specific about what you see.

**Iterate** — One axis at a time. Don't ask Claude to "make it better" — ask it to make the accent 15% less saturated, then look again.

**Worked example: refining Coastal.** Coastal was the most generic theme — bright cyan accent, stock beach photo, no signature feeling. Brief: *"Make Coastal feel like a Mediterranean cliffside at golden hour, not a postcard. Keep the lines ornament. Drop saturation on the accent. Hero needs warmth, not just water."* Claude produced new palette and image swaps; the screenshot showed the accent was now correct but the hero photo was still a wide ocean shot — too distant. Critique: *"Hero needs to feel intimate — closer crop, ideally golden-hour light on stone or terracotta."* Claude swapped the image; the next screenshot landed it. Two loops, one theme refined.

The mistake to avoid: skipping the screenshot step. Reading a diff and shipping is how generic ships.

## 5. Briefs that work

A brief Claude can act on has three pieces: **vibe**, **reference**, **constraints**.

**Bad brief:** *"Make a romantic theme."*  → adjective soup; Claude defaults to safe choices.

**Good brief:** *"Romantic but evening — think candlelit Tuscan villa at 9pm. Warm muted palette, deep wine accent, no pink. Floral ornament is fine but make it sparser than Romantic. Heading font should feel handwritten, not formal script."* → clear vibe, named reference (Tuscan villa, candlelit), explicit constraints (no pink, sparser ornament, handwritten not script).

**Bad brief for refinement:** *"Improve Coastal."* → Claude doesn't know what's wrong.

**Good brief for refinement:** *"Coastal feels generic-beachy. Drop the accent saturation 30%, swap hero to a Mediterranean cliffside (golden hour, warm tones), and tighten the section padding 10%. Keep everything else."* → diff-shaped, scoped, reversible.

When in doubt, point at an existing theme: *"Like Elegant but…"* gives Claude a concrete starting point and you a concrete diff to evaluate.

## 6. Pattern: new theme

Mechanics live in [TEMPLATES.md](TEMPLATES.md) and the [/theme-variant](.claude/skills/theme-variant/SKILL.md) skill. The judgment call this doc adds: **read section 10 (add vs. refine) first.** Most "I want a new theme" requests are actually "I want an existing theme to feel less like itself." Adding the 18th theme without that check is how the gallery ends up bloated and indistinct.

## 7. Pattern: new section

Mechanics live in the [/preview-section](.claude/skills/preview-section/SKILL.md) skill. The visual considerations the skill doesn't cover:

- **Rhythm.** Each section sits between two others. A new gallery section between Story and Countdown changes the pacing; check the scroll feels right, not just that the section renders.
- **Ornament continuity.** The new section should use the theme's ornament style, not introduce its own decoration.
- **Mobile breakpoint feel.** Sections that look fine on desktop often die at 375px width. Check both before declaring done.

## 8. Pattern: palette refresh on an existing theme

Highest-leverage move for Phase 8 polish. Brief template:

```
Theme:        <slug>
Current vibe: <what it feels like today>
Target vibe:  <what it should feel like>
Keep:        <fonts, ornament, images you want untouched>
Swap rule:   <what's allowed to change — usually accent + bgAlt only>
```

Constrain `Swap rule` tightly. "Change the whole palette" almost always produces a new theme in disguise; "shift accent and bgAlt only, keep text and bg" produces a refinement.

A palette change touches three places in this codebase: `src/lib/themes.ts` (the theme config), `src/lib/themes.ts` again (the `THEME_PALETTES` map used for landing-page swatches), and `src/app/page.tsx` (the `TEMPLATES` array's `colors` array used for the actual landing card). Update all three or the gallery and the builder will disagree about what color the theme is.

Also re-read the **landing card description copy**. Color words drift: a Coastal card describing "watercolor blues" makes no sense after a palette refresh to terracotta. Copy and color must agree.

## 9. Pattern: new ornament variant

Today there are four ornament styles in [Ornament.tsx](src/components/preview/Ornament.tsx): floral, geometric, lines, none. Add a fifth only when an existing theme genuinely can't reach its vibe with the current four — e.g., Vintage needing a filigree mark, Art Deco needing a fan motif. Brief template:

```
Style name:  <slug, e.g. "filigree">
Vibe:        <one sentence>
Reference:   <a real-world ornament tradition you're echoing>
Themes:     <which existing themes will adopt it>
```

Then `/theme-variant` (or a direct edit) handles the SVG branch and the `OrnamentStyle` union.

## 10. Add vs. refine — the decision rule

The most important question in this doc. Three checks, in order:

1. **Coverage check.** Is the vibe you want already 80% covered by one of the existing 17 themes? If yes → refine, don't add.
2. **Confusion test.** If you screenshot the closest existing theme next to your proposed new one, would a couple confuse them? If yes → refine.
3. **Orthogonality check.** Is the new vibe genuinely off-axis from everything else (e.g., "Japanese minimalist" when nothing in the gallery touches that)? If yes → add.
4. **Layout check.** Can the new vibe be reached using the existing section components (Hero, Story, Details, etc.), or does it need different layout shapes? If layout, this isn't a `/theme-variant` job — it's structural work. Most "I want a new theme" requests that fail the confusion test fail because the section layouts are shared across all themes. Without layout differentiation, you cap how distinct a theme can feel.

Defaulting to "refine" is almost always correct — but if every theme in the gallery is starting to look like a recolor of the others, that's a structural problem (layout) not a refinement problem (palette). Don't try to fix it with more themes.

## 11. Quality bar before commit

Before you ship a design change, walk this list:

- ☐ Distinctness — could a couple confuse this with a neighbor template? Fix typography or ornament if yes.
- ☐ Mobile pass — checked at 375px width. No clipped headings, no broken padding.
- ☐ Contrast pass — body text reads cleanly against background. Dark themes especially.
- ☐ Ornament rhythm — same ornament style across all sections; not over-applied.
- ☐ Font-load weight — adding a new Google Font costs page weight. Justified?
- ☐ `npm run build` passes.
- ☐ Screenshotted, not just diff-read.

## 12. Premium-tier theme considerations (Phase 8)

When ARCHITECTURE.md Phase 8 lands, premium themes need to justify the upgrade. Three things separate a paid theme from a free one:

- **A signature interaction.** Free themes are static-pretty. A paid theme should have one moment that earns the price — a hero parallax, a story-section reveal, a custom cursor on the names.
- **More bespoke ornament.** Custom SVG, not a reused branch. Probably its own variant.
- **Photographic direction.** Free themes use Unsplash defaults; paid themes ship with a curated, theme-coherent set of fallback images that look art-directed, not stock.

This section is a placeholder until Phase 8 work begins. Update it once the first paid theme ships.
