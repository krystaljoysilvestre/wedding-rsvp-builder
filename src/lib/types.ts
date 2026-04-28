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

export interface RegistryLink {
  label: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PartyMember {
  name: string;
  role: string;
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
  ceremonyTime?: string;
  receptionVenue?: string;
  receptionAddress?: string;
  receptionTime?: string;
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

  // Optional sections
  galleryImages?: string[];
  travelInfo?: string;
  registryLinks?: RegistryLink[];
  faqItems?: FaqItem[];
  weddingParty?: PartyMember[];
  mapAddress?: string;
  hashtag?: string;
  musicEmbed?: string;
  saveTheDateMessage?: string;

  // User-customized section list — when set, overrides the theme's default
  // `sections` array. Order matters; Hero is always force-pinned to slot 0
  // by the renderer regardless of the array.
  userSections?: import("./themes").SectionId[] | null;
}

export function displayNames(name1?: string, name2?: string): string {
  if (name1 && name2) return `${name1} & ${name2}`;
  return name1 || name2 || "";
}

