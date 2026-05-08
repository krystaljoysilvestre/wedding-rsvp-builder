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
                │   /i/{slug}  free published invite (watermark)│
                │   /admin     admin dashboard                 │
                │                                              │
                │   {slug}.coded-with-love.com                 │
                │   (subdomain unlock — paid add-on)            │
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
| Pricing | À la carte, single Stripe Checkout. Each premium section + premium theme + branded subdomain + custom domain priced individually. Free tier publishes with watermark to `/i/{slug}`. **Any** premium purchase removes the watermark — never sold standalone. Currency: **PHP**. |
| Couple collaboration | Share one login. No co-owner accounts in v1. |
| Custom domains | Paid add-on (one-time PHP 499). |
| Admin dashboard | Hand-rolled at `/admin`, not Metabase. |
| Demo + auth coexistence | Anonymous demo at `/builder` stays. Pre-account data is ephemeral (localStorage). On signup, the current draft migrates to a real `sites` row. |
| URL structure | Free: `coded-with-love.com/i/{slug}`. Branded subdomain (paid add-on): `{slug}.coded-with-love.com`. Custom domain (paid add-on): `{custom}.com`. |
| Templates | Per-template pricing via `priceCents` on the manifest. v1 launches with all 17 themes priced at 0 (free); the field exists for future paid themes. Pricing tiers: Standard PHP 499, Signature PHP 999, Designer-collab PHP 1499. **Designer-authored templates land via the Template Engine (Phase 9 — ships immediately after Phase 2)** so the designer collaborator can start authoring early; the friend's templates land in a `templates` DB table while the legacy 17 stay in `themes.ts` until Phase 8 cleanup. See [TEMPLATES.md](./TEMPLATES.md) for the SDK contract. Per-section format variants and custom fields live in templates, not in the editor. |

## Pricing model

À la carte at publish. The free tier remains generous (full editor, every section is *addable*, full preview); the gate is at Publish, where the upsell modal aggregates whatever premium items the couple has chosen into a single Stripe Checkout session.

| Item | Price (PHP) | Kind |
|---|---|---|
| Premium section: Map | 99 | section |
| Premium section: Save the Date | 99 | section |
| Premium section: Travel | 199 | section |
| Premium section: Wedding Party | 199 | section |
| Premium theme — Standard | 499 | theme |
| Premium theme — Signature | 999 | theme |
| Premium theme — Designer collab (future) | 1,499 | theme |
| Branded subdomain (`{slug}.coded-with-love.com`) | 299 | subdomain |
| Custom domain support | 499 | custom_domain |
| Watermark removal | Free with any premium purchase | (bundled) |

**Why à la carte instead of single tier:** lower entry barrier (couples upgrade for one section at PHP 99 instead of bouncing at a PHP 1,499 single-tier wall) at the cost of a smaller average order value. Bet: total revenue is higher because conversion rate roughly 2–3× a flat tier. Decision-paralysis is the main risk; mitigated by the cart UX at publish (couples add to cart by *using* the feature in the editor — no separate pricing-page tour).

**Why PHP not USD:** Filipino market; Stripe supports PHP natively; pricing in local currency converts ~30% better than USD on display.

**Watermark logic:** the moment a couple has *any* completed payment for their site (any line item, any kind), the watermark is hidden. Don't sell watermark removal as its own SKU — that feels nickel-and-diming when they've already paid for, say, a Map.

**Cart aggregation:** Stripe Checkout Session takes multiple line items in one transaction. Couples pay one consolidated invoice. Refunds happen per-line-item via the webhook handler (mark the corresponding `purchases` row refunded; the site's premium gating re-evaluates on next render).

## Tech stack

- **Framework:** Next.js 16.2.4 with Turbopack
- **Auth:** Auth.js v5 (NextAuth) with `@auth/drizzle-adapter`. Providers: Google, Apple, email magic link
- **Database:** Postgres on Neon (free tier with branching per preview deploy). ORM: Drizzle (SQL-first, serverless-friendly)
- **Payments:** Stripe Checkout (hosted), PHP currency, multi-line-item Checkout Sessions for à la carte. Webhooks via a route handler.
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
  published_version_id uuid nullable fk site_versions,
  created_at timestamptz, updated_at timestamptz
  -- No `tier` column. À la carte means premium status is per-item; derive
  -- from the `purchases` table at render time via `purchases_for(site_id)`.
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

-- Payments — top-level Stripe Checkout Session record (one per
-- transaction). Aggregates one or more `purchases` line items.
payments (
  id uuid pk,
  site_id uuid fk sites,
  user_id uuid fk users,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_cents int,                     -- total of all line items in this session
  currency text default 'php',
  status text,                          -- 'pending' | 'paid' | 'refunded' | 'failed'
  created_at timestamptz
)

-- Purchases — per-line-item record. Each premium thing the couple paid for
-- gets its own row, allowing per-item refunds and per-item rendering checks
-- ("did this site pay for the Map section?"). No `tier` column on `sites`;
-- presence-of-row in this table is the source of truth.
purchases (
  id uuid pk,
  payment_id uuid fk payments,
  site_id uuid fk sites,                -- duplicated for fast site-scoped lookup
  kind text,                            -- 'theme' | 'section' | 'subdomain' | 'custom_domain'
  ref text nullable,                    -- 'cinematic' for theme, 'travel' for section, null for subdomain/custom_domain
  price_cents int,
  status text default 'paid',           -- 'paid' | 'refunded'
  created_at timestamptz
)
-- Indexes:
--   purchases (site_id, kind, ref)     -- "is this thing paid for?" lookup
--   purchases (payment_id)             -- invoice display + refund batching
--
-- Render-time checks:
--   Watermark hidden  ↔ exists(purchases where site_id=X and status='paid')
--   Premium section   ↔ exists(purchases where site_id=X and kind='section' and ref=sectionId and status='paid')
--   Premium theme     ↔ exists(purchases where site_id=X and kind='theme' and ref=themeName and status='paid')
--   Subdomain serving ↔ exists(purchases where site_id=X and kind='subdomain' and status='paid')
--   Custom domain     ↔ exists(purchases where site_id=X and kind='custom_domain' and status='paid')

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

- **Hot / indexed:** `sites.slug`, `sites.custom_domain`, `sites.status`, `sites.owner_id`, `guest_groups.invite_token`, `users.email`. `purchases (site_id, kind, ref)` for premium-content gating.
- **JSONB blob:** `site_versions.data` holds the full `WeddingData` shape from `src/lib/types.ts`. Evolving `WeddingData` does not require a schema migration — just type updates.

## Routing topology

| Route | Purpose | Auth |
|---|---|---|
| `/` | Marketing landing with template gallery | Public |
| `/builder` | Anonymous demo builder (current behavior) | Public, no persistence |
| `/builder/[siteId]` | Authenticated builder for a specific site | Owner only |
| `/builder/[siteId]/settings` | Slug, custom domain, danger zone | Owner only |
| `/dashboard` | User's site list | Authenticated |
| `/i/[slug]` | Published invite at the path URL. Watermarked unless the site has any paid `purchases` row. | Public |
| `/r/[token]` | Guest RSVP page (per guest group) | Token-gated, no account |
| `/preview` | **(Interim, shipped)** Owner-only fullscreen draft preview. Hydrates from `localStorage`, so other browsers/sessions see a fallback. | localStorage-tied (interim) → real auth in Phase 2 |
| `/preview/[siteId]` | **(Phase 2+ target)** Owner-only shareable draft preview with a signed URL or session-bound auth. Replaces / supersets the `/preview` interim route. | Signed URL or owner |
| `/share` | **(Removed pending auth)** Previously hosted a URL-hash preview for partner-share. Removed because watermarks weren't a real bypass guard for premium content. Returns post-auth as a signed `/preview/[siteId]?token=…` URL. | — |
| `/admin/*` | Admin overview, users, sites, templates, finance | `users.role = 'admin'` |
| `/_published/[slug]` | Internal render target for subdomain / custom-domain rewrites | Public via proxy.ts |
| `/api/auth/[...nextauth]` | Auth.js endpoints | Public |
| `/api/webhooks/stripe` | Stripe event handler | Signature-verified |
| `/api/chat` | OpenAI conversation API (existing) | Public |
| `/api/generate` | OpenAI content generation (existing) | Public |
| `/api/validate` | OpenAI input validation (existing) | Public |

`proxy.ts` at root handles:
- Subdomain parsing: `{slug}.coded-with-love.com` → rewrite to `/_published/{slug}` (only if `status = 'published'` AND a paid `purchases` row exists with `kind='subdomain'` for the site)
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
- **16 section types**: 8 core (hero, story, countdown, details, timeline, dresscode, rsvp, closing) + 8 optional (gallery, travel, registry, faq, weddingParty, map, hashtag, saveTheDate). Travel, Wedding Party, Map, and Save the Date are premium and gated at publish via the cart (`priceCents` on `SectionMeta` — see Pricing model)
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

Phase numbers are identifiers, not strict shipping order. The table is ordered by **actual ship sequence**.

| # | Name | Status | Est. | Blocks |
|---|---|---|---|---|
| 1 | Template-first onboarding | ✅ Done | — | — |
| 2 | Auth + persistence + email-allowlist admin gate | Pending | ~1.5 wk | All below |
| 9 | **Template Engine v1** (scoped) | Pending — next after Phase 2 | ~2–3 wk | 2 |
| 3 | RSVP system | Pending — parallel with 9 | ~2 wk | 2 |
| 4 | Publishing + free path URL (`/i/{slug}`) | Pending | ~1 wk | 2 |
| 5 | Stripe payments (à la carte cart) | Pending | ~1 wk | 4 |
| 6 | Subdomain + custom domain | Pending | ~1.5 wk | 5 |
| 7 | Admin dashboard (full role-based) | Pending | ~1 wk | 2, 5 |
| 8 | Polish + premium machinery | Pending | ~1 wk | 4 |

**Why Phase 9 ships immediately after Phase 2:** Step 3 of the editor (Customize) is fundamentally template-shaped — sections, formats, and custom fields are all template-driven. The 17 in-code themes were always temporary scaffolding. We have a designer (the founder's friend, who originated the app) ready to start authoring templates within ~2 months. Building Phase 9 early unblocks them; the alternative is re-platforming Step 3 in 6 months. Brand differentiation IS templates — they're not a side feature.

**v1 Phase 9 scope (deliberately small):**
- `/admin/template-engine` page protected by a hardcoded `ALLOWED_ADMINS` env var (just the founder + the friend)
- HTML parser + manifest derivation + validator + auto-fix suggestions
- Renderer (HTML AST + field substitution + iteration + conditionals)
- `templates` DB table for designer-authored templates
- **Migrate 2 of 17 core themes** (e.g. Romantic + Cinematic) to manifest format as proof-of-contract
- The friend ships 1–2 net-new templates as final validation

**Deferred to Phase 7:** the full role-based admin dashboard (`users.role = 'admin'` + `/admin/users` + audit log + finance views). Phase 9's email allowlist is the temporary admin gate.

**Deferred to Phase 8:** migrating the remaining 15 core themes to manifest format — a slow, low-priority cleanup once everything else is stable.

**Total post-Phase 1:** ~10–12 weeks. Phase 9 + Phase 3 can run in parallel after Phase 2. Phase 4 follows. Phase 7 can run in parallel with 5/6 once Phase 2 is in.

## Pre-flight checklist for Phase 2

External services and accounts to set up **before** writing Phase 2 code. Several have lead times — Google OAuth verification alone takes 1–3 weeks — so these need to start in parallel with the build.

### Step 0: Domain (do this today)

**Buy `coded-with-love.com`** at Cloudflare Registrar (~$10/yr — at-cost, includes free DNS + SSL passthrough). Alternatives: Porkbun (~$10/yr), Namecheap (~$15/yr).

1. Sign up at https://dash.cloudflare.com (free)
2. Domain Registration → Register Domains → search `coded-with-love.com` → buy
3. Auto-renew on
4. Don't point the domain anywhere yet — just hold it

### Step 1: Service signups (~1 hour, do on Day 1 of Phase 2)

Do these in order:

#### A. Vercel Pro (production hosting) — $20/mo

Hobby plan prohibits commercial use. Need Pro for any real-customer deploy.

1. https://vercel.com → sign in with GitHub → upgrade to Pro
2. Add the repo as a Vercel project (auto-deploy on push to `main`)
3. Project Settings → Domains → add `coded-with-love.com`
4. Vercel gives a CNAME / A record → add at Cloudflare → SSL provisions automatically (~30 min)

#### B. Neon Postgres (database) — Free tier

0.5 GB storage, branching per preview deploy.

1. https://neon.tech → sign up with GitHub
2. Create project: `coded-with-love` in `ap-southeast-1` (Singapore — closest to Manila)
3. Copy the connection string (`postgres://user:pass@host/dbname?sslmode=require`)
4. Vercel → project Settings → Environment Variables → add `DATABASE_URL`
5. (Phase 2 polish) Set up Neon's "Vercel integration" so each PR preview gets its own branched DB

#### C. Resend (transactional email) — Free tier

100 emails/day, 3000/month. Enough for early.

1. https://resend.com → sign up
2. API Keys → create one → copy
3. Vercel env vars → add `RESEND_API_KEY`
4. Initial from-address: `onboarding@resend.dev` (Resend's dev domain — works immediately)
5. (Defer until you're ready for production emails) Add `coded-with-love.com` as a verified domain → SPF + DKIM at Cloudflare → switch from-address to `noreply@coded-with-love.com`

#### D. Google Cloud Console (Google OAuth) — **start ASAP, lead time 1–3 weeks**

Verification clock starts when you submit the consent screen. Real users see "This app isn't verified" warnings until verification completes; submit early so the clock runs in parallel with the build.

1. https://console.cloud.google.com → create new project: `Coded with Love`
2. APIs & Services → OAuth consent screen
   - User Type: **External**
   - App name: `Coded with Love`
   - User support email: your email
   - App logo: 256×256 PNG
   - Application home page: `https://coded-with-love.com`
   - App domain: `coded-with-love.com`
   - Developer contact: your email
3. Scopes: `userinfo.email`, `userinfo.profile`, `openid`
4. Test users: add yourself + the friend's email (lets you sign in during dev before verification finishes)
5. **Submit for verification** — clock starts. Google may request a screencast of OAuth flow once you have a deployed URL; respond within 24h.
6. Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Name: `Coded with Love Web`
   - Authorized JavaScript origins: `http://localhost:3000`, `https://coded-with-love.com`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://coded-with-love.com/api/auth/callback/google`
     - `https://*.vercel.app/api/auth/callback/google` (Google may flag wildcards — fall back to specific Vercel preview URLs if rejected)
7. Copy Client ID + Client Secret → Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

#### E. Apple Developer (skip for v1)

$99/yr. Defer. Google sign-in + email magic link via Resend is sufficient. Add later if iOS users actually complain.

#### F. PostHog (analytics — optional now, do whenever) — Free tier

1 M events/mo.

1. https://posthog.com → sign up → cloud (EU region for lower latency from Manila)
2. Project API key → copy
3. Vercel env vars → `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (`https://eu.i.posthog.com`)
4. Initialize in app's root layout — Phase 2 polish, not blocking

#### G. Stripe (defer to Phase 5)

Free to register. Don't need it until Phase 5. When you do: stripe.com → register → set up PHP currency → defer Stripe Connect to post-launch.

### Step 2: Local + Vercel env vars

`.env.local` (gitignored) for local dev:

```bash
# Database
DATABASE_URL=postgres://...

# Auth.js
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Resend
RESEND_API_KEY=re_...

# Admin allowlist (temporary until Phase 7 ships role-based admin)
ALLOWED_ADMINS=you@example.com,friend@example.com

# Optional analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Mirror in **Vercel project settings → Environment Variables**:
- `Production` env: `AUTH_URL=https://coded-with-love.com`
- `Development` env: `AUTH_URL=http://localhost:3000`
- `Preview` env: leave empty — Vercel auto-injects the deploy URL

### Step 3: Sequence

1. **Today** — buy domain (10 min)
2. **Phase 2 Day 1** — sign up Vercel Pro / Neon / Resend (~30 min)
3. **Phase 2 Day 1** — Google Cloud Console: create project + submit OAuth verification (~30 min, clock runs 1–3 weeks in background)
4. **Phase 2 Day 2–7** — build Auth.js + Drizzle schema + email-allowlist admin gate
5. **Phase 2 Day 7+** — monitor Google verification; respond to any clarifications within 24h
6. **Phase 2 wrap** — Resend domain verification → switch to `noreply@coded-with-love.com`; deploy to production; verify Google OAuth on the real domain

### Step 4: Total cost during Phase 2 build (no users yet)

| Service | Cost |
|---|---|
| Vercel Pro | $20/mo |
| Neon | $0 (free tier) |
| Resend | $0 (free tier) |
| Cloudflare domain | ~$1/mo amortized |
| PostHog | $0 (free tier) |
| Google | $0 |
| **Total** | **~$21/mo** |

Stripe + Apple Developer add later when needed.

### Phase 2 — Auth + Persistence + Demo Migration

**Goal:** Real accounts. Real saved sites. Demo still works, and signup migrates the current localStorage draft into the user's first real site.

- Postgres + Drizzle setup on Neon; schema from the Data Model section
- Auth.js v5 install with Google + Apple + Resend magic-link
- `proxy.ts` (not `middleware.ts`) for optimistic session checks
- `WeddingContext` becomes auth-aware: debounced autosave to `site_versions` when authenticated, localStorage fallback when anonymous
- "Save your work" CTA in builder header triggers sign-in; on first authenticated load, localStorage draft migrates to a new `sites` row
- New routes: `/builder/[siteId]`, `/dashboard`
- **Email-allowlist admin gate.** Add `ALLOWED_ADMINS` env var (comma-separated emails). `proxy.ts` denies `/admin/*` unless the session's email is in the list. Temporary gate for Phase 9 until Phase 7 ships full role-based admin (`users.role = 'admin'` + audit log).
- **Replace `/preview` interim auth proxy.** Today's `/preview` route uses
  `localStorage` as a poor-man's session check (see
  [src/app/preview/page.tsx](src/app/preview/page.tsx) — it's not a security
  guarantee, just deters casual link sharing). When auth lands, swap that
  for a real session check + signed `/preview/[siteId]?token=…` URL. The
  ReviewModal "Open in new tab" link should regenerate accordingly.
- **Reintroduce partner-share as a signed URL.** The interim `/share`
  route + `ShareDraftButton` were removed once it became clear watermarks
  couldn't gate premium content properly. Bring sharing back here, this
  time as `/preview/[siteId]?token=…` — owner-bound, expirable, revocable,
  and premium-aware (paid templates still rendered for the partner since
  they're sharing within the same paid account; anonymous link recipients
  get watermarked free-theme rendering or a sign-in wall depending on the
  owner's tier).

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

### Phase 4 — Publishing + Free Path URL

**Goal:** Couples publish. Sites without any paid `purchases` row publish to `coded-with-love.com/i/{slug}` with a small footer watermark.

- "Publish" validates required fields, prompts for slug, snapshots draft to `site_versions`, sets `sites.status = 'published'` and `sites.published_version_id`
- `/i/[slug]` server-renders published `WeddingPreview` with theme-aware OG image
- `<WatermarkFooter />` visible only when `hasAnyPurchase(siteId) === false`
- Edit-after-publish writes to a new draft version; "Republish" updates `published_version_id`

Key files: `src/lib/data/publish.ts`, `src/app/i/[slug]/page.tsx`, `src/app/i/[slug]/opengraph-image.tsx`, `src/components/preview/WatermarkFooter.tsx`.

### Phase 5 — Stripe Payments (à la carte)

**Goal:** Couples pay for whatever premium items they've added to their site in a single Stripe Checkout, with each item as its own line item. Watermark removal is bundled free with any purchase.

- Stripe Products / Prices created per item (PHP currency):
  - One Product per **premium section** (Map PHP 99, Save the Date PHP 99, Travel PHP 199, Wedding Party PHP 199)
  - One Product per **premium theme price tier** (Standard PHP 499, Signature PHP 999, Designer PHP 1499) — themes share Products *by tier* rather than per-theme to keep Stripe organized; `purchases.ref` stores the actual theme name
  - Subdomain Product (PHP 299), Custom-domain Product (PHP 499)
- Server action `createCheckoutSession(siteId, items: PurchaseItem[])` — builds line items from the user's editor selections + opt-in subdomain/custom-domain choices, returns a hosted Checkout URL with `client_reference_id = siteId`
- **Cart-style upsell modal at the publish step:**
  ```
  Your premium add-ons:
    Cinematic theme         PHP 999
    Wedding Party section   PHP 199
    Map section              PHP 99
    Branded subdomain       PHP 299
                            ───────
    Total                   PHP 1,596
                            [ Pay & Publish ]
  ```
  Each line removable by going *back to the editor* (deselects the section, switches theme, declines the upgrade) — no separate "remove from cart" UI. Keeps the cart and the editor as a single source of truth.
- Webhook at `/api/webhooks/stripe` verifies signature, handles:
  - `checkout.session.completed` → insert `payments` row + N `purchases` rows derived from `line_items[]` (kind + ref are encoded in Stripe Product metadata)
  - `charge.refunded` → mark the relevant `purchases` rows as `status = 'refunded'`. Per-line refunds supported by passing line-item IDs in the refund metadata.
- Watermark / premium-content rendering reads the `purchases` table via small helpers (`hasPaidSection(siteId, sectionId)`, `hasAnyPurchase(siteId)`, etc.) — there is no `sites.tier` to consult.

Key files: `src/lib/payments/stripe.ts`, `src/lib/payments/cart.ts` (cart aggregation logic), `src/lib/payments/checks.ts` (rendering helpers), `src/app/api/webhooks/stripe/route.ts`, `src/components/billing/PublishCartModal.tsx`.

### Phase 6 — Subdomain + Custom Domain

**Goal:** Paid sites serve at `{slug}.coded-with-love.com` by default and optionally at `{custom}.com`.

- DNS: `*.coded-with-love.com` → Vercel
- `proxy.ts` reads `Host`, parses subdomain, verifies paid + published, rewrites to `/_published/{slug}`
- Custom domain wizard in `/builder/[siteId]/settings`: calls Vercel Domains API, shows DNS instructions, polls for SSL provisioning
- `proxy.ts` also routes incoming Host headers matching any `sites.custom_domain` to the same internal path

Key files: `proxy.ts`, `src/lib/domains/vercel.ts`, `src/app/_published/[slug]/page.tsx`, `src/app/builder/[siteId]/settings/page.tsx`.

### Phase 7 — Admin Dashboard

**Goal:** Operator visibility.

- **Replace the email-allowlist gate from Phase 2 with proper role-based admin** — `users.role = 'admin'` in `proxy.ts` + per-page server check. The `ALLOWED_ADMINS` env var becomes obsolete once role assignments are in the DB.
- `/admin` overview (users, active sites, monthly revenue, refunds, signups)
- `/admin/users`, `/admin/sites`, `/admin/templates`, `/admin/finance`
- `/admin/template-engine` (existing from Phase 9) gets a richer view: list of designer-authored templates, draft → published transitions, per-template usage stats
- `template_events` logging wired up in `TemplatePicker` (modal), publish flow, edit-panel theme changes
- All destructive admin actions write to `admin_audit`

Key files: `src/app/admin/*`, `src/lib/data/admin.ts`, `src/components/admin/*`.

### Phase 8 — Polish + Premium Machinery

**Goal:** Last-mile UX. Premium pricing is wired in earlier phases (Phase 5 Stripe + Phase 4 publish flow) — this is just the visual polish. Design-quality guidance lives in [DESIGN.md](./DESIGN.md).

- Shareable draft preview: `/preview/[siteId]` (signed URL or owner auth)
- QR code modal in builder header
- ✨ Regenerate now lives inline on each AI-generated field via the AI Generate dropdown — already shipped
- `priceCents?: number` field on themes (`ThemeConfig.priceCents`) and on sections (`SectionMeta.priceCents`) — replaces the old `isPremium` boolean. `priceCents = 0` (or undefined) means free; any positive number means premium and triggers the cart at publish.
- Per-item **price pill** on section-manager rows when `priceCents > 0` (e.g. *"Premium · PHP 199"*) — replaces the gold "Premium" pill with a price-bearing variant
- "Unlocks at publish" inline note inside premium section editors — already shipped as `PremiumPublishNote`. Update copy to mention the section's specific price (*"Adds PHP 199 at publish."*) once `priceCents` is wired
- Cart total in the Step 3 CTA copy when there's at least one premium item (e.g. *"Review & Publish · PHP 1,596"*)
- TemplatePicker thumbnails show price overlay on premium themes
- **Migrate the remaining 15 core themes** from `themes.ts` into the `templates` DB table using the same manifest format the designer uses. Phase 9 already migrated 2 (Romantic + Cinematic) as proof; this finishes the cleanup. Once done, `themes.ts` can be deleted entirely and the picker reads exclusively from the `templates` table.

Key files: `src/app/preview/[siteId]/page.tsx`, `src/components/builder/QrPreviewModal.tsx`, `src/lib/templates.ts`, `src/components/edit/SectionManager.tsx`, `src/components/edit/EditPanel.tsx`, `src/components/edit/TemplatePicker.tsx`.

### Phase 9 — Template Engine + Admin upload tool

**Ship sequence:** immediately after Phase 2. The editor's Step 3 (Customize) is fundamentally template-shaped — sections, formats, and custom fields are all template-driven — and the founder has a designer collaborator (the friend who originated the app) ready to author templates within the next ~2 months. Building Phase 9 early unblocks the designer; the cost is 2–3 weeks of platform work before paying customers, justified by the production model where designer-authored templates are the platform's core differentiator.

**v1 scope (deliberately small):**
- `/admin/template-engine` page protected by the email-allowlist admin gate from Phase 2 (no full role-based admin yet — that lands in Phase 7)
- HTML parser + manifest derivation + validator + auto-fix suggestions
- Renderer (HTML AST + field substitution + iteration + conditionals)
- `templates` DB table for designer-authored templates
- **Migrate 2 of the 17 core themes** to manifest format as proof-of-contract — pick the most distinctive ones (e.g. Romantic + Cinematic, or Romantic + Industrial)
- The friend authors 1–2 net-new templates as final validation
- The remaining 15 core themes stay in `themes.ts` for now; full migration is deferred to Phase 8

**Goal:** Designers (initially the founder's friend who originated the app) can author templates externally and add them to the platform via the `/admin/template-engine` page. Designer never writes TypeScript — they mark up HTML with `data-cwl-*` attributes that the system parses into a manifest.

**Why this phase exists:** Format flexibility per section (gallery as grid vs carousel, story as prose vs timeline, etc.) lives in **templates**, not in the core editor. The editor stays format-agnostic; templates carry their own rendering for each section. This phase is the path that ships per-template format variation without bloating the editor.

**Designer journey:**
1. Visit `/admin/template-engine` (admin-only, role-gated)
2. Read + copy the canonical pre-prompt block (full text in [TEMPLATES.md](./TEMPLATES.md) → "Pre-prompt for AI generation")
3. Paste into Claude (or any AI), iterate externally until they have HTML + optional CSS / `animations.ts` / `scripts.ts`
4. Return to admin page, upload bundle or paste a hosted link
5. System parses `data-cwl-*` annotations → builds manifest → validates against the contract
6. Errors surface inline with suggested fixes ("did you mean `weddingParty`?")
7. Live preview renders in the editor's `WeddingPreview` with theme-appropriate dummy data
8. Iterate (edit upload, re-validate)
9. Save as draft at any point — stored in `templates` DB table with `status = 'draft'`
10. Publish: set `priceCents` on template (or per-section overrides), flip `status = 'published'`, template appears in the user-facing template picker

**Storage:**

```sql
templates (
  id uuid pk,
  slug text unique,                     -- URL-safe, e.g. 'midnight-bloom'
  name text,                            -- display name, e.g. 'Midnight Bloom'
  manifest jsonb,                       -- derived manifest (sections, formats, fields, customFields)
  html_source text,                     -- original HTML the designer uploaded
  css_source text nullable,
  js_source text nullable,              -- animations.ts + scripts.ts concatenated
  assets jsonb,                         -- references to uploaded images / fonts / etc.
  price_cents int default 0,            -- template-level price (0 = free)
  status text default 'draft',          -- 'draft' | 'published' | 'archived'
  created_by uuid fk users,
  created_at timestamptz, updated_at timestamptz
)
```

The 17 core themes stay in `src/lib/themes.ts` for now; designer-authored templates land alongside in this table. Picker UI merges both sources. Long-term we can migrate core themes into the table for unified management.

**Validator:**
- HTML parser (`node-html-parser` or similar) extracts `data-cwl-*` annotations
- Schema check (Zod) on the derived manifest
- Field-existence check against `WeddingData` types (auto-derived from `src/lib/types.ts`)
- Format compatibility: known per-section formats pass; unknown formats warn ("first time we've seen this — add to allowed list?") but don't block
- JS sandbox: AST inspection (no `fetch`, `localStorage`, `document`/`window` globals beyond a sandboxed proxy, no third-party CDN imports)
- Animations: `animations.ts` must export `setupAnimations(scrollContainer): () => void` matching the existing `gsap.context()` pattern in `WeddingPreview.tsx`

**Auto-fix suggestions** surface inline with each error:
- "Section `bridesmaids` not recognized. Did you mean `weddingParty`?" — one-click apply
- "Field `bride_name` not in WeddingData. Did you mean `name1`?" — one-click apply
- "Iteration source `couplePhotos` not found. Available array fields: `galleryImages`, `storyTimeline`, `weddingParty`, ..." — pick from list
- "Format `mosaic` not recognized for section `gallery`. Common values: `grid`, `carousel`. Continue with `mosaic` (custom) or pick a common one?"

**Pricing:**
- `priceCents` on the `templates` row is the template-level price. 0 = free.
- Per-section overrides come from the `@cwl-section price-cents=NNNN` annotation in the HTML. The validator extracts these into the manifest's section config.
- At publish time (Phase 5 cart), the platform reads template + section pricing from the manifest, not from `SECTION_METADATA` defaults — designer-authored templates can fully control their pricing.

**Key files (Phase 9 deliverables):**
- `src/app/admin/template-engine/page.tsx` — upload + preview UI
- `src/app/admin/templates/page.tsx` — list/manage existing templates (draft + published)
- `src/lib/templates/parse-html.ts` — HTML annotation → manifest
- `src/lib/templates/validate.ts` — Zod schema + suggestion engine
- `src/lib/templates/sandbox.ts` — JS AST sandbox check
- `src/lib/templates/render.ts` — runtime that swaps fields into HTML for preview + production rendering
- `src/lib/db/schema.ts` — `templates` table

**Implementation note:** the parser/renderer is non-trivial — it has to:
- Parse HTML once, build an AST
- At render time, walk the AST replacing `data-cwl-field` text content + `<img src>` with values from `WeddingData` (falling through to `data.custom` for template-declared fields)
- Handle `data-cwl-iterate` by cloning the subtree N times with item-scoped paths
- Handle `data-cwl-if` (skip subtree if falsy)
- Apply runtime CSS scoping so designer styles don't leak

#### Editor: dynamic field rendering

Templates can declare `customFields` beyond core `WeddingData`. The editor renders inputs for them dynamically — no hand-coded UI per template. The full design + edge cases live in [TEMPLATES.md → Custom fields per template](./TEMPLATES.md#custom-fields-per-template); short version:

**Storage shape.** Add one optional field to `WeddingData`:

```ts
custom?: Record<string, unknown>;
```

Every template-declared custom field stores under `data.custom["<fieldName>"]`. Untyped at storage; typing enforced at editor + render via the template's field descriptors. Couples can switch templates freely; previous values persist (a `cinematicSubtitle` set on Cinematic stays in `data.custom` after switching to Romantic — re-appears if they switch back).

**Field descriptor schema.** Each declared field is a discriminated union over `type`:

```ts
type FieldDescriptor =
  | { type: "string";  label: string; placeholder?: string; helper?: string; maxLength?: number }
  | { type: "text";    label: string; placeholder?: string; helper?: string; rows?: number }
  | { type: "date";    label: string; placeholder?: string; helper?: string }
  | { type: "image";   label: string; helper?: string; orientation?: "landscape" | "portrait" }
  | { type: "enum";    label: string; options: { value: string; label: string }[]; helper?: string }
  | { type: "array";   label: string; helper?: string; itemFields: Record<string, FieldDescriptor>; minItems?: number }
  | { type: "boolean"; label: string; helper?: string };
```

Each descriptor carries a `section: SectionId` binding telling the editor *where* to render the input.

**Editor renderer.** A new generic component:

```tsx
<CustomFieldsRenderer section={sectionId} template={manifest} data={data} update={update} />
```

It filters `template.customFields` by `section` and maps each to a `<DynamicField>` that switches on `descriptor.type` and renders the existing input components (`DebouncedInput`, `DebouncedTextarea`, `DatePicker`, `ImageUpload`, chip group, list editor, `Toggle`). No new input components needed — `<DynamicField>` is just a switch.

**Where in the editor flow.** The editor maps sections → steps:

| Section | Step |
|---|---|
| `hero`, `welcome` | 1 |
| `details` | 2 |
| Everything else | 3 (inside the section's expanded editor) |

`<CustomFieldsRenderer>` invokes after the standard fields in each section's editor surface. When at least one custom field exists for a section, render a small italic muted divider — *"Template extras"* — between standard and custom fields. When none exist, no divider, no overhead.

**Active template lookup.** The editor reads `data.theme` and resolves a manifest from either source:

```ts
async function getTemplate(name: string): Promise<TemplateManifest> {
  const core = themes[name];
  if (core) return adaptThemeToManifest(core);   // synthesizes empty customFields
  return await db.templates.where({ slug: name, status: "published" }).first();
}
```

Core themes (still in `themes.ts`) get a synthesized manifest with empty `customFields`; designer-authored templates load their real manifest from the `templates` DB row.

**Section availability per template.** The manifest carries a `supportedSections: SectionId[]` list — derived from which `data-cwl-section="..."` blocks the designer actually declared in their HTML. The editor consults this list:

- **Step 3 SectionManager → "Add more" filter.** Currently `inactive = ALL_SECTIONS - active - hero`. Add a filter intersection: `inactive = supportedSections - active - hero`. A template that doesn't include `data-cwl-section="travel"` simply doesn't offer "Travel" as an addable option.
- **Active section list intersection.** When rendering the active list, intersect `data.userSections` with `supportedSections`. Sections the active template doesn't support are silently hidden in the preview (data persists in `data.userSections` and the section's own field; switching back to a supporting template reveals them).
- **Core themes (legacy)** synthesize `supportedSections = ALL_SECTIONS` since they all use shared `*Section.tsx` React components. Designer-authored templates have stricter manifest-driven coverage.
- **Hero is always in `supportedSections`** — the validator rejects manifests without a hero block.

**Edge cases:**
- Switching templates with sections the new template doesn't support → those sections vanish from the preview + the SectionManager active list, but `data.userSections` is unchanged. Switching back reveals them. Same pattern for `data.galleryImages`, `data.weddingParty`, etc. — data persists.
- Switching templates with custom data left over → values persist in `data.custom`, just not rendered until a template references them again.
- Removing a custom field from a republished template → orphan values stay in `data.custom` but aren't editable or rendered. Safe.
- Two templates declaring the same custom field name → they share the value (storage is keyed by name). Designers should namespace ambitious fields (`cinematic.subtitle`) if isolation matters.
- Required custom fields → `required: true` on the descriptor. Editor shows `*`; publish gate (Phase 4) blocks if empty.

This is meaningful work. Estimated 2–3 weeks for a v1 of the parser + renderer + admin upload UI + validator + dynamic-field editor. Worth it: once shipped, every new template costs the platform team zero engineering hours.

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
