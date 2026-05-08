/**
 * Canonical source of truth for premium pricing across the app.
 *
 * All prices are stored as **PHP centavos** (multiply by 100) so the type
 * stays a plain integer and we never deal with floating-point money. The
 * full pricing rationale lives in ARCHITECTURE.md → "Pricing model."
 *
 * Usage:
 *   import { PHP_PRICES, formatPHP } from "@/lib/pricing";
 *   const travelPrice = PHP_PRICES.section.travel;     // 19900 (= PHP 199)
 *   const display = formatPHP(travelPrice);             // "PHP 199"
 *
 * When adding/changing a price, change it here only. `themes.ts`,
 * `SECTION_METADATA`, the cart aggregator (Phase 5), and the docs all
 * reference this file.
 */

export const PHP_PRICES = {
  // Premium sections — gated at publish via the cart.
  section: {
    map: 9900,
    saveTheDate: 9900,
    travel: 19900,
    weddingParty: 19900,
  },
  // Premium theme tiers — `ThemeConfig.priceCents` is set by tier, not
  // per-theme. v1 launches with all 17 themes free; these tiers exist
  // so future paid themes can pick a price point without re-pricing.
  theme: {
    standard: 49900,
    signature: 99900,
    designer: 149900,
  },
  // Domain upgrades — paid add-ons at publish.
  subdomain: 29900,
  customDomain: 49900,
} as const;

/**
 * Format PHP centavos as a display string ("PHP 199", "PHP 1,499").
 * Returns "Free" for 0 / undefined.
 */
export function formatPHP(cents: number | undefined): string {
  if (!cents || cents <= 0) return "Free";
  const peso = cents / 100;
  return `PHP ${peso.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}
