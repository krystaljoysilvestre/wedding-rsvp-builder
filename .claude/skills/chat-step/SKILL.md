---
name: chat-step
description: Add a new conversation step to the wedding builder chat flow. Use when adding a new question/interaction to the guided onboarding.
---

When adding a new conversation step:

1. Add the step name to `ConversationStep` union type in `src/lib/types.ts`
2. Add the step definition in `src/lib/conversation.ts` → `STEPS` object:
   ```ts
   step_name: {
     message: "Sweet, romantic question here",
     quickReplies: ["Option 1", "Option 2", "Skip"],  // optional
     selectionOnly: true,  // hide text input, force button click
     skippable: true,      // if step can be skipped
     field: "weddingDataField",  // which field this writes to
   },
   ```
3. Insert into the `FLOW` array at the right position
4. Add handler in `ChatPanel.tsx` → `advanceConversation`:
   - Use `currentStep === "step_name"` (reads from `stepRef.current`)
   - Call `update({ field: value })` to save data
   - Call `await goToStep("next_step")` to advance
5. Add to `STEP_TO_SECTION` mapping in ChatPanel for scroll targeting
6. If the step expects a specific type of answer (name, date, venue, address, etc.), add it to `STEP_EXPECTS` in `ChatPanel.tsx` for AI-powered input validation:
   ```ts
   step_name: "a description of what valid input looks like",
   ```
   The `/api/validate` endpoint uses this to intelligently detect off-topic input (greetings, random chat, gibberish) and respond warmly without saving invalid data. Steps not in `STEP_EXPECTS` skip validation entirely — use this for free-form steps like story input or timeline items.

Tone guidelines:
- Messages should be warm, romantic, and celebratory
- Like a loving wedding planner who's genuinely excited for the couple
- Keep messages concise (1-2 sentences)
- End with the question, not filler

Important: Always use `stepRef.current` (not the `step` state) inside `advanceConversation` to avoid stale closures.
