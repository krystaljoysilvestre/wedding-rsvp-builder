export type ThemeName = "romantic" | "elegant" | "minimal" | "cinematic";

export interface TimelineItem {
  label: string;
  time: string;
}

export interface WeddingColors {
  primary: string;
  accent: string;
}

export interface WeddingData {
  names?: string;
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
  backgroundStyle?: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  quickReplies?: string[];
}

export type ConversationStep =
  // Phase 1: Identity & vibe
  | "names"
  | "theme"
  | "color_motif"
  | "color_confirm"
  | "tagline"
  | "tagline_confirm"
  // Phase 2: Event details
  | "date"
  | "ceremony_type"
  | "ceremony_venue"
  | "ceremony_address"
  | "reception"
  | "reception_venue"
  | "reception_name"
  | "reception_address"
  // Phase 3: Story & content
  | "story"
  | "story_input"
  | "story_refine"
  | "welcome"
  // Phase 4: Event experience
  | "rsvp"
  | "timeline"
  | "timeline_items"
  | "dress_code"
  // Phase 5: Enhancements
  | "countdown"
  | "note_to_guests"
  | "background"
  // Terminal
  | "done";
