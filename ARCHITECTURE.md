# Architecture

This document captures **where Coded with Love is headed**, not just how today's code works (see CLAUDE.md for that). Any Claude session doing architectural work should read this first.

## Vision

Coded with Love is becoming a SaaS wedding RSVP platform. Engaged couples sign in, build a personalized wedding website through an AI-guided conversation, and either publish for free (watermarked, on our path-based subroute) or pay a one-time fee to unlock a branded subdomain, optional custom domain, and no watermark. Guests RSVP via tokenized magic links with no account needed. Couples manage their guest list and see RSVPs in a dashboard. An operator-facing admin area surfaces signups, template usage, and revenue.

The demo at `/builder` stays accessible without signup — an anonymous visitor can build a full site and only hits the paywall at publish time. Their in-progress work persists only after they create an account.

## System map

```
                ┌──────────────────────────────────────────────┐
                │     coded-with-love.com (Next.js 16)         │
                │                                              │
                │   /          marketing landing               │
                │   /builder   builder (anon demo OR signed)   │
                │   /i/{slug}  free-tier published invite      │
                │   /admin     admin dashboard                 │
                │                                              │
                │   {slug}.coded-with-love.com                 │
                │   (paid-tier subdomain published invite)     │
                │                                              │
                │   {custom}.com → CNAME (paid + custom domain)│
                └──────────┬─────────────┬─────────────────────┘
                           │             │
                  ┌────────▼────────┐    │
                  │    Auth.js v5   │    │
                  │  Google · Apple │    │
                  │  · Magic link   │    │
                  └─────────────────┘    │
                                         │
   ┌─────────────────────────────────────▼────────────────────────────┐
   │                    Postgres (Neon)                               │
   │  users · sites · site_versions · guest_groups · guests · rsvps  │
   │  views · payments · template_events · admin_audit                │
   └────────┬─────────────────────────────────┬───────────────────────┘
            │                                 │
   ┌────────▼─────────┐               ┌───────▼────────┐
   │  Stripe          │               │  Vercel Blob   │
   │  Checkout +      │               │  hero/logo/    │
   │  Webhooks        │               │  closing imgs  │
   └──────────────────┘               └────────────────┘

                ┌──────────┐                 ┌──────────┐
                │  Resend  │                 │ PostHog  │
                │  (email) │                 │ (events) │
                └──────────┘                 └──────────┘
```

## Locked-in decisions

| Area | Decision |
|---|---|
| Pricing | One-time fee per published site. Free tier allowed, with watermark. |
| Couple collaboration | Share one login. No co-owner accounts in v1. |
| Custom domains | Paid tier only. |
| Admin dashboard | Hand-rolled at `/admin`, not Metabase. |
| Demo + auth coexistence | Anonymous demo at `/builder` stays. Pre-account data is ephemeral (localStorage). On signup, the current draft migrates to a real `sites` row. |
| URL structure | Free: `coded-with-love.com/i/{slug}`. Paid: `{slug}.coded-with-love.com`. Custom domain: paid add-on. |
| Templates | All 4 current themes (Romantic, Elegant, Minimal, Cinematic) free at launch. Premium-template machinery (`is_premium` flag, lock icon in switcher, tier check at publish) built in so future themes can be paid-only without re-architecting. |

## Tech stack

- **Framework:** Next.js 16.2.4 with Turbopack
- **Auth:** Auth.js v5 (NextAuth) with `@auth/drizzle-adapter`. Providers: Google, Apple, email magic link
- **Database:** Postgres on Neon (free tier with branching per preview deploy). ORM: Drizzle (SQL-first, serverless-friendly)
- **Payments:** Stripe Checkout (hosted) + webhooks via a route handler
- **Email:** Resend with React Email components (magic links, RSVP confirmations, reminders)
- **File storage:** Vercel Blob (the current `src/lib/image.ts` object-URL flow is a placeholder for this)
- **Behavioral analytics:** PostHog cloud (free tier ≤ 1M events/mo)
- **Hosting:** Vercel (custom domains via Vercel Domains API)

### Critical Next 16 callouts

- **`middleware.ts` is renamed `proxy.ts`.** Host-based routing (subdomain → published site, custom domain → published site, admin auth gate) lives in `proxy.ts` at the project root. Do not create a `middleware.ts` file.
- **Route handler params are Promises.** Write `const { id } = await params;`, not `const { id } = params;`. This is a v16 breaking change from older Next.
- **Server Actions + Route Handlers are the recommended mutation/API patterns.** Use server actions for form-driven mutations (RSVP submit, save draft, publish). Use route handlers for webhooks (Stripe), OAuth callbacks (Auth.js), and the existing AI endpoints.
- **AGENTS.md warns** the project's Next is not the Next your training data knows. Consult `node_modules/next/dist/docs/` before writing new route/middleware/caching patterns.

## Data model

Managed by Drizzle. Migrations via `drizzle-kit push` for dev, SQL migration files for prod.

```sql
-- Auth (Auth.js drizzle adapter owns these)
users (id uuid pk, email text unique, name text, image text, role text default 'user', created_at timestamptz)
accounts (...)
sessions (...)
verification_tokens (...)

-- Core site ownership
sites (
  id uuid pk,
  owner_id uuid fk users,
  slug text unique,                     -- /i/{slug} and {slug}.coded-with-love.com
  custom_domain text unique nullable,   -- paid + opt-in
  status text default 'draft',          -- 'draft' | 'published' | 'unpublished'
  tier text default 'free',             -- 'free' | 'paid'
  published_version_id uuid nullable fk site_versions,
  created_at timestamptz, updated_at timestamptz
)

site_versions (
  id uuid pk,
  site_id uuid fk sites,
  data jsonb,                           -- full WeddingData snapshot
  created_at timestamptz
)
-- draft = sites row's latest version where id != published_version_id
-- published = the version whose id == sites.published_version_id

-- Guests (per-site address book)
guest_groups (
  id uuid pk,
  site_id uuid fk sites,
  label text,                           -- "The Smith Family"
  max_party_size int default 1,
  invite_token text unique,             -- for /r/{token} group invite link
  invited_at timestamptz nullable
)

guests (
  id uuid pk,
  group_id uuid fk guest_groups,
  name text,
  email text nullable,
  phone text nullable
)

rsvps (
  id uuid pk,
  guest_id uuid fk guests,
  attending bool,
  meal_preference text nullable,
  dietary_notes text nullable,
  message text nullable,
  submitted_at timestamptz
)

views (
  id uuid pk,
  site_id uuid fk sites,
  guest_id uuid fk guests nullable,     -- known if visiting via /r/{token}
  ip_hash text,                         -- SHA-256 of IP, no PII
  user_agent text,
  ts timestamptz
)

-- Payments
payments (
  id uuid pk,
  site_id uuid fk sites,
  user_id uuid fk users,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_cents int,
  currency text default 'usd',
  status text,                          -- 'pending' | 'paid' | 'refunded' | 'failed'
  created_at timestamptz
)

-- Analytics for admin
template_events (
  id uuid pk,
  user_id uuid fk users nullable,       -- nullable for anon demo
  anon_session_id text nullable,
  template text,                        -- 'romantic' | 'elegant' | 'minimal' | 'cinematic'
  action text,                          -- 'tried' | 'applied' | 'published_with'
  ts timestamptz
)

admin_audit (id uuid pk, admin_id uuid fk users, action text, target_id text, ts timestamptz)

-- Affiliate program (data model pre-baked; implementation deferred to post-launch)
affiliates (
  id uuid pk,
  user_id uuid fk users,
  code text unique,                     -- short share code, used in ?ref={code}
  commission_rate numeric,              -- e.g. 0.20 for 20%
  payout_method text,                   -- 'stripe_connect' | 'manual_paypal'
  payout_account_id text nullable,      -- Stripe Connect account id if applicable
  total_earned_cents int default 0,
  total_paid_out_cents int default 0,
  created_at timestamptz
)

referrals (
  id uuid pk,
  affiliate_id uuid fk affiliates,
  referred_user_id uuid fk users,
  site_id uuid fk sites nullable,       -- the paid site that triggered the commission
  status text,                          -- 'attributed' | 'earned' | 'paid_out' | 'clawed_back'
  commission_cents int nullable,
  attributed_at timestamptz,            -- when signup happened with cookie present
  earned_at timestamptz nullable,       -- when payment completed
  paid_out_at timestamptz nullable
)
```

### Hot vs blob

- **Hot / indexed:** `sites.slug`, `sites.custom_domain`, `sites.status`, `sites.tier`, `sites.owner_id`, `guest_groups.invite_token`, `users.email`.
- **JSONB blob:** `site_versions.data` holds the full `WeddingData` shape from `src/lib/types.ts`. Evolving `WeddingData` does not require a schema migration — just type updates.

## Routing topology

| Route | Purpose | Auth |
|---|---|---|
| `/` | Marketing landing with template gallery | Public |
| `/builder` | Anonymous demo builder (current behavior) | Public, no persistence |
| `/builder/[siteId]` | Authenticated builder for a specific site | Owner only |
| `/builder/[siteId]/settings` | Slug, custom domain, danger zone | Owner only |
| `/dashboard` | User's site list | Authenticated |
| `/i/[slug]` | Free-tier published invite (watermarked) | Public |
| `/r/[token]` | Guest RSVP page (per guest group) | Token-gated, no account |
| `/preview/[siteId]` | Owner-only shareable draft preview | Signed URL or owner |
| `/admin/*` | Admin overview, users, sites, templates, finance | `users.role = 'admin'` |
| `/_published/[slug]` | Internal render target for subdomain / custom-domain rewrites | Public via proxy.ts |
| `/api/auth/[...nextauth]` | Auth.js endpoints | Public |
| `/api/webhooks/stripe` | Stripe event handler | Signature-verified |
| `/api/chat` | OpenAI conversation API (existing) | Public |
| `/api/generate` | OpenAI content generation (existing) | Public |
| `/api/validate` | OpenAI input validation (existing) | Public |

`proxy.ts` at root handles:
- Subdomain parsing: `{slug}.coded-with-love.com` → rewrite to `/_published/{slug}` (only if `sites.tier = 'paid'` and `status = 'published'`)
- Custom domain routing: match `Host` header against `sites.custom_domain` → same rewrite
- Admin gate: deny `/admin/*` unless session has `role = 'admin'`
- Optimistic session checks for `/builder/[siteId]` and `/dashboard` (defense in depth — server actions also verify)

## Current state (shipped)

Form-first builder with per-template section curation is in production:

- Landing page template cards pass `?theme=` to `/builder` so the chosen template applies on arrival (`src/app/page.tsx`)
- `ThemeQueryInitializer` in `src/app/builder/page.tsx` reads the query param, seeds `data.theme`, and (if colors aren't already customized) seeds `data.colors` from `THEME_PALETTES`
- Template picker modal (`src/components/edit/TemplatePicker.tsx`) opens from a "Change" link in Step 1 — visual grid of all 17 templates with thumbnails + premium badges
- `THEME_PALETTES` and `THEME_NAMES` exports in `src/lib/themes.ts`; `SECTION_METADATA` catalog of all 16 section types
- **17 themes**: Romantic, Elegant, Minimal, Cinematic, Garden, Modern, Art Deco, Boho, Coastal, Vintage, Daisy, Rustic, Watercolor, Tropical, Whimsical, Regal, Industrial — each with its own `sections: SectionId[]` curating which sections appear and in what order (Hero pinned first)
- **16 section types**: 8 core (hero, story, countdown, details, timeline, dresscode, rsvp, closing) + 8 optional (gallery, travel, registry, faq, weddingParty, map, hashtag, saveTheDate). Some optional sections are marked `isPremium` (visual badge only — payment gating ships in Phase 5)
- Section manager UI in Step 4 of `EditPanel` with drag-to-reorder via `@dnd-kit/sortable` (mouse + touch + keyboard support); user override stored as `data.userSections`
- Form-first editor: 4 collapsible steps + Advanced. Step 1 = essentials & introduction; Step 2 = the love story; Step 3 = logistics; Step 4 = section manager + content for any optional sections enabled
- Click-to-edit + active-section highlight: clicking a preview section opens the matching step + scrolls to the field; whichever step is open lights up its corresponding preview section
- AI surfaced as inline assist (`✨ Generate` dropdown) on tagline, story, welcome, and note-to-guests — with optional tone overrides (Romantic / Casual / Heartfelt / Witty / Cinematic)
- Debounced field updates (`DebouncedInput` / `DebouncedTextarea`, 250ms) for typing fields; instant commit for selects, toggles, color pickers, image uploads
- GSAP animations in the preview (`src/components/preview/WeddingPreview.tsx`)
- OpenAI endpoint: `/api/generate` (content) — accepts an optional `tone` override
- Mobile-responsive builder via `useIsMobile` (`src/lib/useIsMobile.ts`); 2-tab Preview/Edit layout on mobile

The earlier chat-driven onboarding (27-step `conversation.ts`, `ChatPanel`, `/api/chat`, `/api/validate`) was removed when the builder moved to form-first.

Everything is currently single-user, in-memory, no auth, no persistence.

## Phase roadmap

| # | Name | Status | Est. | Blocks |
|---|---|---|---|---|
| 1 | Template-first onboarding | ✅ Done | — | — |
| 2 | Auth + persistence | Pending | ~1.5 wk | All below |
| 3 | RSVP system | Pending | ~2 wk | 2 |
| 4 | Publishing + free tier (`/i/{slug}`) | Pending | ~1 wk | 2 |
| 5 | Stripe payments | Pending | ~1 wk | 4 |
| 6 | Subdomain + custom domain | Pending | ~1.5 wk | 5 |
| 7 | Admin dashboard | Pending | ~1 wk | 2, 5 |
| 8 | Polish + premium template machinery | Pending | ~1 wk | 4 |

**Total post-Phase 1:** ~9 weeks of focused solo work. Phases 3 and 4 can run in parallel after 2. Phase 7 can run in parallel with 5/6 once 2 is in.

### Phase 2 — Auth + Persistence + Demo Migration

**Goal:** Real accounts. Real saved sites. Demo still works, and signup migrates the current localStorage draft into the user's first real site.

- Postgres + Drizzle setup on Neon; schema from the Data Model section
- Auth.js v5 install with Google + Apple + Resend magic-link
- `proxy.ts` (not `middleware.ts`) for optimistic session checks
- `WeddingContext` becomes auth-aware: debounced autosave to `site_versions` when authenticated, localStorage fallback when anonymous
- "Save your work" CTA in builder header triggers sign-in; on first authenticated load, localStorage draft migrates to a new `sites` row
- New routes: `/builder/[siteId]`, `/dashboard`

Key files: `src/lib/db/schema.ts`, `src/lib/auth.ts`, `proxy.ts`, `src/lib/data/sites.ts`, `src/app/builder/[siteId]/page.tsx`, `src/app/dashboard/page.tsx`.

### Phase 3 — RSVP System

**Goal:** Guests can RSVP. Couples can see who's coming. Couples can send invites. View tracking starts.

- Guests tab in builder (desktop 3rd tab, mobile 4th tab): manage guest groups, bulk CSV import
- Tokenized guest links at `/r/[token]` — the token IS the auth. No guest login.
- Multi-guest submit: one group link, N RSVPs in one form submit
- View tracking on GET `/r/[token]` (group_id, ip_hash, ua)
- Send invites + reminders via Resend + React Email templates
- Couple's RSVP dashboard: summary (attending / declined / pending), filters, per-group status, CSV export

Key files: `src/components/guests/*`, `src/app/r/[token]/page.tsx`, `src/lib/data/guests.ts`, `src/lib/email/*`.

### Phase 4 — Publishing + Free Tier

**Goal:** Couples publish. Free tier publishes to `coded-with-love.com/i/{slug}` with a small footer watermark.

- "Publish" validates required fields, prompts for slug, snapshots draft to `site_versions`, sets `sites.status = 'published'` and `sites.published_version_id`
- `/i/[slug]` server-renders published `WeddingPreview` with theme-aware OG image
- `<WatermarkFooter />` visible on free tier only
- Edit-after-publish writes to a new draft version; "Republish" updates `published_version_id`

Key files: `src/lib/data/publish.ts`, `src/app/i/[slug]/page.tsx`, `src/app/i/[slug]/opengraph-image.tsx`, `src/components/preview/WatermarkFooter.tsx`.

### Phase 5 — Stripe Payments

**Goal:** One-time payment upgrades a site from free to paid tier.

- Single Stripe Product / Price configurable via env
- Server action `createCheckoutSession(siteId)` with `client_reference_id = siteId`
- Webhook at `/api/webhooks/stripe` verifies signature, handles `checkout.session.completed` (flip tier to paid) and `charge.refunded` (flip back to free)
- "Upgrade to remove watermark" CTA visible to owner on free-tier sites

Key files: `src/lib/payments/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/components/billing/UpgradeCta.tsx`.

### Phase 6 — Subdomain + Custom Domain

**Goal:** Paid sites serve at `{slug}.coded-with-love.com` by default and optionally at `{custom}.com`.

- DNS: `*.coded-with-love.com` → Vercel
- `proxy.ts` reads `Host`, parses subdomain, verifies paid + published, rewrites to `/_published/{slug}`
- Custom domain wizard in `/builder/[siteId]/settings`: calls Vercel Domains API, shows DNS instructions, polls for SSL provisioning
- `proxy.ts` also routes incoming Host headers matching any `sites.custom_domain` to the same internal path

Key files: `proxy.ts`, `src/lib/domains/vercel.ts`, `src/app/_published/[slug]/page.tsx`, `src/app/builder/[siteId]/settings/page.tsx`.

### Phase 7 — Admin Dashboard

**Goal:** Operator visibility.

- `users.role = 'admin'` gate in `proxy.ts` + per-page server check
- `/admin` overview (users, active sites, monthly revenue, refunds, signups)
- `/admin/users`, `/admin/sites`, `/admin/templates`, `/admin/finance`
- `template_events` logging wired up in `TemplatePicker` (modal), publish flow, edit-panel theme changes
- All destructive admin actions write to `admin_audit`

Key files: `src/app/admin/*`, `src/lib/data/admin.ts`, `src/components/admin/*`.

### Phase 8 — Polish + Premium Template Machinery

**Goal:** Last-mile UX + framework for paid templates later. Design-quality polish guidance (add vs. refine, palette refresh, premium-tier considerations) lives in [DESIGN.md](./DESIGN.md).

- Shareable draft preview: `/preview/[siteId]` (signed URL or owner auth)
- QR code modal in builder header
- ✨ Regenerate now lives inline on each AI-generated field via the AI Generate dropdown — already shipped
- `isPremium` flag on themes (`ThemeConfig.isPremium`) and on sections (`SectionMeta.isPremium`) — already shipped as visual badges
- Lock icon in template picker modal and section manager — already shipped (visual only)
- Tier check at publish — wire `isPremium` on theme + on any selected section to gate publish flow
- Tier check at publish for premium-section attribution

Key files: `src/app/preview/[siteId]/page.tsx`, `src/components/builder/ShareDraftButton.tsx`, `src/components/builder/QrPreviewModal.tsx`, `src/lib/templates.ts`.

## Post-launch opportunities

Not part of the v1 roadmap. Called out here because the data model / architecture should accommodate them without rework.

### Affiliate program (deferred to post-M3)

**Why deferred:** Affiliate programs only pay off at scale. Below ~10 paying customers, no one will recommend you for a commission. Design the data model and tracking flow now; ship the UI and payouts after M3 has proven the paid funnel.

**Flow:**
1. Affiliate shares `coded-with-love.com/?ref={code}` (or any path with the param).
2. `proxy.ts` sets a 90-day `ref_code` cookie on first hit if the param is present and the code maps to a row in `affiliates`.
3. On signup, attribution: if the cookie is set, write a `referrals` row with `status = 'attributed'` linking the new `users.id` to the affiliate.
4. On `payment.status = 'paid'` webhook: if the payer has an attributed referral, flip `referrals.status = 'earned'`, record `commission_cents = payment.amount_cents * affiliate.commission_rate`, bump `affiliates.total_earned_cents`.
5. Payout: Stripe Connect transfer (automated) or manual PayPal export (shipping-ready in a day). Flip `status = 'paid_out'`.
6. On refund: `status = 'clawed_back'`, reverse the earned totals.

**Decisions for later:**
- Commission rate (20–30% of one-time fee is typical for SaaS affiliates).
- Payout mechanism: Stripe Connect (clean, legal, ~1 week to build) vs manual PayPal export (ugly but shippable in a day).
- Self-serve sign-up vs invite-only affiliates (invite-only is simpler and avoids spammy recommenders early).
- Affiliate dashboard at `/dashboard/affiliate` — earnings, click-through, conversion rate, payout history.
- Landing page at `/a/[code]` that sets the cookie and redirects to `/` (for prettier affiliate share links).

### Other deferred ideas (sketched, not detailed)

- **Premium templates.** 2–3 paid themes after M4 to test the tier-gating machinery.
- **Multi-language invites.** Phase 4's render path separates content from theme; i18n is mostly translation work.
- **Guest book / photo wall.** Post-wedding memory page — natural upsell beyond the one-time fee.
- **Co-owner accounts.** v1 is single-login; partners may want separate accounts later. ~1 week of auth work.
- **Planner / vendor accounts.** A new role for wedding planners managing multiple couples' sites.
- **AI RSVP insights.** "Expect ~120 confirmed guests by June 15" powered by view + RSVP data.
- **White-label for planners.** Monthly fee, planner's brand on sites they manage.

## Conventions Claude should follow

- **Field → Section mapping:** `FIELD_SECTION` in `EditPanel.tsx` (field name → preview section ID, drives onFocus → setScrollTarget) and `FIELD_TO_STEP` in the same file (field name → which step contains it, drives click-to-edit navigation). New fields need entries in both so the form/preview stay in sync.
- **Section registry:** `SECTION_METADATA` in `themes.ts` is the source of truth for what sections exist. Adding a new section requires entries in `SECTION_METADATA`, `sectionsById` in `WeddingPreview.tsx`, and `SHARED_OPTIONAL_DUMMY` in `dummyData.ts`. See the `/preview-section` skill.
- **Warm palette values:** backgrounds `#FDFBF7 / #FAF7F2 / #F5F3EF`, borders `#EDE8E0 / #E0D9CE / #DDD5CA`, text `#1A1A1A / #2C2C2C / #5C4F3D / #8B7355`, muted `#A09580 / #B8A48E / #C4B8A4 / #D4C9B8`. Match these for any new builder UI.
- **Server actions for mutations.** Route handlers reserved for webhooks, OAuth callbacks, and the existing AI endpoints.
- **Drizzle for DB access.** No raw SQL except in migration files.
- **`proxy.ts`, not `middleware.ts`,** for host-based routing. Next 16 renamed the file.
- **Route handler params are Promises** in Next 16: `const { id } = await params;`.
- **JSONB for `WeddingData`** on `site_versions.data`; hot fields stay normalized.
- **Ephemeral demo, persistent account:** anonymous `/builder` uses localStorage only. Don't hit the DB for anonymous users. Migration from localStorage to DB happens once, on first authenticated load.

## What this doc is NOT

- **Not an implementation plan.** Those live in plan files under `~/.claude/plans/`. This is the target architecture and current state.
- **Not a changelog.** `git log` is authoritative for history.
- **Not API docs.** Types in `src/lib/types.ts` and (eventually) the Drizzle schema in `src/lib/db/schema.ts` are canonical.
- **Not CLAUDE.md.** CLAUDE.md describes how today's code works and what commands to run. This doc answers "where are we headed and why".
