# Templates

Templates are the visual "outfit" of every wedding site built with Coded with Love. Today we ship 17 — Romantic, Elegant, Minimal, Cinematic, Garden, Modern, Art Deco, Boho, Coastal, Vintage, Daisy, Rustic, Watercolor, Tropical, Whimsical, Regal, Industrial. We'd love more voices.

There are two paths to add one:

- **Quick contributor path** — clone the repo, use the Claude Code `/theme-variant` skill, ship a new theme as a code change. Best for small variations on the existing aesthetic. See [Quick contributor path](#quick-contributor-path) below.
- **Designer SDK path (post-launch)** — design a template externally (HTML + CSS + optional JS), mark it up with `data-cwl-*` attributes, upload through `/admin/template-engine`. The system parses your markup, validates against the contract, and slots the template into the live collection. See [Template SDK reference](#template-sdk-reference) below.

The SDK path is the long-term home for designer-authored templates. The contributor path stays for in-house quick additions.

---

## What a template is (without the code talk)

A template is a consistent look AND structure for a wedding site: its background color, its fonts, its little decorative touches between sections, the mood of its photography, and **which sections show up and in what order**. Hero is always first, but the rest is the template's call — Minimal is stripped to 4 sections, Cinematic puts the countdown right after Hero, Industrial leads with logistics. Each template has its own rhythm.

A good template is a **vibe + a structure**, not just a component. "Sunset desert that opens with the love story" is a template. "A dark mode toggle" isn't.

## What makes a template

Every template is a combination of:

- **A vibe** — one short sentence that captures the feeling. *"Sunset desert wedding, warm and free-spirited."*
- **A palette** — 5 colors: background, alt background, text, accent, muted accent. Pick colors that belong together.
- **Two fonts** — a display font for headings (usually a serif or script) and a body font (usually a sans-serif). Both from Google Fonts.
- **An ornament style** — the decorative mark between sections. Four exist: *floral, geometric, lines, none.* Pick one, or propose a new one.
- **Hero and closing images** — two photos from Unsplash (or uploaded) that capture the mood.
- **A section list** — which of the 16 available sections appear, and in what order. Hero is always first; everything else is up to the template's character.

Think of it like styling a real wedding — the invitations, the menu cards, the signage, the venue mood board. It's a coherent visual *and structural* language.

## The 16 sections you can pick from

**Core:** Hero, Welcome, Our Story, Countdown, Details, Timeline, Dress Code, RSVP, Closing Note

**Optional:** Gallery (photos), Travel (hotels / parking), Registry (gift links), FAQ, Wedding Party (bridesmaids/groomsmen), Map (venue location), Hashtag & Music (Spotify embed), Save the Date (pre-wedding banner)

A user can later add or remove any of these — but the template chooses the **default** set, which is what couples see when they pick that template.

---

## Quick contributor path

This is for people working inside the repo who want to add a theme to the in-code template list. You don't need to know the codebase — you need a vibe, a palette, and ten minutes.

1. Clone the repo, run `npm install` then `npm run dev`.
2. Open Claude Code in the project root.
3. Paste this brief into Claude (fill in the blanks — anything you're not sure about, write `?` and Claude will ask):

```
/theme-variant

Name:
Label:
Vibe:
Palette:
Heading font:
Body font:
Ornament:
Hero image:
Closing image:
Sections:      (which sections appear, in what order — leave blank to inherit the default 8)
```

4. Claude reads the skill, fills in any gaps, and makes all the file edits.
5. Visit [`localhost:3000`](http://localhost:3000). Your template shows up as a card on the landing page.
6. Click it. You're dropped into the builder with your template applied.
7. Iterate — ask Claude things like *"make the accent warmer"*, *"the heading feels heavy — try a lighter weight"*, *"swap the hero for a candlelit image"*. Claude will make the edits.
8. When happy, commit and open a PR.

### When it's done

A new template is done when:

- ☐ It shows up in the landing page's template gallery.
- ☐ It's selectable in the builder's template picker modal (click "Change" in Step 1).
- ☐ Its `sections` array renders the chosen section list in the chosen order.
- ☐ It renders cleanly on desktop, tablet, and mobile.
- ☐ It feels *visibly different* from the others — not a reskin. Different sections / order helps; not just colors.
- ☐ `npm run build` passes.

### Not sure where to start?

Easiest path: take one of the existing 17 and riff on it. "Cinematic but lighter" or "Romantic with a nighttime mood" are legit starting points. Ask Claude: *"Show me how Elegant is configured, then build a new template called Moody based on it."*

---

## Template SDK reference

> **Status:** This SDK is the contract for the post-launch admin tool at `/admin/template-engine` (Phase 9 of [ARCHITECTURE.md](./ARCHITECTURE.md)). The contract is canonical now so designers can start building against it; the upload pipeline lands later.

The Designer's path: write HTML + CSS + optional JS in any tool you like (Claude, hand-authored, Figma export), annotate the HTML with the attributes documented below, then upload at `/admin/template-engine`. The system parses your annotations into the internal manifest, validates against the contract, and lights up a live preview using dummy wedding data.

You don't write TypeScript. You don't see the codebase. The annotations carry the contract.

### Designer journey

1. Visit `/admin/template-engine` (admin-only page).
2. **Read + copy the canonical pre-prompt** (see [Pre-prompt for AI generation](#pre-prompt-for-ai-generation)). This is the system message your AI tool needs.
3. **Design externally** — paste the pre-prompt into Claude (or any AI), iterate until you have an HTML file ready. Optional: a `styles.css`, `animations.ts` (GSAP), and `scripts.ts` (sandboxed JS).
4. **Upload or link** your bundle back at `/admin/template-engine`.
5. **System analyzes** — parses `data-cwl-*` annotations, builds the manifest, validates against the contract.
6. **Errors surface inline with suggested fixes** — e.g. "Section `bridesmaids` not recognized. Did you mean `weddingParty`?" One-click apply or hand-fix.
7. **Live preview** in the editor's `WeddingPreview` component using dummy data. Check it on desktop and mobile viewports.
8. **Iterate** — edit, re-upload, retest.
9. **Save as draft** at any point. Stored in the `templates` DB table with `status = 'draft'`.
10. **Publish** — set `priceCents` (template-level and/or per-section overrides), flip status to `'published'`, template appears in the user-facing template picker.

### Contract via HTML attributes

Mark up your HTML with `data-cwl-*` attributes and special HTML comments. The system reads these to build the template manifest.

```html
<!-- @cwl-template
  name: midnight-bloom
  label: Midnight Bloom
  pricing-tier: signature
  ornament: lines
-->

<section data-cwl-section="hero">
  <h1 data-cwl-field="name1"></h1>
  <span data-cwl-static>&</span>
  <h1 data-cwl-field="name2"></h1>
  <p data-cwl-field="date" data-cwl-format="long-date"></p>
  <img data-cwl-field="heroImage" alt="" />
</section>

<section data-cwl-section="welcome" data-cwl-format="letter">
  <p data-cwl-field="welcomeMessage"></p>
</section>

<section data-cwl-section="story" data-cwl-format="timeline">
  <ul data-cwl-iterate="storyTimeline">
    <li>
      <span data-cwl-field="item.year"></span>
      <p data-cwl-field="item.label"></p>
      <img data-cwl-field="item.image" alt="" />
    </li>
  </ul>
</section>

<!-- @cwl-section price-cents=19900 -->
<section data-cwl-section="weddingParty">
  <ul data-cwl-iterate="weddingParty">
    <li>
      <img data-cwl-field="member.photo" alt="" />
      <h3 data-cwl-field="member.name"></h3>
      <p data-cwl-field="member.role"></p>
    </li>
  </ul>
</section>

<section data-cwl-section="rsvp">
  <!-- The RSVP form is rendered by the platform; just provide the wrapper -->
</section>
```

### Annotation reference

#### Template-level

`<!-- @cwl-template ... -->` — single comment block at the top of the HTML.

| Key | Required | Description |
|---|---|---|
| `name` | ✓ | URL-safe slug. Lowercase, hyphens. e.g. `midnight-bloom` |
| `label` | ✓ | Human label for the picker. e.g. `Midnight Bloom` |
| `pricing-tier` | — | One of `standard` (₱499) / `signature` (₱999) / `designer` (₱1499). Omit for free templates. |
| `ornament` | — | One of `floral` / `geometric` / `lines` / `none`. Used by ornament dividers. |

#### Section-level

`<!-- @cwl-section ... -->` — comment immediately preceding a `<section data-cwl-section="...">` tag.

| Key | Description |
|---|---|
| `price-cents` | Override the section's default `priceCents` for this template. e.g. `price-cents=19900` (₱199) |

#### HTML attributes

| Attribute | On | Description |
|---|---|---|
| `data-cwl-section="<id>"` | `<section>` | Marks a section. Must match a `SectionId` from the catalog (or warn). |
| `data-cwl-format="<format>"` | `<section>` | Selects a section format variant. Allowed values per section listed in the catalog. Unknown values warn but don't block. |
| `data-cwl-field="<path>"` | any element | Bind text content (or `src` on `<img>`/`<source>`) to a field. Path examples: `name1`, `date`, `colors.accent`, `item.year` (inside an iterate). |
| `data-cwl-format="<formatter>"` | any element with `data-cwl-field` | Apply a built-in formatter: `long-date`, `short-date`, `time`, `address-multiline`. |
| `data-cwl-iterate="<arrayPath>"` | any container | Repeat the element for each item in the array. Children use `item.X` paths. e.g. `storyTimeline`, `galleryImages`, `weddingParty`. |
| `data-cwl-if="<fieldPath>"` | any element | Conditional render — only present if the field is truthy. |
| `data-cwl-static` | any element | Mark text as literal (no field substitution). |
| `data-cwl-class="<class names>"` | any element | Tailwind / CSS class hints layered onto the element. |
| `data-cwl-animation="<name>"` | any element | Hook for an animation defined in `animations.ts`. |

### Field reference

The fields a template can read from. Source of truth: [src/lib/types.ts](src/lib/types.ts). When this drifts, run `npm run validate-template-docs` (script lands in Phase 9) to flag stale entries.

#### Identity

| Field | Type | Notes |
|---|---|---|
| `name1` | string | First partner's first name. Required for usable site. |
| `name2` | string | Second partner's first name. Required. |
| `date` | string | Free-text date (e.g. "September 14, 2026"). Use `data-cwl-format="long-date"` for parsing. |
| `tagline` | string? | Short subtitle / wedding tagline. Optional. |
| `welcomeMessage` | string? | Bride's welcome paragraph. Optional. |
| `heroImage` | string? | Hero photo URL. Falls back to `theme.heroImage`. |
| `closingImage` | string? | Closing photo URL. Falls back to `theme.closingImage`. |
| `logoImage` | string? | Couple's monogram / logo. Optional. |

#### Logistics

| Field | Type | Notes |
|---|---|---|
| `ceremonyType` | string? | Free-text (Church / Garden / Beach / Civil / Hotel / Other). |
| `ceremonyVenue` | string? | Venue name. |
| `ceremonyAddress` | string? | Multi-line address. Use `data-cwl-format="address-multiline"`. |
| `ceremonyTime` | string? | "4:00 PM" |
| `receptionVenue` | string? | If different from ceremony. |
| `receptionAddress` | string? | Multi-line. |
| `receptionTime` | string? | "6:00 PM" |
| `dressCode` | string? | "Black tie" / "Filipiniana" / etc. |

#### Content

| Field | Type | Notes |
|---|---|---|
| `story` | string? | Prose love story (when `storyFormat` is `prose`). |
| `storyTimeline` | StoryMilestone[] | When `storyFormat` is `timeline`. Items have `year`, `label`, `image?`. |
| `timeline` | TimelineItem[] | Day-of schedule. Items have `time`, `label`. |
| `noteToGuests` | string? | Closing note / final message. |
| `galleryImages` | string[] | Photo URLs for the gallery section. |
| `weddingParty` | PartyMember[] | Items have `name`, `role`, `photo?`. |
| `faqItems` | FaqItem[] | Items have `question`, `answer`. |
| `registryLinks` | RegistryLink[] | Items have `label`, `url`. |
| `travelInfo` | string? | Free-text travel notes. |
| `mapAddress` | string? | Address to render on map. |
| `hashtag` | string? | "#AndreaAndMiguel2026" |
| `musicEmbed` | string? | Spotify / Apple Music URL. |
| `saveTheDateMessage` | string? | Pre-invitation note. |

#### Toggles

| Field | Type | Notes |
|---|---|---|
| `rsvpEnabled` | bool? | When false, RSVP section renders empty. |
| `countdownEnabled` | bool? | When false, Countdown section renders empty. |

#### Visual overrides

| Field | Type | Notes |
|---|---|---|
| `colors.primary` | string | Hex color, overrides theme primary. |
| `colors.accent` | string | Hex color, overrides theme accent. |

### Section catalog

Each section ID, its purpose, the fields it expects, allowed format values, and default pricing.

#### `hero`
- Required fields: `name1`, `name2`, `date`
- Optional fields: `tagline`, `heroImage`
- Allowed formats: (none — hero rendering is theme-styled rather than format-routed)
- Default `priceCents`: 0
- Always pinned to slot 0 — the renderer enforces this regardless of source order.

#### `welcome`
- Reads: `welcomeMessage`
- Allowed formats: any (designer-extensible — common: `letter`, `minimal`, `quote`)
- Default `priceCents`: 0
- Section returns null if `welcomeMessage` is empty.

#### `story`
- Reads (prose): `story`
- Reads (timeline): `storyTimeline` — iterate via `data-cwl-iterate="storyTimeline"`
- Allowed formats: `prose`, `timeline` (designer-extensible)
- Default `priceCents`: 0

#### `countdown`
- Reads: `date`, `countdownEnabled`
- Allowed formats: any (common: `digits`, `words`)
- Default `priceCents`: 0

#### `details`
- Reads: `ceremonyType`, `ceremonyVenue`, `ceremonyAddress`, `ceremonyTime`, `receptionVenue`, `receptionAddress`, `receptionTime`, `date`
- Allowed formats: any
- Default `priceCents`: 0

#### `timeline` (day-of)
- Reads: `timeline` — iterate
- Allowed formats: any (common: `list`, `vertical-line`, `grid`)
- Default `priceCents`: 0

#### `dresscode`
- Reads: `dressCode`
- Allowed formats: any
- Default `priceCents`: 0

#### `rsvp`
- Reads: `rsvpEnabled` (gate), platform renders the form into the section wrapper
- Allowed formats: (none — the form is platform-controlled)
- Default `priceCents`: 0

#### `closing`
- Reads: `noteToGuests`, `closingImage`
- Allowed formats: any
- Default `priceCents`: 0

#### `gallery`
- Reads: `galleryImages` — iterate via `data-cwl-iterate="galleryImages"`
- Allowed formats: any (common: `grid`, `carousel`, `masonry`)
- Default `priceCents`: 0

#### `travel`
- Reads: `travelInfo`
- Allowed formats: any (common: `narrative`, `card-grid`)
- Default `priceCents`: 19900 (₱199 — premium)

#### `registry`
- Reads: `registryLinks` — iterate
- Allowed formats: any
- Default `priceCents`: 0

#### `faq`
- Reads: `faqItems` — iterate
- Allowed formats: any (common: `list`, `accordion`)
- Default `priceCents`: 0

#### `weddingParty`
- Reads: `weddingParty` — iterate; items have `name`, `role`, `photo?`
- Allowed formats: any (common: `grid`, `list`)
- Default `priceCents`: 19900 (₱199 — premium)

#### `map`
- Reads: `mapAddress`
- Allowed formats: any
- Default `priceCents`: 9900 (₱99 — premium)

#### `hashtag`
- Reads: `hashtag`, `musicEmbed`
- Allowed formats: any
- Default `priceCents`: 0

#### `saveTheDate`
- Reads: `saveTheDateMessage`, `date`, `heroImage`
- Allowed formats: any (common: `photo-overlay`, `postcard`, `minimal`)
- Default `priceCents`: 9900 (₱99 — premium)

### Section availability per template

Templates only support the sections they actually have HTML for. A "Beach" template that ships HTML blocks for `hero`, `welcome`, `story`, `details`, `rsvp`, `gallery`, and `closing` doesn't support `weddingParty` or `map` — adding those in the editor would have nowhere to render.

The system handles this automatically:

- The validator reads every `<section data-cwl-section="<id>">` in your HTML and builds the template's **supported sections** list. You don't declare it explicitly — it's inferred from your markup.
- The editor's "Add more" list in Step 3 (the SectionManager) only offers sections the active template supports. If your template doesn't include a `data-cwl-section="travel"` block, "Travel" doesn't show up as an addable option.
- Couples switching templates: if their site has a section the new template doesn't support, that section is silently hidden in the preview (their data persists in `data.userSections` and `data.galleryImages` etc., but the template won't render it). Switching back to a supporting template reveals it again.

This means designers shouldn't worry about supporting every section — pick the ones that fit your aesthetic and ship them. Couples picking your template are buying into your structural choices.

#### Best practices for section coverage

- **Always include the essentials.** `hero`, `welcome`, `details`, `rsvp` should be on every template. They're the wedding-site foundation.
- **Pick a structural signature.** A formal template might lead with `details` + `dresscode`; a story-driven template might put `story` right after `hero`. Use section presence and order to express the template's character.
- **Don't ship sections half-built.** A `gallery` block that's just `<section data-cwl-section="gallery"></section>` will render empty. Either include the iteration markup or don't include the section at all.
- **Premium sections are opt-in.** If you don't include `travel`, `weddingParty`, `map`, or `saveTheDate` in your HTML, couples can't add them to your template. That's fine — your template just doesn't compete for those add-ons.

#### Note for core themes (in-repo)

The 17 core themes (Romantic, Elegant, etc.) all use shared `*Section.tsx` React components, so they support every section regardless of which ones their default `sections` array lists. When the editor resolves a core theme into a manifest (the `adaptThemeToManifest` adapter — see [ARCHITECTURE.md Phase 9](./ARCHITECTURE.md)), the `supportedSections` list is set to all known sections, and the `sections` array remains the *default* active set. This is the legacy behavior; designer-authored templates have stricter, manifest-driven section availability.

### Custom fields per template

Sometimes a template needs a field that doesn't exist in core `WeddingData` — a "Cinematic" template might want a subtitle line, a "Roadtrip" template might want a list of stops, a "Filipino formal" template might want fields for ninong/ninang. Rather than asking us to expand core `WeddingData` for every template's whim, designers **declare custom fields** in their template and the editor renders inputs for them automatically.

#### How it works (plain English)

1. You declare a custom field at the top of your HTML with a `<!-- @cwl-customField ... -->` block — name, type, label, which section it belongs to.
2. You bind the field anywhere in your HTML using `data-cwl-field="<name>"`, just like a core field.
3. The editor reads your declaration, renders the right input UI (text input / textarea / image picker / list editor / etc.), and stores the couple's value in their `data.custom` blob.
4. At render time, your `data-cwl-field="cinematicSubtitle"` resolves through `WeddingData → data.custom`. Designers don't think about this — it just works.

#### `@cwl-customField` annotation

```html
<!-- @cwl-customField
  name: cinematicSubtitle
  type: string
  label: Subtitle
  section: hero
  placeholder: "Two souls, one story"
  maxLength: 60
-->
```

Required keys:

| Key | Description |
|---|---|
| `name` | Field key. Used everywhere: in `data-cwl-field`, in storage, in the editor. Use camelCase, descriptive names. |
| `type` | One of: `string` / `text` / `date` / `image` / `enum` / `array` / `boolean`. See type reference below. |
| `label` | Human label shown in the editor next to the input. |
| `section` | One of the section IDs from the catalog. Tells the editor *where* to render the input — the editor knows that hero/welcome live in Step 1, details in Step 2, the rest in Step 3, and renders custom fields next to standard fields in the matching surface. |

Optional keys (per type):

| Key | Applies to | Description |
|---|---|---|
| `placeholder` | string / text / date | Greyed-out example text inside the input. |
| `helper` | all | Small italic muted line below the input. |
| `maxLength` | string | Hard cap on input length. |
| `rows` | text | Initial textarea height. Default 3. |
| `orientation` | image | `landscape` or `portrait` — drives the upload hint illustrations. |
| `options` | enum | Array of `{ value, label }` — renders as chips. |
| `itemFields` | array | Map of field name → descriptor for each item in the array. Editor renders a list editor with these fields per row. |
| `minItems` | array | Minimum count for a valid array. |
| `optional` | all | If `true`, field is optional; default is required. |
| `required` | all | If `true`, blocks publish if empty. |

#### Type reference

| Type | Editor input | Storage shape |
|---|---|---|
| `string` | Single-line text input | `string` |
| `text` | Multi-line textarea | `string` |
| `date` | Date picker (calendar) | `string` (formatted) |
| `image` | Image dropzone with EXIF/HEIC handling | `string` (image URL) |
| `enum` | Chip group (single-select) | `string` (matching `options[].value`) |
| `array` | List editor — add/remove rows, each row has the fields from `itemFields` | `Array<Record<string, unknown>>` |
| `boolean` | Toggle switch | `boolean` |

#### Array example

```html
<!-- @cwl-customField
  name: signatureMoments
  type: array
  label: Signature moments
  section: closing
  helper: Add 1–5 small moments you want to highlight in the closing.
  minItems: 1
  itemFields:
    quote: { type: text, label: Moment, rows: 2 }
    person: { type: string, label: Said by, optional: true }
-->

<section data-cwl-section="closing">
  <h2 data-cwl-static>Moments we'll keep</h2>
  <ul data-cwl-iterate="signatureMoments">
    <li>
      <p data-cwl-field="item.quote"></p>
      <span data-cwl-field="item.person" data-cwl-if="item.person"></span>
    </li>
  </ul>
</section>
```

#### Best practices

- **Name fields after their content**, not their position. `cinematicSubtitle` ✓ — `field1` ✗.
- **Don't shadow core field names.** If you write a custom field named `tagline`, you'll silently override the core `data.tagline` — confusing for couples switching templates.
- **Namespace ambitious fields.** If your template adds something a couple might want elsewhere, prefix it: `cinematic.subtitle` or `industrial.steelMotto`. Keeps the `data.custom` namespace clean.
- **Stick to common types when possible.** A custom `enum` with 3 well-chosen options is usually nicer than a freeform `string`. A custom `image` field with `orientation: portrait` already has the upload-hint illustration baked in.
- **Use `helper` to set expectations.** "Will appear under the hero, in italic, max 60 chars" is more useful than no guidance.

#### Where the field appears in the editor

The editor maps sections → steps:

- `hero`, `welcome` → **Step 1**
- `details` → **Step 2**
- everything else → **Step 3** (inside the section's expanded editor block)

A custom field with `section: hero` shows up in Step 1 below the standard hero block (Main photo / Tagline). A custom field with `section: story` shows up inside the Story section's expanded editor in Step 3, below the prose / timeline editor.

When a section has at least one custom field, the editor renders a small italic muted divider — *"Template extras"* — between the standard fields and the custom ones. When there are none, no divider, no overhead.

#### Edge cases

- **Switching templates with custom data left over.** Couple sets `cinematicSubtitle` while on Cinematic, switches to Romantic. Romantic doesn't reference `cinematicSubtitle`, so it doesn't render. They switch back later — the value is still there.
- **Removing a custom field from your template.** Designer publishes a new version that drops `cinematicSubtitle`. Existing couples' values linger in `data.custom` but aren't rendered or editable. Safe.
- **Two templates declaring the same custom field name.** They share the value (storage is just `data.custom[<name>]`). If you don't want this, namespace your field name.
- **Required fields.** Set `required: true` to add the small `*` marker in the editor and block publish if empty.

### Validation rules

The admin tool's parser checks:

- **Manifest derivable** — every required `@cwl-template` key present; at least one `<section data-cwl-section="...">` block declared; hero is one of them.
- **Section IDs valid** — every `data-cwl-section` value is in the catalog. Unknown values surface a "did you mean" suggestion (`bridesmaids` → `weddingParty`).
- **Field paths valid** — every `data-cwl-field` path exists in core `WeddingData` or in a declared `@cwl-customField` block. Unknown fields surface a suggestion list ("did you mean `name1`?", or "declare it as a custom field?").
- **Custom field descriptors well-formed** — every `@cwl-customField` block has the four required keys (`name`, `type`, `label`, `section`); type-specific options (e.g. `enum` requires `options`, `array` requires `itemFields`) are present.
- **Iteration sources valid** — every `data-cwl-iterate` references a known array field.
- **Format values** — known per-section formats pass; unknown formats warn ("first time we've seen this format — add to allowed list?") but don't block. Designers can extend formats per template.
- **Animations** — `animations.ts` (if present) exports a `setupAnimations(scrollContainer)` factory that returns a cleanup function (matches `WeddingPreview.tsx`'s `gsap.context()` pattern).
- **JS sandboxing** — `scripts.ts` (if present) passes AST inspection: no `fetch`, no `localStorage`, no `document`/`window` globals beyond a curated proxy, no third-party CDN imports, no global side effects.
- **No raw `<script>` injection** — script content lives in `scripts.ts`, not inline in the HTML.

When validation fails, the UI surfaces each issue with:
- The exact location (line number, attribute, section name)
- A plain-English explanation
- One or more fix suggestions, each with a one-click apply where possible

### Pre-prompt for AI generation

Copy this verbatim into Claude (or your preferred AI tool) when designing a template. It carries the contract.

```
You are designing a wedding website template for "Coded with Love," a Filipino
wedding builder. Output a single HTML file plus optional CSS and a sandboxed
JS file. Mark up your HTML with data-cwl-* attributes following the SDK
contract documented at TEMPLATES.md.

CONTRACT:
- Use only sections from the section catalog: hero, welcome, story,
  countdown, details, timeline, dresscode, rsvp, closing, gallery, travel,
  registry, faq, weddingParty, map, hashtag, saveTheDate.
- Bind every dynamic value with data-cwl-field. Reference only fields that
  exist in WeddingData (see field reference). Common fields: name1, name2,
  date, tagline, welcomeMessage, heroImage, ceremonyVenue, ceremonyAddress,
  ceremonyTime, story, storyTimeline (array), timeline (array),
  galleryImages (array), weddingParty (array), faqItems (array),
  registryLinks (array), noteToGuests, dressCode, rsvpEnabled.
- For repeating content (gallery, party, timeline, story-timeline, faq),
  use data-cwl-iterate. Children inside use item.X paths.
- For conditional rendering, use data-cwl-if.
- For static text (no field), use data-cwl-static.
- If your template needs a field that doesn't exist in core WeddingData,
  declare it with @cwl-customField (name, type, label, section). The
  editor will render the right input automatically. See "Custom fields per
  template" in TEMPLATES.md for the full schema.

AESTHETIC:
- Filipino wedding context: church / garden / beach venues common,
  family-oriented, religious tradition normal, cash gifts > registry.
- Warm minimal palette: cream / terracotta / sage / soft slate-blue.
  Avoid neon, harsh contrasts, AI-cringe phrases like "Beautiful! ✨" or
  "Amazing choice."
- Two fonts max: a serif/script display font and a sans-serif body font.
  Both from Google Fonts.
- One ornament style: floral / geometric / lines / none.

STRUCTURE:
- Hero is always first.
- Order the remaining sections by emotional flow — the template's signature.
- Use ornament dividers between sections (the platform handles rendering).

ANIMATIONS:
- GSAP via data-cwl-animation="<name>" attributes on elements.
- Define timeline factory in animations.ts, exporting:
    setupAnimations(scrollContainer: HTMLElement): () => void
- Sandboxed to the preview's scroll container.

SANDBOX:
- No fetch, no localStorage, no third-party CDNs, no global mutations.
- No <script> tags inline. JS goes in scripts.ts only if absolutely needed.

OUTPUT:
- A single HTML file with an @cwl-template block at the top.
- Optional: styles.css, animations.ts, scripts.ts.
- Comments encouraged.

Begin.
```

### Animations + JS

#### Animations (GSAP)

Templates can ship a `animations.ts` file that exports a setup factory matching the platform's `gsap.context()` pattern:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function setupAnimations(scrollContainer: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    // Match elements via data-cwl-animation attribute
    gsap.from(`[data-cwl-animation="hero-name"]`, {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: "power3.out",
    });

    ScrollTrigger.create({
      trigger: `[data-cwl-section="story"]`,
      scroller: scrollContainer,
      start: "top center",
      onEnter: () => {
        gsap.to(`[data-cwl-animation="story-fade"]`, {
          opacity: 1,
          duration: 0.8,
        });
      },
    });
  }, scrollContainer);

  return () => ctx.revert();
}
```

The platform invokes `setupAnimations(scrollContainer)` after the template renders and calls the returned cleanup on unmount. Same pattern the core templates already use in `WeddingPreview.tsx`.

#### Custom JavaScript (rare)

If a template absolutely needs custom client-side JS beyond animations (e.g. a niche interactive element), put it in `scripts.ts`:

```ts
// scripts.ts
export function init(scrollContainer: HTMLElement): () => void {
  // ... small interactive logic
  return () => {
    // cleanup
  };
}
```

The sandbox restricts:
- No `fetch` / `XMLHttpRequest`
- No `localStorage` / `sessionStorage` / `IndexedDB`
- No `document.cookie`, no `navigator` beyond geolocation prompt (still sandboxed)
- No global mutations (`window.foo = ...` is blocked)
- No third-party CDN imports
- No `eval` / `new Function`

If your template needs any of these, propose it as a core platform feature first via PR — it's likely something many templates would want, and we should ship it once for everyone.

### What "good" looks like

A great designer-authored template:

- ☐ Has a signature feeling — one phrase captures it
- ☐ Uses two fonts max
- ☐ Differs structurally from existing templates (different section order, different format choices)
- ☐ Validates with no errors
- ☐ Renders cleanly on desktop, tablet, and mobile
- ☐ Animations enhance, never distract
- ☐ Filipino aesthetic — would feel right at a Manila Hotel reception, a Tagaytay garden, or a Boracay beach
- ☐ Wouldn't be confused with another template in a thumbnail

---

## Going deeper

For the broader design-with-Claude workflow — refining existing themes, palette work, ornament variants, and the brief→screenshot→critique loop — see [DESIGN.md](./DESIGN.md).

For the platform-side implementation of the template engine + admin tool, see Phase 9 of [ARCHITECTURE.md](./ARCHITECTURE.md).

## Philosophy

- **One hero moment per template.** Each template should have a signature feeling: Romantic's soft florals, Elegant's geometric crispness, Minimal's negative space, Cinematic's gold-on-black. Yours should have one too.
- **Two-font max.** More than two fonts in a template starts to feel like a Canva accident.
- **Distinct, not reskinned.** If your template and one of the existing 17 could be confused in a screenshot, you need more differentiation — usually in typography, ornament, or **section structure**, not just color.
- **Use the section list as a tool.** A formal template can lead with Details + Dress Code (Regal does); a casual outdoor template can skip both Countdown and Dress Code (Garden does); a story-driven template can put Story right after Hero (Boho). Same 16 sections in 17 different orders gives 17 genuinely different sites.
- **Don't ship something you wouldn't send to a friend.** A couple is going to pick this to represent one of the most important days of their life. Treat the bar accordingly.
