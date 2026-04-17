import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ValidateRequest {
  input: string;
  expecting: string;
  question: string;
}

const SYSTEM = `You are validating user input for a wedding website builder chatbot.

You will receive:
- "expecting": what kind of answer is expected (e.g. "a person's first name", "a wedding date", "a venue name")
- "question": the question that was asked
- "input": what the user typed

Decide if the input is a valid answer to the question, or if it's off-topic (greeting, random chat, question, gibberish, etc).

Respond with ONLY valid JSON:
{
  "valid": true or false,
  "reply": "only if valid is false — a sweet, warm 1-2 sentence response that briefly acknowledges what they said, then lovingly guides them back to answer the question. Be romantic and friendly like a wedding planner."
}

Examples:
- expecting "a person's first name", input "hello" → { "valid": false, "reply": "Hello, lovely! I'm so happy you're here. Now, what's your name, beautiful?" }
- expecting "a person's first name", input "Krystal" → { "valid": true }
- expecting "a person's first name", input "what can you do?" → { "valid": false, "reply": "I can help you build the most beautiful wedding website! But first, I'd love to know your name." }
- expecting "a wedding date", input "June 15, 2026" → { "valid": true }
- expecting "a wedding date", input "I'm not sure yet" → { "valid": true }
- expecting "a wedding date", input "lol" → { "valid": false, "reply": "Haha, the excitement is real! But when's the big day? Even a rough idea works!" }
- expecting "a venue name", input "The Grand Estate" → { "valid": true }
- expecting "a venue name", input "thanks" → { "valid": false, "reply": "You're so welcome! Now, what's the name of the venue where the magic will happen?" }

Be generous — if the input could reasonably be an answer, mark it valid. Only flag clearly off-topic inputs.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidateRequest;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: JSON.stringify({
            expecting: body.expecting,
            question: body.question,
            input: body.input,
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);

    return Response.json({
      valid: parsed.valid ?? true,
      reply: parsed.reply ?? "",
    });
  } catch {
    // On error, assume valid to avoid blocking the user
    return Response.json({ valid: true, reply: "" });
  }
}
