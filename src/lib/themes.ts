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
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
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
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
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
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
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
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    closingImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
    ornament: "lines",
    borderRadius: 0,
    dividerWidth: 56,
    sectionPadding: "180px 56px",
    sectionPaddingMobile: "100px 28px",
  },
};

export function getTheme(name?: ThemeName): ThemeConfig {
  return themes[name ?? "elegant"];
}
