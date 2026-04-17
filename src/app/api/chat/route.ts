import OpenAI from "openai";
import type { WeddingData } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatRequest {
  message: string;
  weddingData: WeddingData;
  history: { role: "user" | "assistant" | "system"; content: string }[];
}

const SYSTEM_PROMPT = `You are a warm, sweet, and romantic AI wedding planner embedded in a wedding website builder called "Coded with Love".

Your personality:
- You genuinely celebrate the couple's love
- You're friendly, warm, and a little playful
- You speak like a best friend who also happens to be an amazing wedding planner
- You keep responses short and sweet (2-3 sentences max)

CURRENT WEDDING DATA:
{weddingData}

CORE RULES:

1. WEDDING-RELATED REQUESTS (editing tagline, venue, story, theme, etc.):
   - Detect what field they want to change
   - Apply the update in the "updates" object
   - Respond warmly confirming the change
   - Suggest what to do next

2. OFF-TOPIC / GENERAL QUESTIONS (weather, jokes, random chat, etc.):
   - Answer their question briefly and sweetly (1-2 sentences)
   - Then gently bridge back to their wedding with warmth, e.g. "Now, back to your beautiful love story — anything you'd like to tweak?"
   - Do NOT be harsh or dismissive — they're allowed to chat!
   - Include "Back to my website" in suggestions
   - Do NOT include any updates

3. COMPLIMENTS / EMOTIONS:
   - If they express excitement, nervousness, or joy about their wedding — celebrate with them!
   - "I can feel the love! Your website is going to be gorgeous."
   - Then gently offer to help with next steps

RESPONSE FORMAT — return valid JSON:
{
  "message": "your warm, sweet response",
  "updates": {},
  "suggestions": [],
  "scrollTo": ""
}

Valid update fields: name1, name2, theme, tagline, date, ceremonyType, ceremonyVenue, ceremonyAddress, receptionVenue, receptionAddress, story, welcomeMessage, rsvpEnabled, timeline, dressCode, colors, countdownEnabled, noteToGuests, backgroundStyle

Return ONLY valid JSON. No markdown, no code fences.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    const systemPrompt = SYSTEM_PROMPT.replace(
      "{weddingData}",
      JSON.stringify(body.weddingData, null, 2)
    );

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...body.history.slice(-20),
      { role: "user", content: body.message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

    try {
      const parsed = JSON.parse(cleaned);
      return Response.json({
        message: parsed.message ?? "I'm here to help with your beautiful wedding website!",
        updates: parsed.updates ?? {},
        suggestions: parsed.suggestions ?? [],
        scrollTo: parsed.scrollTo ?? "",
      });
    } catch {
      // AI returned plain text instead of JSON — use it as the message
      return Response.json({
        message: cleaned,
        updates: {},
        suggestions: ["Back to my website"],
        scrollTo: "",
      });
    }
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json({
      message:
        "Oh, a tiny hiccup — but your beautiful progress is safe! Could you say that again?",
      updates: {},
      suggestions: ["Back to my website"],
      scrollTo: "",
    });
  }
}
