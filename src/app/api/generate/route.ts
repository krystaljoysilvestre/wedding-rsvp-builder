import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateRequest {
  type: "tagline" | "story" | "welcome" | "note" | "story_refine";
  names?: string;
  theme?: string;
  input?: string;
  story?: string;
  instruction?: string;
}

const PROMPTS: Record<string, (body: GenerateRequest) => string> = {
  tagline: (b) =>
    `Write a short, romantic wedding tagline (under 10 words) for ${b.names}. ` +
    `Tone: ${b.theme}. Return ONLY the tagline text, no quotes.`,

  story: (b) =>
    `Write a short, elegant love story (3-4 sentences, under 80 words) for ${b.names}. ` +
    `Based on this input: "${b.input}". Tone: ${b.theme}. ` +
    `Write in third person. Return ONLY the story text.`,

  welcome: (b) =>
    `Write a warm wedding welcome message (2-3 sentences, under 60 words) for ${b.names}. ` +
    `Tone: ${b.theme}. This is for their wedding website homepage. ` +
    `Return ONLY the message text.`,

  note: (b) =>
    `Write a short, heartfelt note to wedding guests (2 sentences, under 40 words) from ${b.names}. ` +
    `Tone: ${b.theme}. Return ONLY the note text.`,

  story_refine: (b) =>
    `Rewrite this wedding love story with the following adjustment: "${b.instruction}"\n\n` +
    `Original story: "${b.story}"\n\n` +
    `Keep it 3-4 sentences, under 80 words. Return ONLY the rewritten story.`,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const promptFn = PROMPTS[body.type];

    if (!promptFn) {
      return Response.json({ error: "Invalid type." }, { status: 400 });
    }

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
    console.error("Generate API error:", err);

    // Fallback per type
    const fallbacks: Record<string, string> = {
      tagline: "A celebration of love",
      story:
        "Their paths crossed in the most unexpected way, and from that moment, everything changed. What began as a spark became an unbreakable bond.",
      welcome:
        "We are so excited to share this special day with you. Your presence means the world to us.",
      note: "Thank you for being part of our story. We can't wait to celebrate with you.",
      story_refine: "",
    };

    const body = await request
      .json()
      .catch(() => ({ type: "tagline" } as GenerateRequest));
    return Response.json({
      result: fallbacks[body.type] ?? fallbacks.tagline,
    });
  }
}
