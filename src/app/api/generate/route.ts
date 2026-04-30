import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type StringType =
  | "tagline"
  | "story"
  | "welcome"
  | "note"
  | "tagline_refine"
  | "story_refine"
  | "welcome_refine"
  | "note_refine";
type ListType = "wedding_party" | "faq" | "timeline";

interface GenerateRequest {
  type: StringType | ListType;
  names?: string;
  theme?: string;
  tone?: string;
  input?: string;
  story?: string;
  instruction?: string;
  ceremonyTime?: string;
  ceremonyVenue?: string;
}

function toneOf(b: GenerateRequest): string {
  return b.tone || b.theme || "elegant";
}

const STRING_PROMPTS: Record<StringType, (body: GenerateRequest) => string> = {
  tagline: (b) =>
    `Write a short, romantic wedding tagline (under 10 words) for ${b.names}. ` +
    `Tone: ${toneOf(b)}. Return ONLY the tagline text, no quotes.`,

  story: (b) =>
    `Write a short, elegant love story (3-4 sentences, under 80 words) for ${b.names}. ` +
    `Based on this input: "${b.input}". Tone: ${toneOf(b)}. ` +
    `Write in third person. Return ONLY the story text.`,

  welcome: (b) =>
    `Write a warm wedding welcome message (2-3 sentences, under 60 words) for ${b.names}. ` +
    `Tone: ${toneOf(b)}. This is for their wedding website homepage. ` +
    `Return ONLY the message text.`,

  note: (b) =>
    `Write a short, heartfelt note to wedding guests (2 sentences, under 40 words) from ${b.names}. ` +
    `Tone: ${toneOf(b)}. Return ONLY the note text.`,

  story_refine: (b) =>
    `Rewrite this wedding love story with the following adjustment: "${b.instruction}"\n\n` +
    `Original story: "${b.input ?? b.story ?? ""}"\n\n` +
    `Keep it 3-4 sentences, under 80 words. Tone: ${toneOf(b)}. ` +
    `Return ONLY the rewritten story.`,

  tagline_refine: (b) =>
    `Rewrite this wedding tagline with the following adjustment: "${b.instruction}"\n\n` +
    `Original tagline: "${b.input ?? ""}"\n\n` +
    `Keep it under 10 words. Tone: ${toneOf(b)}. ` +
    `Return ONLY the rewritten tagline text, no quotes.`,

  welcome_refine: (b) =>
    `Rewrite this wedding welcome message with the following adjustment: "${b.instruction}"\n\n` +
    `Original message: "${b.input ?? ""}"\n\n` +
    `Keep it 2-3 sentences, under 60 words. Tone: ${toneOf(b)}. ` +
    `Return ONLY the rewritten message text.`,

  note_refine: (b) =>
    `Rewrite this note to wedding guests with the following adjustment: "${b.instruction}"\n\n` +
    `Original note: "${b.input ?? ""}"\n\n` +
    `Keep it 2 sentences, under 40 words. Tone: ${toneOf(b)}. ` +
    `Return ONLY the rewritten note text.`,
};

// JSON-mode prompts. Each must explicitly mention "JSON" because OpenAI's
// json_object response_format requires it. Filipino-aware sample data —
// these are the dummy seeds non-techy couples use as a starting point.
const LIST_PROMPTS: Record<ListType, (b: GenerateRequest) => string> = {
  wedding_party: (b) =>
    `Generate a sample wedding party for ${b.names || "a Filipino couple"}'s ` +
    `wedding. Return JSON in this exact shape: ` +
    `{ "members": [{ "name": string, "role": string }] }. ` +
    `Include exactly 4 members: Maid of Honor, Best Man, Bridesmaid, Groomsman. ` +
    `Use authentic Filipino names (Maria, Joaquin, Carmela, Rafael, Bea, Andres, Camille, Marco, etc.). ` +
    `Return ONLY valid JSON.`,

  faq: (b) =>
    `Generate 4 common wedding FAQs for ${b.names || "a Filipino couple"}'s ` +
    `wedding. Return JSON in this exact shape: ` +
    `{ "items": [{ "question": string, "answer": string }] }. ` +
    `Cover these topics in order: 1) parking and how to get there, ` +
    `2) the dress code, 3) whether children/plus-ones are welcome, ` +
    `4) gift preferences (mention that monetary gifts are warmly received — ` +
    `this is common at Filipino weddings). Keep answers warm, practical, ` +
    `1-2 sentences each. Return ONLY valid JSON.`,

  timeline: (b) =>
    `Generate a typical wedding-day timeline for ${b.names || "a Filipino couple"}, ` +
    `starting around ${b.ceremonyTime || "4:00 PM"}` +
    (b.ceremonyVenue ? ` at ${b.ceremonyVenue}` : "") +
    `. Return JSON in this exact shape: ` +
    `{ "items": [{ "time": string, "label": string }] }. ` +
    `Include exactly 8 events in chronological order: Guest arrival, ` +
    `Ceremony, Cocktail hour, Reception entrance, Dinner & speeches, ` +
    `First dance, Bouquet & garter toss, Send-off. Times in 12-hour format ` +
    `with AM/PM (e.g. "4:00 PM"), spaced 30-60 minutes apart. ` +
    `Return ONLY valid JSON.`,
};

const STRING_FALLBACKS: Record<StringType, string> = {
  tagline: "A celebration of love",
  story:
    "Their paths crossed in the most unexpected way, and from that moment, everything changed. What began as a spark became an unbreakable bond.",
  welcome:
    "We are so excited to share this special day with you. Your presence means the world to us.",
  note: "Thank you for being part of our story. We can't wait to celebrate with you.",
  // Refines fall back to empty so the existing user value is preserved on failure.
  tagline_refine: "",
  story_refine: "",
  welcome_refine: "",
  note_refine: "",
};

const LIST_FALLBACKS: Record<ListType, unknown[]> = {
  wedding_party: [
    { name: "Maria Santos", role: "Maid of Honor" },
    { name: "Joaquin Reyes", role: "Best Man" },
    { name: "Carmela Cruz", role: "Bridesmaid" },
    { name: "Rafael de la Cruz", role: "Groomsman" },
  ],
  faq: [
    {
      question: "Is there parking at the venue?",
      answer:
        "Yes — complimentary parking is available. We recommend carpooling if possible.",
    },
    {
      question: "What's the dress code?",
      answer: "Semi-formal. We can't wait to see you all dressed up!",
    },
    {
      question: "Can I bring my kids or a plus-one?",
      answer:
        "We're keeping the celebration intimate — please only bring guests listed on your invitation.",
    },
    {
      question: "Are gifts expected?",
      answer:
        "Your presence is the greatest gift. If you'd like to give more, monetary gifts are warmly received.",
    },
  ],
  timeline: [
    { time: "3:30 PM", label: "Guests arrive" },
    { time: "4:00 PM", label: "Ceremony begins" },
    { time: "5:00 PM", label: "Cocktail hour" },
    { time: "6:00 PM", label: "Reception entrance" },
    { time: "6:30 PM", label: "Dinner & speeches" },
    { time: "8:00 PM", label: "First dance" },
    { time: "9:00 PM", label: "Bouquet & garter toss" },
    { time: "10:30 PM", label: "Send-off" },
  ],
};

function isListType(t: string): t is ListType {
  return t === "wedding_party" || t === "faq" || t === "timeline";
}

export async function POST(request: Request) {
  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (isListType(body.type)) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate sample wedding content as valid JSON. Filipino-aware. Return ONLY JSON — no commentary, no markdown.",
          },
          { role: "user", content: LIST_PROMPTS[body.type](body) },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content) as {
        members?: unknown[];
        items?: unknown[];
      };
      const items = parsed.members ?? parsed.items ?? [];
      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ result: LIST_FALLBACKS[body.type] });
      }
      return Response.json({ result: items });
    } catch (err) {
      console.error("Generate API (list) error:", err);
      return Response.json({ result: LIST_FALLBACKS[body.type] });
    }
  }

  // String-type generations
  const promptFn = STRING_PROMPTS[body.type as StringType];
  if (!promptFn) {
    return Response.json({ error: "Invalid type." }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an elegant wedding copywriter. Write in a refined, poetic tone. " +
            "Return ONLY the requested text — no labels, no quotes, no markdown.",
        },
        { role: "user", content: promptFn(body) },
      ],
      temperature: 0.8,
      max_tokens: 256,
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? "";
    return Response.json({ result });
  } catch (err) {
    console.error("Generate API (string) error:", err);
    return Response.json({
      result: STRING_FALLBACKS[body.type as StringType] ?? STRING_FALLBACKS.tagline,
    });
  }
}
