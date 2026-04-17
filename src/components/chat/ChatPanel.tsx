"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  ChatMessage,
  ConversationStep,
  ThemeName,
  TimelineItem,
  WeddingColors,
} from "@/lib/types";
import { useWedding } from "@/context/WeddingContext";
import {
  getInitialMessages,
  getStepDef,
  getNextFlowStep,
  getPhaseIntro,
  createMessage,
} from "@/lib/conversation";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

// ─── Color preset mapping ────────────────────────────────────────────

const COLOR_PRESETS: Record<string, WeddingColors> = {
  "blush & gold": { primary: "#F4C2C2", accent: "#D4A843" },
  "sage & ivory": { primary: "#9CAF88", accent: "#FFFFF0" },
  "navy & silver": { primary: "#1B2A4A", accent: "#C0C0C0" },
  "burgundy & cream": { primary: "#6B2737", accent: "#FFFDD0" },
};

// ─── Timeline parser ─────────────────────────────────────────────────

function parseTimeline(text: string): TimelineItem[] {
  return text
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const atMatch = entry.match(/^(.+?)\s+at\s+(.+)$/i);
      if (atMatch) return { label: atMatch[1].trim(), time: atMatch[2].trim() };
      return { label: entry, time: "" };
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function aiGenerate(
  type: "tagline" | "story" | "welcome" | "note" | "story_refine",
  body: Record<string, string>
): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...body }),
  });
  const data = await res.json();
  return data.result ?? "";
}

// ─── AI-powered input validation ────────────────────────────────────

const STEP_EXPECTS: Partial<Record<ConversationStep, string>> = {
  name1: "a person's first name",
  name2: "a person's first name",
  date: "a wedding date",
  ceremony_venue: "a venue or place name",
  ceremony_address: "a physical address",
  reception_name: "a venue or place name",
  reception_address: "a physical address",
  story_input: "a love story or personal narrative",
  timeline_items: "a list of wedding day events with times",
};

async function validateInput(
  input: string,
  step: ConversationStep
): Promise<{ valid: boolean; reply: string }> {
  const expecting = STEP_EXPECTS[step];
  // Steps without validation always pass
  if (!expecting) return { valid: true, reply: "" };

  // Quick replies and skip always pass
  const lower = input.toLowerCase().trim();
  if (lower === "skip") return { valid: true, reply: "" };
  const def = getStepDef(step);
  if (def.quickReplies?.some((q) => q.toLowerCase() === lower))
    return { valid: true, reply: "" };

  try {
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        expecting,
        question: def.message,
      }),
    });
    return await res.json();
  } catch {
    // On error, let it through
    return { valid: true, reply: "" };
  }
}

// ─── Step → preview section mapping ──────────────────────────────────

const STEP_TO_SECTION: Partial<Record<ConversationStep, string>> = {
  name1: "section-hero",
  name2: "section-hero",
  theme: "section-hero",
  color_motif: "section-hero",
  color_confirm: "section-hero",
  tagline: "section-hero",
  tagline_confirm: "section-hero",
  date: "section-hero",
  ceremony_type: "section-details",
  ceremony_venue: "section-details",
  ceremony_address: "section-details",
  reception: "section-details",
  reception_venue: "section-details",
  reception_name: "section-details",
  reception_address: "section-details",
  story: "section-story",
  story_input: "section-story",
  story_refine: "section-story",
  welcome: "section-story",
  rsvp: "section-rsvp",
  timeline: "section-timeline",
  timeline_items: "section-timeline",
  dress_code: "section-dresscode",
  countdown: "section-countdown",
  note_to_guests: "section-closing",
  background: "section-closing",
};

// ─── Component ───────────────────────────────────────────────────────

export default function ChatPanel() {
  const { data, update, setGenerating, setScrollTarget } = useWedding();
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [step, _setStep] = useState<ConversationStep>("name1");
  const stepRef = useRef<ConversationStep>("name1");
  const setStep = useCallback((s: ConversationStep) => {
    stepRef.current = s;
    _setStep(s);
  }, []);
  const [busy, setBusy] = useState(false);
  const [inputOverride, setInputOverride] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAssistant = useCallback(
    (content: string, quickReplies?: string[]) => {
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", content, quickReplies),
      ]);
    },
    []
  );

  const goToStep = useCallback(
    async (nextStep: ConversationStep) => {
      // Phase intro message
      const intro = getPhaseIntro(nextStep);
      if (intro) {
        await delay(400);
        addAssistant(intro);
      }

      setStep(nextStep);
      await delay(500);
      const def = getStepDef(nextStep);
      addAssistant(def.message, def.quickReplies);

      // Scroll preview to the relevant section
      const section = STEP_TO_SECTION[nextStep];
      if (section) {
        setScrollTarget(section);
      }
    },
    [addAssistant, setScrollTarget]
  );

  const advanceConversation = useCallback(
    async (userText: string) => {
      setMessages((prev) => [...prev, createMessage("user", userText)]);
      setBusy(true);
      setInputOverride(false);

      const currentStep = stepRef.current;
      const lower = userText.toLowerCase().trim();
      const isSkip = lower === "skip";

      try {
        // ─────────────────────────────────────────
        // AI-powered input validation
        // ─────────────────────────────────────────
        if (lower !== "back to my website") {
          const validation = await validateInput(userText, currentStep);
          if (!validation.valid) {
            await delay(400);
            addAssistant(validation.reply, ["Back to my website"]);
            setBusy(false);
            return;
          }
        }

        // Handle "Back to my website" — re-prompt current step
        if (lower === "back to my website") {
          const def = getStepDef(currentStep);
          await delay(300);
          addAssistant(def.message, def.quickReplies);
          setBusy(false);
          return;
        }

        // ─────────────────────────────────────────
        // Phase 1: Identity & vibe
        // ─────────────────────────────────────────
        if (currentStep === "name1") {
          update({ name1: userText });
          await delay(400);
          addAssistant(`${userText} — what a beautiful name!`);
          await goToStep("name2");
        } else if (currentStep === "name2") {
          update({ name2: userText });
          await delay(400);
          addAssistant(`${data.name1} & ${userText} — I already love the sound of that together!`);
          await goToStep("theme");
        } else if (currentStep === "theme") {
          const themeMap: Record<string, ThemeName> = {
            romantic: "romantic",
            elegant: "elegant",
            minimal: "minimal",
            cinematic: "cinematic",
          };
          update({ theme: themeMap[lower] ?? "elegant" });
          await goToStep("color_motif");
        } else if (currentStep === "color_motif") {
          if (!isSkip) {
            const preset = COLOR_PRESETS[lower];
            if (preset) {
              update({ colors: preset });
            } else {
              // Parse free text: could be hex, "hex & hex", or color names
              const hexes = userText.match(/#[0-9A-Fa-f]{3,8}/g);
              if (hexes && hexes.length >= 2) {
                update({ colors: { primary: hexes[0], accent: hexes[1] } });
              } else if (hexes && hexes.length === 1) {
                update({ colors: { primary: hexes[0], accent: hexes[0] } });
              } else {
                // Treat as a named color pair like "dusty rose & sage"
                const parts = userText.split(/\s*&\s*/);
                update({
                  colors: {
                    primary: parts[0]?.trim() || userText,
                    accent: parts[1]?.trim() || "",
                  },
                });
              }
            }
          }
          if (isSkip) {
            await goToStep("tagline");
          } else {
            await goToStep("color_confirm");
          }
        } else if (currentStep === "color_confirm") {
          if (lower === "perfect") {
            await goToStep("tagline");
          } else {
            // "Change colors" — go back
            await goToStep("color_motif");
          }
        } else if (currentStep === "tagline") {
          if (lower === "generate one for me") {
            setGenerating(true);
            addAssistant("Let me craft something as special as your love...");
            await delay(400);
            const tagline = await aiGenerate("tagline", {
              names: `${data.name1 ?? ""} & ${data.name2 ?? ""}`,
              theme: data.theme ?? "elegant",
            });
            update({ tagline });
            setGenerating(false);
            await delay(300);
            addAssistant(`"${tagline}"`);
            await goToStep("tagline_confirm");
          } else if (lower === "i'll write my own") {
            await delay(400);
            addAssistant("I love that you want it in your own words! Go ahead — type the tagline that speaks to your heart.");
            setInputOverride(true);
            setBusy(false);
            return;
          } else if (isSkip) {
            await goToStep("date");
          } else {
            update({ tagline: userText });
            await goToStep("date");
          }
        } else if (currentStep === "tagline_confirm") {
          if (lower === "love it") {
            await goToStep("date");
          } else if (lower === "try another") {
            setGenerating(true);
            addAssistant("No worries — let me find the words that truly capture you two...");
            await delay(400);
            const tagline = await aiGenerate("tagline", {
              names: `${data.name1 ?? ""} & ${data.name2 ?? ""}`,
              theme: data.theme ?? "elegant",
            });
            update({ tagline });
            setGenerating(false);
            await delay(300);
            addAssistant(`"${tagline}"`);
            const def = getStepDef("tagline_confirm");
            await delay(400);
            addAssistant(def.message, def.quickReplies);
          } else if (lower === "i'll write my own") {
            await delay(400);
            addAssistant("I love that you want it in your own words! Go ahead — type the tagline that speaks to your heart.");
            setStep("tagline");
            setInputOverride(true);
            setBusy(false);
            return;
          }

          // ─────────────────────────────────────────
          // Phase 2: Event details
          // ─────────────────────────────────────────
        } else if (currentStep === "date") {
          update({ date: userText });
          await goToStep("ceremony_type");
        } else if (currentStep === "ceremony_type") {
          update({ ceremonyType: userText });
          const typeMap: Record<string, string> = {
            church: "church",
            garden: "garden",
            beach: "beach",
            "venue / hall": "venue",
          };
          const label = typeMap[lower] ?? "venue";
          setStep("ceremony_venue");
          await delay(500);
          addAssistant(`What a dreamy choice! What's the name of the ${label}?`);
        } else if (currentStep === "ceremony_venue") {
          update({ ceremonyVenue: userText });
          await goToStep("ceremony_address");
        } else if (currentStep === "ceremony_address") {
          update({ ceremonyAddress: userText });
          await goToStep("reception");
        } else if (currentStep === "reception") {
          if (lower === "yes") {
            await goToStep("reception_venue");
          } else {
            await goToStep("story");
          }
        } else if (currentStep === "reception_venue") {
          if (lower === "same venue") {
            update({
              receptionVenue: data.ceremonyVenue,
              receptionAddress: data.ceremonyAddress,
            });
            await goToStep("story");
          } else {
            await goToStep("reception_name");
          }
        } else if (currentStep === "reception_name") {
          update({ receptionVenue: userText });
          await goToStep("reception_address");
        } else if (currentStep === "reception_address") {
          update({ receptionAddress: userText });
          await goToStep("story");

          // ─────────────────────────────────────────
          // Phase 3: Story & content
          // ─────────────────────────────────────────
        } else if (currentStep === "story") {
          if (lower === "yes") {
            await delay(400);
            addAssistant("How beautiful! Pour your heart out — tell me how love found you, and I'll place every word on your page.");
            setStep("story_input");
            setInputOverride(true);
            setBusy(false);
            return;
          } else {
            await goToStep("welcome");
          }
        } else if (currentStep === "story_input") {
          update({ story: userText });
          await goToStep("story_refine");
        } else if (currentStep === "story_refine") {
          if (lower === "looks good") {
            await goToStep("welcome");
          } else if (lower === "i'll rewrite it") {
            await delay(400);
            addAssistant("Of course! Take your time — every love story deserves to be told just right.");
            setStep("story_input");
            setInputOverride(true);
            setBusy(false);
            return;
          } else {
            // "Refine with AI" — use AI to refine based on their original
            setGenerating(true);
            addAssistant("Let me add a little sparkle to your story...");
            await delay(300);
            const story = await aiGenerate("story_refine", {
              story: data.story ?? "",
              instruction: "Make it more elegant and polished while keeping the original meaning",
            });
            update({ story });
            setGenerating(false);
            await delay(300);
            addAssistant(story);
            const def = getStepDef("story_refine");
            await delay(400);
            addAssistant(def.message, def.quickReplies);
          }
        } else if (currentStep === "welcome") {
          if (lower === "generate one for me") {
            setGenerating(true);
            addAssistant("Writing something warm and heartfelt for your guests...");
            await delay(300);
            const msg = await aiGenerate("welcome", {
              names: `${data.name1 ?? ""} & ${data.name2 ?? ""}`,
              theme: data.theme ?? "elegant",
            });
            update({ welcomeMessage: msg });
            setGenerating(false);
            await delay(300);
            addAssistant(`"${msg}"`);
          } else if (lower === "i'll write it") {
            await delay(400);
            addAssistant("Your words will mean the most! Go ahead, speak from the heart.");
            setInputOverride(true);
            setBusy(false);
            return; // stay on same step to collect input
          } else if (!isSkip) {
            update({ welcomeMessage: userText });
          }
          await goToStep("rsvp");

          // ─────────────────────────────────────────
          // Phase 4: Event experience
          // ─────────────────────────────────────────
        } else if (currentStep === "rsvp") {
          update({ rsvpEnabled: lower === "yes" });
          await goToStep("timeline");
        } else if (currentStep === "timeline") {
          if (lower === "yes") {
            await goToStep("timeline_items");
          } else {
            await goToStep("dress_code");
          }
        } else if (currentStep === "timeline_items") {
          update({ timeline: parseTimeline(userText) });
          await goToStep("dress_code");
        } else if (currentStep === "dress_code") {
          if (!isSkip) update({ dressCode: userText });
          await goToStep("countdown");

          // ─────────────────────────────────────────
          // Phase 5: Enhancements
          // ─────────────────────────────────────────
        } else if (currentStep === "countdown") {
          update({ countdownEnabled: lower === "yes" });
          await goToStep("note_to_guests");
        } else if (currentStep === "note_to_guests") {
          if (lower === "generate one") {
            setGenerating(true);
            addAssistant("Let me write something sweet for the people you love most...");
            await delay(300);
            const note = await aiGenerate("note", {
              names: `${data.name1 ?? ""} & ${data.name2 ?? ""}`,
              theme: data.theme ?? "elegant",
            });
            update({ noteToGuests: note });
            setGenerating(false);
            await delay(300);
            addAssistant(`"${note}"`);
            await goToStep("background");
          } else if (lower === "i'll write my own") {
            await delay(400);
            addAssistant("From your heart to theirs — go ahead and write your message to the people who matter most.");
            setInputOverride(true);
            setBusy(false);
            return;
          } else if (isSkip) {
            await goToStep("background");
          } else {
            update({ noteToGuests: userText });
            await goToStep("background");
          }
        } else if (currentStep === "background") {
          update({ backgroundStyle: userText });
          setStep("done");
          await delay(500);
          const def = getStepDef("done");
          addAssistant(def.message, def.quickReplies);
        }
      } catch {
        addAssistant(
          "Oh no, a little hiccup — but don't worry, your beautiful progress is safe. Let's keep building your love story!"
        );
        const next = getNextFlowStep(currentStep);
        if (next !== currentStep) await goToStep(next);
      } finally {
        setBusy(false);
      }
    },
    [data, update, setGenerating, setStep, addAssistant, goToStep]
  );

  return (
    <div className="flex h-full flex-col bg-[#FDFBF7]">
      {/* Header */}
      <div className="border-b border-[#EDE8E0] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A]">
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Heart */}
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              {/* Code brackets */}
              <path d="M9.5 10l-2 2 2 2" strokeWidth={2} />
              <path d="M14.5 10l2 2-2 2" strokeWidth={2} />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Coded with Love
            </p>
            <p className="text-[11px] text-[#A09580]">
              Your AI wedding planner
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onQuickReply={advanceConversation}
            isLatest={i === messages.length - 1}
          />
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-[#F5F3EF] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B8A48E] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B8A48E] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B8A48E]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — hidden when step requires selection only (unless overridden) */}
      {(!getStepDef(step).selectionOnly || inputOverride) && (
        <ChatInput onSend={advanceConversation} disabled={busy} />
      )}
    </div>
  );
}
