import type { ThemeName } from "./types";

export type OrnamentStyle = "floral" | "geometric" | "none" | "lines";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  // Colors
  bg: string;
  bgAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  border: string;
  // Typography
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  headingStyle: "normal" | "italic";
  bodyWeight: number;
  labelSpacing: string;
  // Visual
  heroOverlay: string;
  heroImage: string;
  closingImage: string;
  // Aesthetic
  ornament: OrnamentStyle;
  borderRadius: number;
  dividerWidth: number;
  sectionPadding: string;
  sectionPaddingMobile: string;
  // Pricing (visual gating only for now — no auth/payments wired yet)
  isPremium?: boolean;
}

const themes: Record<ThemeName, ThemeConfig> = {
  romantic: {
    name: "romantic",
    label: "Romantic",
    bg: "#FDF8F4",
    bgAlt: "#FAF0E8",
    text: "#3D2B1F",
    textMuted: "#8B7355",
    accent: "#C4917B",
    accentMuted: "#D4A995",
    border: "#E8D5C4",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 300,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.4em",
    heroOverlay: "rgba(61, 43, 31, 0.30)",
    heroImage:
      "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 48,
    sectionPadding: "160px 48px",
    sectionPaddingMobile: "96px 28px",
  },
  elegant: {
    name: "elegant",
    label: "Elegant",
    bg: "#FFFFFF",
    bgAlt: "#F5F5F5",
    text: "#0A0A0A",
    textMuted: "#6B6B6B",
    accent: "#0A0A0A",
    accentMuted: "#404040",
    border: "#E0E0E0",
    headingFont: "var(--font-playfair), 'Georgia', serif",
    bodyFont: "var(--font-dm-sans), 'Helvetica Neue', sans-serif",
    headingWeight: 400,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.5em",
    heroOverlay: "rgba(0, 0, 0, 0.45)",
    heroImage:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=60",
    ornament: "geometric",
    borderRadius: 0,
    dividerWidth: 40,
    sectionPadding: "160px 48px",
    sectionPaddingMobile: "96px 28px",
  },
  minimal: {
    name: "minimal",
    label: "Minimal",
    bg: "#FAFAFA",
    bgAlt: "#F0F0F0",
    text: "#1A1A1A",
    textMuted: "#888888",
    accent: "#555555",
    accentMuted: "#999999",
    border: "#E5E5E5",
    headingFont: "var(--font-inter), 'Helvetica Neue', sans-serif",
    bodyFont: "var(--font-inter), 'Helvetica Neue', sans-serif",
    headingWeight: 300,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.3em",
    heroOverlay: "rgba(26, 26, 26, 0.30)",
    heroImage:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=60",
    ornament: "none",
    borderRadius: 8,
    dividerWidth: 32,
    sectionPadding: "120px 48px",
    sectionPaddingMobile: "80px 24px",
  },
  cinematic: {
    name: "cinematic",
    label: "Cinematic",
    bg: "#0C0C0C",
    bgAlt: "#151515",
    text: "#F2E8D5",
    textMuted: "#A08E6E",
    accent: "#C9A96E",
    accentMuted: "#B89A5F",
    border: "#2A2520",
    headingFont: "var(--font-cinzel), 'Georgia', serif",
    bodyFont: "var(--font-dm-sans), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.6em",
    heroOverlay: "rgba(0, 0, 0, 0.55)",
    heroImage:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=60",
    ornament: "lines",
    borderRadius: 0,
    dividerWidth: 56,
    sectionPadding: "180px 56px",
    sectionPaddingMobile: "100px 28px",
    isPremium: true,
  },
  garden: {
    name: "garden",
    label: "Garden",
    bg: "#F5F8ED",
    bgAlt: "#E6EFD4",
    text: "#2D4A2B",
    textMuted: "#5E7B58",
    accent: "#7A9A6B",
    accentMuted: "#A5B896",
    border: "#D1DFBC",
    headingFont: "var(--font-lora), 'Georgia', serif",
    bodyFont: "var(--font-inter), 'Helvetica Neue', sans-serif",
    headingWeight: 500,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.35em",
    heroOverlay: "rgba(45, 74, 43, 0.25)",
    heroImage:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 44,
    sectionPadding: "150px 48px",
    sectionPaddingMobile: "92px 24px",
  },
  modern: {
    name: "modern",
    label: "Modern",
    bg: "#F8F6F2",
    bgAlt: "#EDE9E0",
    text: "#1A1A1A",
    textMuted: "#5C5C5C",
    accent: "#1A1A1A",
    accentMuted: "#6B6B6B",
    border: "#DDD5CA",
    headingFont: "var(--font-playfair), 'Georgia', serif",
    bodyFont: "var(--font-dm-sans), 'Helvetica Neue', sans-serif",
    headingWeight: 700,
    headingStyle: "normal",
    bodyWeight: 500,
    labelSpacing: "0.25em",
    heroOverlay: "rgba(0, 0, 0, 0.4)",
    heroImage:
      "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=60",
    ornament: "lines",
    borderRadius: 4,
    dividerWidth: 64,
    sectionPadding: "140px 56px",
    sectionPaddingMobile: "88px 24px",
  },
  artdeco: {
    name: "artdeco",
    label: "Art Deco",
    bg: "#0D0D0D",
    bgAlt: "#1A1A1A",
    text: "#F5E6C8",
    textMuted: "#A08E6E",
    accent: "#D4A73A",
    accentMuted: "#B88D2F",
    border: "#3D3220",
    headingFont: "var(--font-cinzel), 'Georgia', serif",
    bodyFont: "var(--font-dm-sans), 'Helvetica Neue', sans-serif",
    headingWeight: 600,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.7em",
    heroOverlay: "rgba(0, 0, 0, 0.6)",
    heroImage:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=60",
    ornament: "geometric",
    borderRadius: 0,
    dividerWidth: 72,
    sectionPadding: "180px 56px",
    sectionPaddingMobile: "100px 28px",
    isPremium: true,
  },
  boho: {
    name: "boho",
    label: "Boho Desert",
    bg: "#F2E6D0",
    bgAlt: "#E5D5B8",
    text: "#5C3A1F",
    textMuted: "#8B6A4E",
    accent: "#C46947",
    accentMuted: "#DAAA8C",
    border: "#D9C4A0",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.4em",
    heroOverlay: "rgba(92, 58, 31, 0.3)",
    heroImage:
      "https://images.unsplash.com/photo-1517722014278-c256a91a6fba?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 52,
    sectionPadding: "150px 48px",
    sectionPaddingMobile: "94px 26px",
    isPremium: true,
  },
  coastal: {
    name: "coastal",
    label: "Coastal",
    bg: "#F0F6F9",
    bgAlt: "#D9E6EC",
    text: "#1F3D52",
    textMuted: "#5F7A8A",
    accent: "#B68B6A",
    accentMuted: "#D9C2A8",
    border: "#DDD0BE",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-inter), 'Helvetica Neue', sans-serif",
    headingWeight: 300,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.35em",
    heroOverlay: "rgba(120, 75, 45, 0.32)",
    heroImage:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=60",
    ornament: "lines",
    borderRadius: 0,
    dividerWidth: 40,
    sectionPadding: "126px 44px",
    sectionPaddingMobile: "80px 22px",
    isPremium: true,
  },
  vintage: {
    name: "vintage",
    label: "Vintage",
    bg: "#F5EDE0",
    bgAlt: "#E8DCC8",
    text: "#3D2818",
    textMuted: "#7A5B3D",
    accent: "#A32B3A",
    accentMuted: "#B84B58",
    border: "#DDC9A8",
    headingFont: "var(--font-playfair), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.5em",
    heroOverlay: "rgba(61, 40, 24, 0.35)",
    heroImage:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 48,
    sectionPadding: "160px 48px",
    sectionPaddingMobile: "96px 28px",
    isPremium: true,
  },
  daisy: {
    name: "daisy",
    label: "Daisy",
    bg: "#FFFFFF",
    bgAlt: "#F3F6FB",
    text: "#1B3A6B",
    textMuted: "#5A7AA8",
    accent: "#2E56A3",
    accentMuted: "#7B9AD6",
    border: "#D4DEF0",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 500,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.5em",
    heroOverlay: "rgba(27, 58, 107, 0.18)",
    heroImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 40,
    sectionPadding: "150px 48px",
    sectionPaddingMobile: "94px 26px",
  },
  rustic: {
    name: "rustic",
    label: "Rustic",
    bg: "#F5EBE0",
    bgAlt: "#E8D5B7",
    text: "#4A3626",
    textMuted: "#8B6F4E",
    accent: "#8B5A2B",
    accentMuted: "#B8875F",
    border: "#D4B896",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.4em",
    heroOverlay: "rgba(74, 54, 38, 0.32)",
    heroImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 52,
    sectionPadding: "150px 48px",
    sectionPaddingMobile: "96px 26px",
  },
  watercolor: {
    name: "watercolor",
    label: "Watercolor",
    bg: "#FBF8F3",
    bgAlt: "#F3EFE8",
    text: "#52495C",
    textMuted: "#8A8396",
    accent: "#C9A7C5",
    accentMuted: "#E1CEE0",
    border: "#E5D9E0",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.4em",
    heroOverlay: "rgba(82, 73, 92, 0.25)",
    heroImage:
      "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 44,
    sectionPadding: "150px 48px",
    sectionPaddingMobile: "92px 24px",
  },
  tropical: {
    name: "tropical",
    label: "Tropical",
    bg: "#EDF5EE",
    bgAlt: "#D9E8DC",
    text: "#1F3A2C",
    textMuted: "#5C7A6B",
    accent: "#2F6B4A",
    accentMuted: "#6FA68A",
    border: "#C9DFC4",
    headingFont: "var(--font-playfair), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.4em",
    heroOverlay: "rgba(31, 58, 44, 0.28)",
    heroImage:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1517722014278-c256a91a6fba?w=1200&q=60",
    ornament: "floral",
    borderRadius: 0,
    dividerWidth: 48,
    sectionPadding: "160px 48px",
    sectionPaddingMobile: "96px 26px",
    isPremium: true,
  },
  whimsical: {
    name: "whimsical",
    label: "Whimsical",
    bg: "#FEF6F4",
    bgAlt: "#F9E7E4",
    text: "#6B3E5C",
    textMuted: "#9B748A",
    accent: "#E3A1B8",
    accentMuted: "#F0C5CF",
    border: "#EEDBE2",
    headingFont: "var(--font-cormorant), 'Georgia', serif",
    bodyFont: "var(--font-lora), 'Georgia', serif",
    headingWeight: 400,
    headingStyle: "italic",
    bodyWeight: 400,
    labelSpacing: "0.35em",
    heroOverlay: "rgba(107, 62, 92, 0.22)",
    heroImage:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=60",
    ornament: "floral",
    borderRadius: 12,
    dividerWidth: 40,
    sectionPadding: "140px 48px",
    sectionPaddingMobile: "88px 24px",
    isPremium: true,
  },
  regal: {
    name: "regal",
    label: "Regal",
    bg: "#F8F2E6",
    bgAlt: "#EDE2CA",
    text: "#2D1B3A",
    textMuted: "#5C4369",
    accent: "#7A3E5F",
    accentMuted: "#9E6A85",
    border: "#D8C89E",
    headingFont: "var(--font-playfair), 'Georgia', serif",
    bodyFont: "var(--font-cormorant), 'Georgia', serif",
    headingWeight: 500,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.55em",
    heroOverlay: "rgba(45, 27, 58, 0.38)",
    heroImage:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=60",
    ornament: "geometric",
    borderRadius: 0,
    dividerWidth: 60,
    sectionPadding: "170px 56px",
    sectionPaddingMobile: "100px 28px",
    isPremium: true,
  },
  industrial: {
    name: "industrial",
    label: "Industrial",
    bg: "#EDECEA",
    bgAlt: "#D8D6D2",
    text: "#2B2B2B",
    textMuted: "#6B6B6B",
    accent: "#4A4A4A",
    accentMuted: "#8A8A8A",
    border: "#C4C2BD",
    headingFont: "var(--font-inter), 'Helvetica Neue', sans-serif",
    bodyFont: "var(--font-dm-sans), 'Helvetica Neue', sans-serif",
    headingWeight: 600,
    headingStyle: "normal",
    bodyWeight: 400,
    labelSpacing: "0.3em",
    heroOverlay: "rgba(43, 43, 43, 0.38)",
    heroImage:
      "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=60",
    ornament: "lines",
    borderRadius: 2,
    dividerWidth: 72,
    sectionPadding: "140px 56px",
    sectionPaddingMobile: "88px 24px",
    isPremium: true,
  },
};

export function getTheme(name?: ThemeName): ThemeConfig {
  return themes[name ?? "elegant"];
}

// Palette seeded into data.colors when a user picks a theme via the landing-page
// card or the in-editor TemplateSwitcher. Only applied if the user hasn't already
// customized colors.
export const THEME_PALETTES: Record<ThemeName, { primary: string; accent: string }> = {
  romantic: { primary: "#C4917B", accent: "#D4A995" },
  elegant: { primary: "#0A0A0A", accent: "#404040" },
  minimal: { primary: "#555555", accent: "#999999" },
  cinematic: { primary: "#C9A96E", accent: "#B89A5F" },
  garden: { primary: "#7A9A6B", accent: "#A5B896" },
  modern: { primary: "#1A1A1A", accent: "#6B6B6B" },
  artdeco: { primary: "#D4A73A", accent: "#B88D2F" },
  boho: { primary: "#C46947", accent: "#DAAA8C" },
  coastal: { primary: "#B68B6A", accent: "#D9C2A8" },
  vintage: { primary: "#A32B3A", accent: "#B84B58" },
  daisy: { primary: "#2E56A3", accent: "#7B9AD6" },
  rustic: { primary: "#8B5A2B", accent: "#B8875F" },
  watercolor: { primary: "#C9A7C5", accent: "#E1CEE0" },
  tropical: { primary: "#2F6B4A", accent: "#6FA68A" },
  whimsical: { primary: "#E3A1B8", accent: "#F0C5CF" },
  regal: { primary: "#7A3E5F", accent: "#9E6A85" },
  industrial: { primary: "#4A4A4A", accent: "#8A8A8A" },
};

export const THEME_NAMES: ThemeName[] = [
  "romantic",
  "elegant",
  "minimal",
  "cinematic",
  "garden",
  "modern",
  "artdeco",
  "boho",
  "coastal",
  "vintage",
  "daisy",
  "rustic",
  "watercolor",
  "tropical",
  "whimsical",
  "regal",
  "industrial",
];

// Group templates by pricing tier for landing page + gating UI
export function isPremiumTheme(name: ThemeName): boolean {
  return themes[name].isPremium === true;
}

export const FREE_THEMES: ThemeName[] = THEME_NAMES.filter(
  (n) => !themes[n].isPremium
);

export const PREMIUM_THEMES: ThemeName[] = THEME_NAMES.filter(
  (n) => themes[n].isPremium
);
