import type { ThemeName, WeddingData } from "./types";

// Per-template fictional couples. Used in the builder preview so every section
// renders with believable content from the first frame; sections still showing
// dummy content are tagged with a small "Suggested" badge until the user fills
// in their own values. Also used by the `/preview-demo/[theme]` route (gallery
// + modal preview), where badges and toggle-driven hides are disabled.
//
// All sample weddings are set in the Philippines — venues, place names, and
// little cultural touches throughout — so the preview reads as a believable
// local wedding from frame one.

export const DUMMY_DATA: Record<ThemeName, WeddingData> = {
  romantic: {
    name1: "Andrea",
    name2: "Miguel",
    date: "September 14, 2026",
    tagline: "A love written in soft light and sampaguita",
    ceremonyType: "Garden",
    ceremonyVenue: "Antonio's Garden",
    ceremonyAddress: "Tagaytay City, Cavite",
    receptionVenue: "The Garden Pavilion",
    receptionAddress: "Tagaytay City, Cavite",
    story:
      "They met one slow afternoon in a BGC bookstore, reaching for the same Neruda. Two summers of long walks along the Pasig esplanade later, he asked her to stay forever.",
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
    noteToGuests: "Come ready to dance under the Tagaytay stars.",
  },

  elegant: {
    name1: "Isabel",
    name2: "Marco",
    date: "October 18, 2026",
    tagline: "Two lives, one extraordinary night",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Peninsula Manila",
    ceremonyAddress: "Ayala Avenue, Makati",
    receptionVenue: "Rigodon Ballroom, The Peninsula",
    receptionAddress: "Ayala Avenue, Makati",
    story:
      "An introduction at a mutual friend's gallery in Karrivin Plaza turned into dinner at Toyo Eatery, turned into a decade. Some loves take time to find each other — theirs arrived perfectly on time.",
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
    name1: "Mariel",
    name2: "Lucas",
    date: "April 18, 2026",
    tagline: "Simply, us",
    ceremonyType: "Other",
    ceremonyVenue: "Sevilla Heritage Chapel",
    ceremonyAddress: "Loboc, Bohol",
    receptionVenue: "South Palms Resort",
    receptionAddress: "Panglao Island, Bohol",
    story:
      "They fell in love quietly, over slow mornings and Loboc river boat rides. No grand gesture — just the certainty that life was better together.",
    welcomeMessage:
      "Thank you for traveling with us to this quiet corner of Bohol.",
    timeline: [
      { label: "Ceremony", time: "11:00 AM" },
      { label: "Lunch & Photos", time: "12:30 PM" },
      { label: "Dinner", time: "6:00 PM" },
    ],
    dressCode: "Cocktail",
    rsvpEnabled: true,
    countdownEnabled: false,
    noteToGuests: "Bring your stillness and your smile.",
  },

  cinematic: {
    name1: "Camille",
    name2: "Joaquin",
    date: "November 21, 2026",
    tagline: "The opening credits of forever",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "Cultural Center of the Philippines",
    ceremonyAddress: "CCP Complex, Pasay City",
    receptionVenue: "CCP Main Lobby",
    receptionAddress: "CCP Complex, Pasay City",
    story:
      "She was writing her first screenplay. He was scoring someone else's. A late-night dim sum table in Binondo turned into a lifetime collaboration.",
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
    name1: "Bea",
    name2: "Andres",
    date: "May 30, 2026",
    tagline: "Rooted, and reaching toward the sun",
    ceremonyType: "Garden",
    ceremonyVenue: "Sonya's Garden",
    ceremonyAddress: "Alfonso, Cavite",
    receptionVenue: "The Garden Pavilion",
    receptionAddress: "Alfonso, Cavite",
    story:
      "Two botanists from UP Los Baños who first argued about endemic species at a conference, and never stopped talking since. Their favorite walk is still the one that started it all.",
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
    name1: "Andrea",
    name2: "Mark",
    date: "September 12, 2026",
    tagline: "By design. In every way.",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Aviary",
    ceremonyAddress: "Vermosa, Imus",
    receptionVenue: "Aviary Rooftop",
    receptionAddress: "Vermosa, Imus",
    story:
      "Two architects who kept sketching over each other's napkins at El Made in BGC. They decided to build one life instead of two portfolios.",
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
    name1: "Carmela",
    name2: "Rafael",
    date: "December 5, 2026",
    tagline: "A gilded age for two",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "The Manila Hotel",
    ceremonyAddress: "One Rizal Park, Manila",
    receptionVenue: "Champagne Ballroom, The Manila Hotel",
    receptionAddress: "One Rizal Park, Manila",
    story:
      "She collected old Filipino jazz vinyls. He inherited his lolo's piano from Vigan. Their first date at Café Adriatico lasted until the band packed up and the lights came on.",
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
    name1: "Maya",
    name2: "Joshua",
    date: "March 21, 2026",
    tagline: "Two wandering souls, one steady fire",
    ceremonyType: "Other",
    ceremonyVenue: "Sebay Surf Central",
    ceremonyAddress: "San Juan, La Union",
    receptionVenue: "Beachside Bonfire",
    receptionAddress: "San Juan, La Union",
    story:
      "They met at a Lakbay sa La Union surf weekend, bonded over the last buko juice, and have been chasing sunsets along the coast ever since.",
    welcomeMessage:
      "Come wander with us. This coast has seen a lot of love — let's add ours.",
    timeline: [
      { label: "Ceremony at Sunset", time: "5:30 PM" },
      { label: "Bonfire Cocktails", time: "7:00 PM" },
      { label: "Dinner & Dancing", time: "8:00 PM" },
    ],
    dressCode: "Coastal Bohemian",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests:
      "Bring a light layer. The breeze gets cool, the love does not.",
  },

  coastal: {
    name1: "Marisol",
    name2: "Kai",
    date: "July 4, 2026",
    tagline: "The sea brought us here",
    ceremonyType: "Beach",
    ceremonyVenue: "White Beach Pavilion",
    ceremonyAddress: "Boracay, Aklan",
    receptionVenue: "Discovery Shores Boracay",
    receptionAddress: "Boracay, Aklan",
    story:
      "A missed boat to El Nido. A shared mango shake under a coconut tree. Two people who didn't plan to stay turned their layover into forever.",
    welcomeMessage:
      "Mabuhay. Thank you for crossing islands for us — we'll make it worth the trip.",
    timeline: [
      { label: "Ceremony", time: "5:30 PM" },
      { label: "Sunset Cocktails", time: "6:30 PM" },
      { label: "Dinner & Dancing", time: "8:00 PM" },
    ],
    dressCode: "Coastal Cocktail",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Come for the sea. Stay for the lechon.",
  },

  vintage: {
    name1: "Carmela",
    name2: "Lorenzo",
    date: "August 23, 2026",
    tagline: "A love letter, carried forward",
    ceremonyType: "Garden",
    ceremonyVenue: "Heritage Garden at Calle Crisologo",
    ceremonyAddress: "Vigan, Ilocos Sur",
    receptionVenue: "Casa Crisologo Courtyard",
    receptionAddress: "Vigan, Ilocos Sur",
    story:
      "They found each other in handwritten letters, before they ever met. A correspondence that began with a typo on a Manila postcard and ended with a proposal under a kalesa.",
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
    ceremonyAddress: "Marbel, South Cotabato",
    receptionVenue: "The Farm @ Carpenter Hill",
    receptionAddress: "Koronadal City, South Cotabato",
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
    name1: "Bea",
    name2: "Caleb",
    date: "October 11, 2026",
    tagline: "Where the fields sing back to love",
    ceremonyType: "Other",
    ceremonyVenue: "Don Bosco Farm",
    ceremonyAddress: "Malaybalay, Bukidnon",
    receptionVenue: "Mountainside Pavilion",
    receptionAddress: "Malaybalay, Bukidnon",
    story:
      "She was restoring an old farmhouse in Cavite. He delivered the reclaimed nara beams. Six months of dusty afternoons turned into a quieter, steadier kind of forever.",
    welcomeMessage:
      "Thank you for making the drive. Pull up a seat — the sunset is the best part.",
    timeline: [
      { label: "Ceremony", time: "4:00 PM" },
      { label: "Farmyard Cocktails", time: "5:00 PM" },
      { label: "Dinner & Dancing", time: "6:30 PM" },
    ],
    dressCode: "Country Formal",
    rsvpEnabled: true,
    countdownEnabled: true,
    noteToGuests: "Wear shoes that can dance in the grass.",
  },

  watercolor: {
    name1: "Joana",
    name2: "Sebastian",
    date: "April 4, 2026",
    tagline: "Painted, softly, into forever",
    ceremonyType: "Garden",
    ceremonyVenue: "Pinto Art Museum",
    ceremonyAddress: "Antipolo, Rizal",
    receptionVenue: "Pinto Garden Courtyard",
    receptionAddress: "Antipolo, Rizal",
    story:
      "She painted watercolors of Antipolo. He played classical guitar. They met when her brush dripped onto his sheet music — and neither of them minded one bit.",
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
    noteToGuests: "The afternoon light over the hills is the real painter.",
  },

  tropical: {
    name1: "Sky",
    name2: "Kai",
    date: "July 20, 2026",
    tagline: "Paradise, with witnesses",
    ceremonyType: "Beach",
    ceremonyVenue: "El Nido Resorts Lagen Island",
    ceremonyAddress: "El Nido, Palawan",
    receptionVenue: "Lagoon Pavilion",
    receptionAddress: "El Nido, Palawan",
    story:
      "She came for a vacation. He was the freediving instructor. One week in Bacuit Bay, and she rebooked her flight — she never did get around to leaving.",
    welcomeMessage:
      "Mabuhay, dear ones. Thank you for crossing the water to celebrate with us.",
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
    name1: "Tessa",
    name2: "Paolo",
    date: "June 6, 2026",
    tagline: "A little magic, a lot of love",
    ceremonyType: "Other",
    ceremonyVenue: "Sky Ranch Tagaytay",
    ceremonyAddress: "Tagaytay City, Cavite",
    receptionVenue: "The Big Top Pavilion",
    receptionAddress: "Tagaytay City, Cavite",
    story:
      "They met at the Salcedo Saturday Market, arguing about which ube cookie was better. They still argue — now, it's about which song to dance to first.",
    welcomeMessage:
      "Welcome to the most joyful afternoon of our year. We promise games, dancing, and possibly a Ferris wheel ride.",
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
    name1: "Isabella",
    name2: "Enrique",
    date: "September 26, 2026",
    tagline: "Two thrones, one kingdom",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "Las Casas Filipinas de Acuzar",
    ceremonyAddress: "Bagac, Bataan",
    receptionVenue: "Casa Quiapo Grand Hall",
    receptionAddress: "Bagac, Bataan",
    story:
      "Old college friends from Ateneo who reconnected at a gala in Forbes Park a decade later. One dance became two, and two became the only dance she ever wanted.",
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
    name1: "Mark",
    name2: "Sofia",
    date: "November 7, 2026",
    tagline: "Concrete, steel, and everything after",
    ceremonyType: "Venue / Hall",
    ceremonyVenue: "Karrivin Plaza Warehouse",
    ceremonyAddress: "Pasong Tamo Extension, Makati",
    receptionVenue: "Karrivin Rooftop",
    receptionAddress: "Pasong Tamo Extension, Makati",
    story:
      "Two architects who met at a site walk in Poblacion. They've been drawing plans together — and a life to match — ever since.",
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
    noteToGuests: "Stay until the Manila skyline shows off.",
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
    "We've reserved a block of rooms at Seda Vertis North, a short drive from the venue. Mention our names at booking for the wedding rate.\n\nThe nearest airport is Ninoy Aquino International (NAIA) — about 30 minutes by Grab. Parking is available on-site.",
  registryLinks: [
    { label: "Rustan's", url: "https://www.rustans.com" },
    { label: "Honeymoon Fund", url: "https://example.com/honeymoon" },
    { label: "GCash Gift", url: "https://example.com/gcash" },
  ],
  faqItems: [
    {
      question: "What time should I arrive?",
      answer:
        "Please arrive 30 minutes before the ceremony so we can start on time — we'll keep to Filipino time, but barely.",
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
    { name: "Maria", role: "Maid of Honor" },
    { name: "Joaquin", role: "Best Man" },
    { name: "Carmela", role: "Bridesmaid" },
    { name: "Rafael", role: "Groomsman" },
  ],
  mapAddress:
    "Antonio's Tagaytay\n4150 Aguinaldo Highway\nTagaytay City, Cavite",
  hashtag: "#AndreaAndMiguel2026",
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
