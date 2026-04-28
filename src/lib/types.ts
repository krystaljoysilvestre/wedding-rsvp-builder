export type ThemeName =
  | "romantic"
  | "elegant"
  | "minimal"
  | "cinematic"
  | "garden"
  | "modern"
  | "artdeco"
  | "boho"
  | "coastal"
  | "vintage"
  | "daisy"
  | "rustic"
  | "watercolor"
  | "tropical"
  | "whimsical"
  | "regal"
  | "industrial";

export interface TimelineItem {
  label: string;
  time: string;
}

export interface WeddingColors {
  primary: string;
  accent: string;
}

export interface WeddingData {
  name1?: string;
  name2?: string;
  theme?: ThemeName;
  tagline?: string;
  date?: string;
  ceremonyType?: string;
  ceremonyVenue?: string;
  ceremonyAddress?: string;
  receptionVenue?: string;
  receptionAddress?: string;
  story?: string;
  welcomeMessage?: string;
  rsvpEnabled?: boolean;
  timeline?: TimelineItem[];
  dressCode?: string;
  colors?: WeddingColors;
  countdownEnabled?: boolean;
  noteToGuests?: string;
  heroImage?: string;
  closingImage?: string;
  logoImage?: string;
}

export function displayNames(name1?: string, name2?: string): string {
  if (name1 && name2) return `${name1} & ${name2}`;
  return name1 || name2 || "";
}

