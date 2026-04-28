import type { ThemeName, WeddingData } from "./types";

// Per-template fictional couples. Used in the builder preview so every section
// renders with believable content from the first frame; sections still showing
// dummy content are tagged with a small "Suggested" badge until the user fills
// in their own values. Also used by the `/preview-demo/[theme]` route (gallery
// + modal preview), where badges and toggle-driven hides are disabled.

export const DUMMY_DATA: Record<ThemeName, WeddingData> = {
  romantic: {
    name1: "Maya",
    name2: "Caleb",
    date: "June 15, 2026",
    tagline: "A love written in soft light and rose petals",
    ceremonyType: "Garden",
    ceremonyVenue: "Meadowood Estate",
    ceremonyAddress: "Napa Valley, California",
    receptionVenue: "The Willow Pavilion",
    receptionAddress: "Napa Valley, California",
    story:
      "They met on a slow afternoon in a quiet bookstore, reaching for the same collection of Neruda. Two summers of letters and long walks later, he asked her to stay forever.",
    welcomeMessage:
      "Thank you for being part of our story. Your presence is the only gift we need.",
    timeline: [
      { label: "Ceremony", time: "4:00 PM" },
      { label: "Cocktail Hour", time: "5:00 PM" },
      { label: "Dinner & Dancing", time: "6:30 PM" },
    ],
    dressCode: "Garden Cocktail",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Come ready to dance under the stars.",
  },

  elegant: {
    name1: "Isla",
    name2: "Theo",
    date: "October 3, 2026",
    tagline: "Two lives, one extraordinary night",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Plaza",
    ceremonyAddress: "Fifth Avenue, New York City",
    receptionVenue: "Grand Ballroom, The Plaza",
    receptionAddress: "Fifth Avenue, New York City",
    story:
      "An introduction at a mutual friend's gallery opening turned into dinner, turned into a decade. Some loves take time to find each other — theirs arrived perfectly on time.",
    welcomeMessage:
      "We are deeply honored to have you beside us as we begin this new chapter.",
    timeline: [
      { label: "Ceremony", time: "6:00 PM" },
      { label: "Champagne Reception", time: "7:00 PM" },
      { label: "Dinner & Toasts", time: "8:00 PM" },
    ],
    dressCode: "Black Tie",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Your presence is the greatest gift of all.",
  },

  minimal: {
    name1: "Aria",
    name2: "Jin",
    date: "April 18, 2026",
    tagline: "Simply, us",
    ceremonyType: "Other",
    ceremonyVenue: "Honen-in Temple",
    ceremonyAddress: "Kyoto, Japan",
    receptionVenue: "Arashiyama Garden",
    receptionAddress: "Kyoto, Japan",
    story:
      "They fell in love quietly, over mornings and small things. No grand gesture — just the certainty that life was better together.",
    welcomeMessage: "Thank you for traveling with us to this quiet corner of joy.",
    timeline: [
      { label: "Ceremony", time: "11:00 AM" },
      { label: "Tea & Photos", time: "12:00 PM" },
      { label: "Dinner", time: "6:00 PM" },
    ],
    dressCode: "Cocktail",
    rsvpEnabled: true,
    countdownEnabled: false,
    noteToGuests: "Bring your stillness and your smile.",
  },

  cinematic: {
    name1: "Everly",
    name2: "Zane",
    date: "November 21, 2026",
    tagline: "The opening credits of forever",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Athenaeum",
    ceremonyAddress: "Pasadena, California",
    receptionVenue: "The Athenaeum Grand Hall",
    receptionAddress: "Pasadena, California",
    story:
      "She was writing her first screenplay. He was scoring someone else's. A shared table in a late-night diner turned into a lifetime collaboration.",
    welcomeMessage:
      "Tonight, the story we've been writing together meets its most beautiful scene.",
    timeline: [
      { label: "Ceremony", time: "5:30 PM" },
      { label: "Cocktail Hour", time: "6:30 PM" },
      { label: "Dinner & Dancing", time: "8:00 PM" },
    ],
    dressCode: "Black Tie",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Lights, camera — love you.",
  },

  garden: {
    name1: "Ivy",
    name2: "Rowan",
    date: "May 30, 2026",
    tagline: "Rooted, and reaching toward the sun",
    ceremonyType: "Garden",
    ceremonyVenue: "Brooklyn Botanic Garden",
    ceremonyAddress: "Brooklyn, New York",
    receptionVenue: "Palm House Pavilion",
    receptionAddress: "Brooklyn Botanic Garden",
    story:
      "Two botanists who first argued about native species at a conference and never stopped talking since. Their favorite walk is still the one that started it all.",
    welcomeMessage:
      "Thank you for growing with us. We can't wait to celebrate in the garden.",
    timeline: [
      { label: "Ceremony", time: "3:30 PM" },
      { label: "Garden Cocktails", time: "4:30 PM" },
      { label: "Dinner & Dancing", time: "6:00 PM" },
    ],
    dressCode: "Garden Casual",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Wear shoes you can dance through the grass in.",
  },

  modern: {
    name1: "Emre",
    name2: "Noa",
    date: "September 12, 2026",
    tagline: "By design. In every way.",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Shed",
    ceremonyAddress: "Hudson Yards, New York City",
    receptionVenue: "The Shed Rooftop",
    receptionAddress: "Hudson Yards, New York City",
    story:
      "Two architects who kept sketching over each other's napkins. They decided to build one life instead of two portfolios.",
    welcomeMessage:
      "We're so glad you're here. Thank you for being part of this blueprint for forever.",
    timeline: [
      { label: "Ceremony", time: "5:00 PM" },
      { label: "Rooftop Cocktails", time: "6:00 PM" },
      { label: "Dinner & DJ", time: "7:30 PM" },
    ],
    dressCode: "Cocktail",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Come curious. Stay late.",
  },

  artdeco: {
    name1: "Odette",
    name2: "Dash",
    date: "December 5, 2026",
    tagline: "A gilded age for two",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Rainbow Room",
    ceremonyAddress: "Rockefeller Plaza, New York City",
    receptionVenue: "The Rainbow Room Ballroom",
    receptionAddress: "Rockefeller Plaza, New York City",
    story:
      "She collected old jazz records. He inherited his grandfather's speakeasy key. Their first date lasted until the band packed up and the lights came on.",
    welcomeMessage:
      "To our favorite people: welcome to the party we've been dreaming of.",
    timeline: [
      { label: "Ceremony", time: "7:00 PM" },
      { label: "Champagne & Jazz", time: "8:00 PM" },
      { label: "Dinner & Dancing", time: "9:30 PM" },
    ],
    dressCode: "Black Tie — 1920s Optional",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Bring your sharpest shoes and your smoothest moves.",
  },

  boho: {
    name1: "Sage",
    name2: "Finn",
    date: "March 21, 2026",
    tagline: "Two wandering souls, one steady fire",
    ceremonyType: "Other",
    ceremonyVenue: "Desert Ranch at Joshua Tree",
    ceremonyAddress: "Joshua Tree, California",
    receptionVenue: "Under the Stars",
    receptionAddress: "Joshua Tree, California",
    story:
      "They met at a desert music festival, bonded over the last bottle of water, and have been chasing sunsets ever since.",
    welcomeMessage:
      "Come wander with us. This desert has seen a lot of love — let's add ours.",
    timeline: [
      { label: "Ceremony at Sunset", time: "5:45 PM" },
      { label: "Campfire Cocktails", time: "7:00 PM" },
      { label: "Dinner & Dancing", time: "8:00 PM" },
    ],
    dressCode: "Desert Bohemian",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Bring a warm layer. The desert gets cold, the love does not.",
  },

  coastal: {
    name1: "Marisol",
    name2: "Tate",
    date: "July 4, 2026",
    tagline: "The sea brought us here",
    ceremonyType: "Beach",
    ceremonyVenue: "Positano Clifftop",
    ceremonyAddress: "Amalfi Coast, Italy",
    receptionVenue: "La Sirenuse Terrace",
    receptionAddress: "Amalfi Coast, Italy",
    story:
      "A missed ferry in Positano. A shared limoncello. Two people who didn't plan to stay turned their layover into forever.",
    welcomeMessage:
      "Benvenuti. Thank you for crossing the sea for us — we'll make it worth the trip.",
    timeline: [
      { label: "Ceremony", time: "6:30 PM" },
      { label: "Seaside Cocktails", time: "7:30 PM" },
      { label: "Dinner & Dancing", time: "9:00 PM" },
    ],
    dressCode: "Coastal Cocktail",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Come for the sea. Stay for the pasta.",
  },

  vintage: {
    name1: "Rosalind",
    name2: "Leo",
    date: "August 23, 2026",
    tagline: "A love letter, carried forward",
    ceremonyType: "Garden",
    ceremonyVenue: "Ashcombe House",
    ceremonyAddress: "Wiltshire, England",
    receptionVenue: "The Orangery at Ashcombe",
    receptionAddress: "Wiltshire, England",
    story:
      "They found each other in letters, before they ever met. A handwritten correspondence that began with a typo and ended with a proposal.",
    welcomeMessage:
      "What a joy to share this day with you. Thank you for walking into our story.",
    timeline: [
      { label: "Ceremony", time: "3:00 PM" },
      { label: "Garden Tea", time: "4:00 PM" },
      { label: "Dinner & Waltz", time: "6:30 PM" },
    ],
    dressCode: "Vintage Formal",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Wear something you'll be glad to see in the photographs.",
  },

  daisy: {
    name1: "Olivia",
    name2: "Ralph",
    date: "May 18, 2026",
    tagline: "With the blessing of our parents",
    ceremonyType: "Church",
    ceremonyVenue: "Our Lady of Lourdes Parish",
    ceremonyAddress: "Marbel, Philippines",
    receptionVenue: "The Farm @ Carpenter Hill",
    receptionAddress: "Marbel, Philippines",
    story:
      "In a coastal town, a marine biologist and a fisherman crossed paths on a day the sea felt generous. One kind rescue sparked a deeper current — and the quiet ocean has been rooting for them ever since.",
    welcomeMessage:
      "With all that we have, we've been truly blessed. Your presence and prayers are all that we request.",
    timeline: [
      { label: "Ceremony", time: "2:00 PM" },
      { label: "Reception", time: "4:00 PM" },
      { label: "Dinner", time: "5:00 PM" },
      { label: "Photo", time: "6:00 PM" },
    ],
    dressCode: "Formal Attire",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Hope you can make it — and God bless you!",
  },

  rustic: {
    name1: "Hazel",
    name2: "Wyatt",
    date: "October 11, 2026",
    tagline: "Where the fields sing back to love",
    ceremonyType: "Other",
    ceremonyVenue: "Red Door Barn",
    ceremonyAddress: "Hudson Valley, New York",
    receptionVenue: "The Meadow at Red Door",
    receptionAddress: "Hudson Valley, New York",
    story:
      "She was restoring an old farmhouse. He delivered the reclaimed beams. Six months of dusty afternoons turned into a quieter, steadier kind of forever.",
    welcomeMessage:
      "Thank you for making the drive. Pull up a seat — the sunset is the best part.",
    timeline: [
      { label: "Ceremony", time: "4:00 PM" },
      { label: "Barnyard Cocktails", time: "5:00 PM" },
      { label: "Dinner & Dancing", time: "6:30 PM" },
    ],
    dressCode: "Country Formal",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Wear shoes that can dance in hay.",
  },

  watercolor: {
    name1: "Elowen",
    name2: "Soren",
    date: "April 4, 2026",
    tagline: "Painted, softly, into forever",
    ceremonyType: "Garden",
    ceremonyVenue: "The Watercolor Gallery",
    ceremonyAddress: "Charleston, South Carolina",
    receptionVenue: "The Gallery Courtyard",
    receptionAddress: "Charleston, South Carolina",
    story:
      "She painted watercolors. He played cello. They met when her brush dripped onto his sheet music — and neither of them minded one bit.",
    welcomeMessage:
      "Thank you for being here. This whole day is softer because you came.",
    timeline: [
      { label: "Ceremony", time: "3:30 PM" },
      { label: "Cocktails & Strings", time: "4:30 PM" },
      { label: "Dinner & Dancing", time: "6:00 PM" },
    ],
    dressCode: "Pastel Cocktail",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "The afternoon light is the real painter.",
  },

  tropical: {
    name1: "Coco",
    name2: "Keanu",
    date: "July 20, 2026",
    tagline: "Paradise, with witnesses",
    ceremonyType: "Beach",
    ceremonyVenue: "Four Seasons Maui at Wailea",
    ceremonyAddress: "Maui, Hawai'i",
    receptionVenue: "Poolside at Four Seasons Maui",
    receptionAddress: "Maui, Hawai'i",
    story:
      "She came for a vacation. He was the surf instructor. One week in the waves, and she rebooked her flight — she never did get around to leaving.",
    welcomeMessage:
      "Aloha, dear ones. Thank you for crossing the water to celebrate with us.",
    timeline: [
      { label: "Beach Ceremony", time: "5:00 PM" },
      { label: "Sunset Cocktails", time: "6:00 PM" },
      { label: "Dinner & Dancing", time: "7:30 PM" },
    ],
    dressCode: "Tropical Formal",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Bring sunscreen. Leave your worries.",
  },

  whimsical: {
    name1: "Juniper",
    name2: "Bodhi",
    date: "June 6, 2026",
    tagline: "A little magic, a lot of love",
    ceremonyType: "Other",
    ceremonyVenue: "The Silver Carousel",
    ceremonyAddress: "Asheville, North Carolina",
    receptionVenue: "The Big Top Pavilion",
    receptionAddress: "Asheville, North Carolina",
    story:
      "They met at a vintage fair, arguing about which cotton candy color was better. They still argue — now, it's about which song to dance to first.",
    welcomeMessage:
      "Welcome to the most joyful afternoon of our year. We promise games, dancing, and possibly a carousel ride.",
    timeline: [
      { label: "Ceremony", time: "2:00 PM" },
      { label: "Games & Cocktails", time: "3:30 PM" },
      { label: "Dinner & Dancing", time: "5:30 PM" },
    ],
    dressCode: "Playful Pastel",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Wear something you'd want to twirl in.",
  },

  regal: {
    name1: "Seraphina",
    name2: "Julian",
    date: "September 26, 2026",
    tagline: "Two thrones, one kingdom",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "Cliveden House",
    ceremonyAddress: "Buckinghamshire, England",
    receptionVenue: "The Great Hall, Cliveden",
    receptionAddress: "Buckinghamshire, England",
    story:
      "Old college friends who reconnected at a gala a decade later. One dance became two, and two became the only dance she ever wanted.",
    welcomeMessage:
      "We are truly honored by your presence. Tonight, we celebrate the beginning of a long and glittering chapter.",
    timeline: [
      { label: "Ceremony", time: "4:00 PM" },
      { label: "Champagne & Strings", time: "5:00 PM" },
      { label: "Dinner & Waltz", time: "7:00 PM" },
    ],
    dressCode: "White Tie",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Dress to be photographed forever.",
  },

  industrial: {
    name1: "Milo",
    name2: "Zara",
    date: "November 7, 2026",
    tagline: "Concrete, steel, and everything after",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Foundry",
    ceremonyAddress: "Long Island City, New York",
    receptionVenue: "The Foundry Rooftop",
    receptionAddress: "Long Island City, New York",
    story:
      "Two architects who met at a site walk in Brooklyn. They've been drawing plans together — and a life to match — ever since.",
    welcomeMessage:
      "Welcome to our favorite building. Thank you for helping us make it sing tonight.",
    timeline: [
      { label: "Ceremony", time: "5:30 PM" },
      { label: "Rooftop Cocktails", time: "6:30 PM" },
      { label: "Dinner & DJ", time: "8:00 PM" },
    ],
    dressCode: "Modern Formal",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Stay until the city skyline shows off.",
  },
};

/**
 * Shared dummy content for the optional sections — same sample across every
 * theme so we don't need 17 copies. Per-theme palettes still drive how it's
 * rendered.
 */
const SHARED_OPTIONAL_DUMMY: Partial<WeddingData> = {
  ceremonyTime: "4:00 PM",
  receptionTime: "6:00 PM — Late",
  galleryImages: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1517722014278-c256a91a6fba?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
  travelInfo:
    "We've reserved a block of rooms at the Hotel Bellaria, a short walk from the venue. Mention our names at booking for the wedding rate.\n\nThe nearest airport is San Marco International (SMC), about 25 minutes by taxi. Parking is available on-site.",
  registryLinks: [
    { label: "Crate & Barrel", url: "https://www.crateandbarrel.com" },
    { label: "Honeymoon Fund", url: "https://example.com/honeymoon" },
    { label: "Amazon", url: "https://www.amazon.com" },
  ],
  faqItems: [
    {
      question: "What time should I arrive?",
      answer:
        "Please arrive 30 minutes before the ceremony so we can start on time.",
    },
    {
      question: "Is there parking at the venue?",
      answer:
        "Yes — complimentary parking is available, and a valet service will be on-site.",
    },
    {
      question: "Can I bring a plus-one?",
      answer:
        "Plus-ones are noted on individual invitations. Please RSVP with the names listed there.",
    },
    {
      question: "Are children welcome?",
      answer:
        "We adore your little ones, but our wedding will be an adults-only celebration.",
    },
  ],
  weddingParty: [
    { name: "Sofia", role: "Maid of Honor" },
    { name: "Daniel", role: "Best Man" },
    { name: "Elena", role: "Bridesmaid" },
    { name: "James", role: "Groomsman" },
  ],
  mapAddress: "Villa Bellaria\n12 Via del Mare\nPositano, Italy",
  hashtag: "#OliviaAndHenry2026",
  musicEmbed: "https://open.spotify.com/playlist/example",
  saveTheDateMessage:
    "We're getting married. Mark your calendars — the full invitation is on its way.",
};

/**
 * Merge dummy data with real user data — real values always win.
 * Used by the preview so every section shows believable content from frame one.
 */
export function withDummyFallback(
  theme: ThemeName | undefined,
  real: WeddingData
): WeddingData {
  const dummy = DUMMY_DATA[theme ?? "elegant"];
  const merged: WeddingData = { ...SHARED_OPTIONAL_DUMMY, ...dummy };
  (Object.keys(real) as (keyof WeddingData)[]).forEach((key) => {
    const v = real[key];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    // @ts-expect-error — index access on union
    merged[key] = v;
  });
  return merged;
}
