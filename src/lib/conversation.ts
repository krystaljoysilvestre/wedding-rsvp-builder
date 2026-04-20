import type { ConversationStep, ChatMessage } from "./types";

let nextId = 0;
function uid(): string {
  return `msg-${++nextId}-${Date.now()}`;
}

export function createMessage(
  role: "user" | "assistant",
  content: string,
  quickReplies?: string[]
): ChatMessage {
  return { id: uid(), role, content, quickReplies };
}

// ─── Step definitions ────────────────────────────────────────────────

export interface StepDef {
  message: string;
  quickReplies?: string[];
  skippable?: boolean;
  /** When true, the text input is hidden — user must pick a quick reply */
  selectionOnly?: boolean;
  /** Which field(s) this step writes to — used by ChatPanel */
  field?: string;
}

const STEPS: Record<ConversationStep, StepDef> = {
  // Phase 1: Identity & vibe
  name1: {
    message:
      "How exciting — a love story in the making! Let's start with the first star of the show. What's your name, beautiful soul?",
    field: "name1",
  },
  name2: {
    message:
      "And who's the lucky one who stole your heart? What's their name?",
    field: "name2",
  },
  theme: {
    message:
      "Every love story has its own mood. How would you describe the feeling of your celebration?",
    quickReplies: ["Romantic", "Elegant", "Minimal", "Cinematic"],
    field: "theme",
  },
  tagline: {
    message:
      "Every great love deserves a great line. Would you like me to write a tagline that captures your story?",
    quickReplies: ["Generate one for me", "I'll write my own", "Skip"],
    selectionOnly: true,
    skippable: true,
    field: "tagline",
  },
  tagline_confirm: {
    message: "How does this feel? Does it capture your love?",
    quickReplies: ["Love it", "Try another", "I'll write my own"],
    selectionOnly: true,
    field: "_tagline_confirm",
  },

  // Phase 2: Event details
  date: {
    message: "Now for the date that will change everything — when is your special day?",
    field: "date",
  },
  ceremony_type: {
    message: "Where will you say your vows? Every setting tells a story.",
    quickReplies: ["Church", "Garden", "Beach", "Venue / Hall", "Other"],
    field: "ceremonyType",
  },
  ceremony_venue: {
    message: "What's the name of the venue?",
    field: "ceremonyVenue",
  },
  ceremony_address: {
    message: "And where can your loved ones find this beautiful place?",
    field: "ceremonyAddress",
  },
  reception: {
    message: "After the vows, will there be a celebration to dance the night away?",
    quickReplies: ["Yes", "No"],
    selectionOnly: true,
    field: "_reception_decision",
  },
  reception_venue: {
    message: "Will the celebration continue in the same place, or somewhere new?",
    quickReplies: ["Same venue", "A different location"],
    selectionOnly: true,
    field: "_reception_venue_decision",
  },
  reception_name: {
    message: "How lovely! What's the name of the reception venue?",
    field: "receptionVenue",
  },
  reception_address: {
    message: "And the address so your guests can find their way to the party?",
    field: "receptionAddress",
  },

  // Phase 3: Story & content
  story: {
    message:
      "Every couple has a story that gives everyone butterflies. Would you like to share yours on the website?",
    quickReplies: ["Yes", "Skip"],
    selectionOnly: true,
    skippable: true,
    field: "_story_decision",
  },
  story_input: {
    message:
      "We'd love to hear it! Share how your paths crossed, how love found you — I'll place it on your page just as you tell it.",
    field: "story",
  },
  story_refine: {
    message: "Here's your beautiful story. Does it feel right, or shall we make it even more magical?",
    quickReplies: ["Looks good", "Refine with AI", "I'll rewrite it"],
    selectionOnly: true,
    field: "_story_refine",
  },
  welcome: {
    message:
      "Your guests will be so touched by a warm welcome. Would you like a heartfelt message to greet them?",
    quickReplies: ["Generate one for me", "I'll write it", "Skip"],
    selectionOnly: true,
    skippable: true,
    field: "_welcome_decision",
  },

  // Phase 4: Event experience
  rsvp: {
    message: "Shall we let your loved ones RSVP right from the page? It makes everything so seamless.",
    quickReplies: ["Yes", "No"],
    selectionOnly: true,
    field: "rsvpEnabled",
  },
  timeline: {
    message: "Would you like to share a timeline so everyone knows when the magic unfolds?",
    quickReplies: ["Yes", "Skip"],
    selectionOnly: true,
    skippable: true,
    field: "_timeline_decision",
  },
  timeline_items: {
    message:
      "Walk us through the day! For example:\n\"Ceremony at 4:00 PM, Cocktails at 5:30 PM, First Dance at 7:00 PM\"",
    field: "timeline",
  },
  dress_code: {
    message: "Is there a dress code for the celebration? Let your guests know how to show up in style.",
    quickReplies: ["Black tie", "Semi-formal", "Cocktail", "Casual", "Skip"],
    skippable: true,
    field: "dressCode",
  },
  // Phase 5: Enhancements
  countdown: {
    message: "Should we add a countdown timer? There's something so exciting about watching the days tick closer to forever.",
    quickReplies: ["Yes", "No"],
    selectionOnly: true,
    field: "countdownEnabled",
  },
  note_to_guests: {
    message: "Any last words from the heart? A little note to your guests can mean the world.",
    quickReplies: ["Generate one", "I'll write my own", "Skip"],
    selectionOnly: true,
    skippable: true,
    field: "noteToGuests",
  },
  background: {
    message: "One last touch — what kind of visual style feels most like you two?",
    quickReplies: ["Floral", "Minimal", "Photo-based", "Cinematic"],
    selectionOnly: true,
    field: "backgroundStyle",
  },

  // Terminal
  done: {
    message:
      "Your wedding website is ready, and it's absolutely stunning! Scroll through the preview to see your love story come to life. Feel free to keep chatting if you'd like to change anything.",
    quickReplies: ["Upload our photos", "Change the theme", "Update the story"],
  },
};

// ─── Flow order ──────────────────────────────────────────────────────

const FLOW: ConversationStep[] = [
  "name1",
  "name2",
  "theme",
  "tagline",
  "tagline_confirm",
  "date",
  "ceremony_type",
  "ceremony_venue",
  "ceremony_address",
  "reception",
  "reception_venue",
  "reception_name",
  "reception_address",
  "story",
  "story_input",
  "story_refine",
  "welcome",
  "rsvp",
  "timeline",
  "timeline_items",
  "dress_code",
  "countdown",
  "note_to_guests",
  "background",
  "done",
];

// ─── Public API ──────────────────────────────────────────────────────

export function getStepDef(step: ConversationStep): StepDef {
  return STEPS[step];
}

export function getFlowOrder(): ConversationStep[] {
  return [...FLOW];
}

export function getNextFlowStep(current: ConversationStep): ConversationStep {
  const idx = FLOW.indexOf(current);
  return idx < FLOW.length - 1 ? FLOW[idx + 1] : "done";
}

export function getInitialMessages(): ChatMessage[] {
  const step = STEPS.name1;
  return [createMessage("assistant", step.message, step.quickReplies)];
}

// ─── Phase labels for progress hints ─────────────────────────────────

const PHASE_BOUNDARIES: Record<string, string> = {
  date: "How wonderful! Now let's plan the details of your beautiful day.",
  story: "This is coming together so beautifully! Let's add some personal touches that will make your guests smile.",
  rsvp: "Almost there, lovebirds! Let's set up the experience for your guests.",
  countdown: "Just a few more little touches to make it perfect...",
};

export function getPhaseIntro(step: ConversationStep): string | null {
  return PHASE_BOUNDARIES[step] ?? null;
}
