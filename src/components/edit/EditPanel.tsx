"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { displayNames } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import FormSection from "./FormSection";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import { DebouncedInput, DebouncedTextarea } from "./DebouncedField";
import TimelineEditor from "./TimelineEditor";
import ImageUpload from "./ImageUpload";
import AIGenerateButton from "./AIGenerateButton";
import StepProgress from "./StepProgress";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import SectionManager from "./SectionManager";
import LastSaved from "@/components/builder/LastSaved";
import { DUMMY_DATA } from "@/lib/dummyData";
import type { SectionId } from "@/lib/themes";
import {
  GalleryEditor,
  RegistryEditor,
  FaqEditor,
  PartyEditor,
} from "./OptionalSectionEditors";

const FIELD_SECTION: Record<string, string> = {
  name1: "section-hero",
  name2: "section-hero",
  tagline: "section-hero",
  "colors.primary": "section-hero",
  "colors.accent": "section-hero",
  date: "section-hero",
  ceremonyType: "section-details",
  ceremonyVenue: "section-details",
  ceremonyAddress: "section-details",
  ceremonyTime: "section-details",
  receptionVenue: "section-details",
  receptionAddress: "section-details",
  receptionTime: "section-details",
  story: "section-story",
  welcomeMessage: "section-story",
  rsvpEnabled: "section-rsvp",
  timeline: "section-timeline",
  dressCode: "section-dresscode",
  countdownEnabled: "section-countdown",
  noteToGuests: "section-closing",
  // Optional sections
  galleryImages: "section-gallery",
  travelInfo: "section-travel",
  registryLinks: "section-registry",
  faqItems: "section-faq",
  weddingParty: "section-weddingParty",
  mapAddress: "section-map",
  hashtag: "section-hashtag",
  musicEmbed: "section-hashtag",
  saveTheDateMessage: "section-saveTheDate",
};

// When a step opens, the preview scrolls to the matching section so the user
// sees what they're about to edit.
const STEP_TO_PREVIEW: Record<number, string> = {
  1: "section-hero",
  2: "section-details",
  3: "section-hero", // step 3 is enhancement — show the whole flow from the top
};

// Reverse: when a step is open in the editor, which preview sections
// represent what the user is currently editing. Steps 1 and 2 each map to a
// single canonical section. Step 3 is enhancement and doesn't claim any
// single section as "active."
const STEP_TO_SECTIONS: Record<number, string[]> = {
  1: ["section-hero"],
  2: ["section-details"],
};
const ADVANCED_SECTIONS = ["section-closing"];

// Inverse direction of FIELD_SECTION: when a preview section is clicked,
// the editor needs to know which step to open. "advanced" means the
// Advanced section (independent of currentStep 1/2/3).
type StepKey = 1 | 2 | 3 | "advanced";
const FIELD_TO_STEP: Record<string, StepKey> = {
  // Step 1 — Basics: names, date, hero image, tagline, RSVP toggle
  name1: 1,
  name2: 1,
  date: 1,
  heroImage: 1,
  tagline: 1,
  rsvpEnabled: 1,
  // Step 2 — When and where: ceremony type, venue, address, time, reception
  ceremonyType: 2,
  ceremonyVenue: 2,
  ceremonyAddress: 2,
  ceremonyTime: 2,
  receptionVenue: 2,
  receptionAddress: 2,
  receptionTime: 2,
  // Step 3 — Optional enhancements: story, welcome, logistics extras,
  // plus the 8 optional section editors.
  welcomeMessage: 3,
  story: 3,
  timeline: 3,
  dressCode: 3,
  countdownEnabled: 3,
  noteToGuests: 3,
  closingImage: 3,
  galleryImages: 3,
  travelInfo: 3,
  registryLinks: 3,
  faqItems: 3,
  weddingParty: 3,
  mapAddress: 3,
  hashtag: 3,
  musicEmbed: 3,
  saveTheDateMessage: 3,
  // Advanced — pure visual overrides
  "colors.primary": "advanced",
  "colors.accent": "advanced",
  logoImage: "advanced",
};

// For Step-3 fields: which Section the field's editor lives inside. When
// click-to-edit lands on one of these fields, SectionManager auto-expands
// that section's accordion row.
const SECTION_FOR_FIELD: Partial<Record<string, SectionId>> = {
  welcomeMessage: "story",
  story: "story",
  timeline: "timeline",
  dressCode: "dresscode",
  countdownEnabled: "countdown",
  closingImage: "closing",
  noteToGuests: "closing",
  galleryImages: "gallery",
  travelInfo: "travel",
  registryLinks: "registry",
  faqItems: "faq",
  weddingParty: "weddingParty",
  mapAddress: "map",
  hashtag: "hashtag",
  musicEmbed: "hashtag",
  saveTheDateMessage: "saveTheDate",
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300"
      style={{ background: checked ? "#1A1A1A" : "#E0D9CE" }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <div id={id} className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-[#1A1A1A]">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ContinueButton({
  label,
  onClick,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "muted";
}) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    // Brief delay so the spinner is visible before the transition begins.
    // The button typically unmounts when its parent step closes, so loading
    // state cleanup happens via unmount; the timeout only matters if the
    // button stays mounted (e.g., the Step 3 "Preview as guest" CTA).
    setTimeout(() => {
      onClick();
      setLoading(false);
    }, 150);
  }

  const variantClasses =
    variant === "muted"
      ? "bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/35"
      : "bg-[#1A1A1A] hover:bg-[#2C2C2C]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`group mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-colors disabled:cursor-wait disabled:opacity-90 ${variantClasses}`}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.3"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {label}
      <svg
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
    </button>
  );
}

function CompletionLine({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-1.5 text-[#5C4F3D]"
      aria-live="polite"
    >
      {icon && <span className="completion-icon">{icon}</span>}
      <p className="completion-text text-[12px] italic">{children}</p>
    </div>
  );
}

// ─── Inline icons (heroicons-style outline) ──────────────────────────

function SparkleIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
      />
    </svg>
  );
}

// Friendly preset choices for the "what kind of wedding" picker. Order
// matters — most-common first for Filipino couples. Church (Catholic)
// dominates; Garden + Beach are the popular destination types around
// Tagaytay / Boracay / Palawan; Civil covers city-hall ceremonies for
// interfaith or non-religious couples; Hotel covers Manila Hotel /
// Peninsula / Shangri-La ballroom weddings.
const CEREMONY_PRESETS: { label: string; emoji: string }[] = [
  { label: "Church", emoji: "⛪" },
  { label: "Garden", emoji: "🌿" },
  { label: "Beach", emoji: "🌊" },
  { label: "Civil", emoji: "🏛️" },
  { label: "Hotel", emoji: "🏨" },
];

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
          : "border-[#E0D9CE] bg-white text-[#5C4F3D] hover:border-[#1A1A1A] hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
      }`}
    >
      {children}
    </button>
  );
}

function CeremonyTypeChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const isPreset = CEREMONY_PRESETS.some((p) => p.label === value);
  const [showCustom, setShowCustom] = useState(
    Boolean(value && !isPreset),
  );

  function selectPreset(label: string) {
    setShowCustom(false);
    onChange(value === label ? "" : label);
  }

  function toggleCustom() {
    if (showCustom) {
      setShowCustom(false);
      if (!isPreset) onChange("");
    } else {
      setShowCustom(true);
      if (isPreset) onChange("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CEREMONY_PRESETS.map((p) => {
          const active = value === p.label;
          return (
            <ChipButton
              key={p.label}
              active={active}
              onClick={() => selectPreset(p.label)}
            >
              <span aria-hidden>{p.emoji}</span>
              {p.label}
            </ChipButton>
          );
        })}
        <ChipButton active={showCustom} onClick={toggleCustom}>
          Other
        </ChipButton>
      </div>
      {showCustom && (
        <DebouncedInput
          autoFocus
          type="text"
          value={!isPreset ? value : ""}
          onCommit={onChange}
          placeholder="Civil, Buddhist, Hindu…"
          className={`${inputClass} mt-2`}
        />
      )}
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

export interface CtaConfig {
  label: string;
  onClick: () => void;
  /** Visual + tap-feedback variant. When true, the button uses muted
   *  styling and (if `note` is set) tap shows a brief inline message. */
  muted?: boolean;
  /** Inline note shown above the button for ~3s on tap. Only meaningful
   *  when `muted` is true. */
  note?: string;
}

interface EditPanelProps {
  /** When false, suppress the top chrome row (Saved + Share). Desktop opts
   *  out because those controls live in the preview toolbar instead;
   *  mobile keeps them since the preview toolbar is hidden there. */
  showHeaderChrome?: boolean;
  /** End-of-flow CTA at the bottom of Step 3. Differs by viewport — desktop
   *  opens the ReviewModal, mobile shows a muted "Publish" with a brief
   *  inline "coming soon" note. */
  cta?: CtaConfig;
}

export default function EditPanel({
  showHeaderChrome = true,
  cta,
}: EditPanelProps = {}) {
  const {
    data,
    update,
    setScrollTarget,
    editTarget,
    setEditTarget,
    setActiveSections,
  } = useWedding();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showCtaNote, setShowCtaNote] = useState(false);

  const [differentReception, setDifferentReception] = useState(
    Boolean(data.receptionVenue || data.receptionAddress),
  );

  // Which Step 3 section accordions are open. Owned here (not in
  // SectionManager) so click-to-edit can also expand a row.
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    () => new Set(),
  );

  function toggleSectionExpanded(id: SectionId) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // First-mount seed: pre-fill `data.tagline` with the active theme's dummy
  // tagline so the input shows the value the user sees in the preview.
  // We skip if it's already set (any string, including "") — empty string
  // means the user explicitly cleared it, which we honor.
  useEffect(() => {
    if (data.tagline !== undefined) return;
    const themeDummy = DUMMY_DATA[data.theme ?? "elegant"];
    if (themeDummy?.tagline) {
      update({ tagline: themeDummy.tagline });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Broadcast which preview sections correspond to whatever the user is
  // editing right now — Preview reads this to add an "active" highlight.
  useEffect(() => {
    const sections: string[] = [];
    if (currentStep && STEP_TO_SECTIONS[currentStep]) {
      sections.push(...STEP_TO_SECTIONS[currentStep]);
    }
    if (advancedOpen) {
      sections.push(...ADVANCED_SECTIONS);
    }
    setActiveSections(sections);
  }, [currentStep, advancedOpen, setActiveSections]);

  // Click-to-edit: a preview section was clicked. Open the right step,
  // scroll the form to the field, pulse it briefly, then clear the target.
  useEffect(() => {
    if (!editTarget) return;
    const stepKey = FIELD_TO_STEP[editTarget];
    if (!stepKey) {
      setEditTarget(null);
      return;
    }

    if (stepKey === "advanced") {
      setAdvancedOpen(true);
    } else {
      setCurrentStep(stepKey);
    }

    // If the field lives inside a Step-3 section accordion, ensure that
    // accordion is expanded before we try to scroll to its inner field.
    if (stepKey === 3) {
      const section = SECTION_FOR_FIELD[editTarget];
      if (section) {
        setExpandedSections((prev) =>
          prev.has(section) ? prev : new Set(prev).add(section),
        );
      }
    }

    // Two RAFs: first lets the step state commit, second runs after the
    // newly-rendered fields are in the DOM.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`field-${editTarget}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("field-highlight");
          window.setTimeout(() => {
            el.classList.remove("field-highlight");
          }, 1300);
        }
        setEditTarget(null);
      });
    });
  }, [editTarget, setEditTarget]);

  function scrollTo(field: string) {
    const section = FIELD_SECTION[field];
    if (section) setScrollTarget(section);
  }

  function goToStep(step: number) {
    setCurrentStep(step);
    const previewSection = STEP_TO_PREVIEW[step];
    if (previewSection) setScrollTarget(previewSection);
    // No scrollIntoView needed — only one step's panel renders at a time
    // (tab pattern), so the active panel is always already at the top.
  }

  const names = displayNames(data.name1, data.name2);

  // ── Step completion ────────────────────────────────────────────────
  // Step 1 — Basics: both names + date are required. Main photo and RSVP
  // toggle are optional and don't gate completion.
  const step1Complete = Boolean(data.name1 && data.name2 && data.date);

  // Step 2 — When and where: ceremony type + venue + address all required.
  // (Reception fields are still optional — couples without a separate
  // reception venue can complete Step 2 with just the ceremony.)
  const step2Complete = Boolean(
    data.ceremonyType && data.ceremonyVenue && data.ceremonyAddress,
  );

  // Step 3 — Make it personal: gates on publish state. Stays unchecked
  // until the user actually publishes (Phase 4 of ARCHITECTURE.md).
  // TODO: replace with `Boolean(data.publishedAt)` once publishing ships.
  const step3Complete = false;

  // Advanced unlocks once Step 2 has been touched (venue/address) OR a
  // click-to-edit targeted an Advanced field (advancedOpen forced true).
  const step2Started = Boolean(data.ceremonyVenue || data.ceremonyAddress);
  const showAdvanced = step2Started || advancedOpen;

  // ── Step 3 (Make it personal) — section manager wiring ────────────
  const activeSectionsForManager =
    data.userSections && data.userSections.length > 0
      ? data.userSections
      : getTheme(data.theme).sections;

  function handleSectionsChange(next: SectionId[]) {
    // Auto-expand any newly-added section so its editor reveals inline.
    const added = next.find((id) => !activeSectionsForManager.includes(id));
    if (added) {
      setExpandedSections((prev) => new Set(prev).add(added));
    }
    update({ userSections: next });
  }

  function renderEditorFor(id: SectionId): React.ReactNode {
    switch (id) {
      case "story":
        return (
          <>
            <FormField
              id="field-welcomeMessage"
              label="Welcome note"
              action={
                <AIGenerateButton
                  type="welcome"
                  names={names}
                  theme={data.theme}
                  input={data.welcomeMessage}
                  hasValue={Boolean(data.welcomeMessage)}
                  onGenerated={(text) => {
                    update({ welcomeMessage: text });
                    scrollTo("welcomeMessage");
                  }}
                />
              }
            >
              <DebouncedTextarea
                rows={3}
                value={data.welcomeMessage ?? ""}
                onCommit={(v) => update({ welcomeMessage: v })}
                onFocus={() => scrollTo("welcomeMessage")}
                placeholder="A warm message for your guests"
                className={textareaClass}
              />
            </FormField>
            <FormField
              id="field-story"
              label="Our love story"
              action={
                <AIGenerateButton
                  type="story"
                  names={names}
                  theme={data.theme}
                  input={data.story}
                  hasValue={Boolean(data.story)}
                  onGenerated={(text) => {
                    update({ story: text });
                    scrollTo("story");
                  }}
                />
              }
            >
              <DebouncedTextarea
                rows={5}
                value={data.story ?? ""}
                onCommit={(v) => update({ story: v })}
                onFocus={() => scrollTo("story")}
                placeholder="Share how you two met..."
                className={textareaClass}
              />
            </FormField>
          </>
        );
      case "timeline":
        return (
          <FormField id="field-timeline" label="Timeline">
            <TimelineEditor
              items={data.timeline ?? []}
              onChange={(items) => {
                update({ timeline: items });
                scrollTo("timeline");
              }}
            />
          </FormField>
        );
      case "dresscode":
        return (
          <FormField id="field-dressCode" label="Dress code">
            <select
              value={data.dressCode ?? ""}
              onChange={(e) => {
                update({ dressCode: e.target.value });
                scrollTo("dressCode");
              }}
              className={selectClass}
            >
              <option value="">None</option>
              <option value="Black tie">Black tie</option>
              <option value="Semi-formal">Semi-formal</option>
              <option value="Cocktail">Cocktail</option>
              <option value="Casual">Casual</option>
            </select>
          </FormField>
        );
      case "countdown":
        return (
          <ToggleRow
            id="field-countdownEnabled"
            label="Show countdown"
            checked={data.countdownEnabled ?? false}
            onChange={(v) => {
              update({ countdownEnabled: v });
              scrollTo("countdownEnabled");
            }}
          />
        );
      case "closing":
        return (
          <>
            <div id="field-closingImage">
              <ImageUpload
                label="Ending photo"
                description="The closing photo at the bottom of your site."
                value={data.closingImage}
                onChange={(url) => {
                  update({ closingImage: url });
                  scrollTo("noteToGuests");
                }}
              />
            </div>
            <FormField
              id="field-noteToGuests"
              label="A note to your guests"
              action={
                <AIGenerateButton
                  type="note"
                  names={names}
                  theme={data.theme}
                  input={data.noteToGuests}
                  hasValue={Boolean(data.noteToGuests)}
                  onGenerated={(text) => {
                    update({ noteToGuests: text });
                    scrollTo("noteToGuests");
                  }}
                />
              }
            >
              <DebouncedTextarea
                rows={3}
                value={data.noteToGuests ?? ""}
                onCommit={(v) => update({ noteToGuests: v })}
                onFocus={() => scrollTo("noteToGuests")}
                placeholder="A special message from your heart"
                className={textareaClass}
              />
            </FormField>
          </>
        );
      case "gallery":
        return (
          <FormField id="field-galleryImages" label="Gallery">
            <GalleryEditor
              images={data.galleryImages ?? []}
              onChange={(next) => update({ galleryImages: next })}
            />
          </FormField>
        );
      case "travel":
        return (
          <FormField id="field-travelInfo" label="How to get here">
            <DebouncedTextarea
              rows={4}
              value={data.travelInfo ?? ""}
              onCommit={(v) => update({ travelInfo: v })}
              onFocus={() => scrollTo("travelInfo")}
              placeholder="Hotels, airports, parking…"
              className={textareaClass}
            />
          </FormField>
        );
      case "registry":
        return (
          <FormField id="field-registryLinks" label="Registry links">
            <RegistryEditor
              links={data.registryLinks ?? []}
              onChange={(next) => update({ registryLinks: next })}
            />
          </FormField>
        );
      case "faq":
        return (
          <FormField id="field-faqItems" label="FAQ">
            <FaqEditor
              items={data.faqItems ?? []}
              onChange={(next) => update({ faqItems: next })}
            />
          </FormField>
        );
      case "weddingParty":
        return (
          <FormField id="field-weddingParty" label="Wedding party">
            <PartyEditor
              members={data.weddingParty ?? []}
              onChange={(next) => update({ weddingParty: next })}
            />
          </FormField>
        );
      case "map":
        return (
          <FormField id="field-mapAddress" label="Where it is">
            <DebouncedTextarea
              rows={3}
              value={data.mapAddress ?? ""}
              onCommit={(v) => update({ mapAddress: v })}
              onFocus={() => scrollTo("mapAddress")}
              placeholder="Venue name&#10;Street address&#10;City, Country"
              className={textareaClass}
            />
          </FormField>
        );
      case "hashtag":
        return (
          <>
            <FormField id="field-hashtag" label="Your wedding hashtag">
              <DebouncedInput
                type="text"
                value={data.hashtag ?? ""}
                onCommit={(v) => update({ hashtag: v })}
                onFocus={() => scrollTo("hashtag")}
                placeholder="#OliviaAndHenry2026"
                className={inputClass}
              />
            </FormField>
            <FormField id="field-musicEmbed" label="Spotify or Apple Music link">
              <DebouncedInput
                type="url"
                value={data.musicEmbed ?? ""}
                onCommit={(v) => update({ musicEmbed: v })}
                onFocus={() => scrollTo("musicEmbed")}
                placeholder="https://open.spotify.com/playlist/…"
                className={inputClass}
              />
            </FormField>
          </>
        );
      case "saveTheDate":
        return (
          <FormField
            id="field-saveTheDateMessage"
            label="Save-the-date note"
          >
            <DebouncedTextarea
              rows={3}
              value={data.saveTheDateMessage ?? ""}
              onCommit={(v) => update({ saveTheDateMessage: v })}
              onFocus={() => scrollTo("saveTheDateMessage")}
              placeholder="Mark your calendars — invitation on its way."
              className={textareaClass}
            />
          </FormField>
        );
      // Hero / Details / RSVP have no Step-3 editor — they're managed in
      // Steps 1 and 2. Returning null marks the row non-expandable.
      default:
        return null;
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#FDFBF7]">
      {/* Slim chrome — autosave indicator + share-draft link. Sits above the
          scroll container so it stays visible regardless of how far down the
          user has scrolled. Desktop hides this (showHeaderChrome=false)
          because the same controls live in the preview toolbar. */}
      {showHeaderChrome && (
        <div className="flex items-center justify-end gap-3 border-b border-[#EDE8E0] bg-[#FDFBF7] px-5 py-2">
          <LastSaved />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Sticky step progress — always visible while scrolling the form. */}
        <div className="sticky top-0 z-10 border-b border-[#EDE8E0] bg-[#FDFBF7] px-5 pt-5 pb-3">
          <StepProgress
            activeStep={currentStep}
            onStepClick={goToStep}
            steps={[
              { label: "About you", complete: step1Complete },
              { label: "The day", complete: step2Complete },
              { label: "Personal touches", complete: step3Complete },
            ]}
          />
        </div>

        <div key={currentStep} className="tab-fade-in px-5 pt-5 pb-6">

        {/* ── Step 1 ─────────────────────────────────────── */}
        {currentStep === 1 && (
        <FormSection
          id="step-1"
          title="The basics"
          description="We'll start here. Everything else is optional."
          alwaysOpen
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="field-name1" label="Your name">
              <DebouncedInput
                type="text"
                value={data.name1 ?? ""}
                onCommit={(v) => update({ name1: v })}
                onFocus={() => scrollTo("name1")}
                placeholder="Olivia"
                className={inputClass}
              />
            </FormField>
            <FormField id="field-name2" label="Your partner's name">
              <DebouncedInput
                type="text"
                value={data.name2 ?? ""}
                onCommit={(v) => update({ name2: v })}
                onFocus={() => scrollTo("name2")}
                placeholder="Henry"
                className={inputClass}
              />
            </FormField>
          </div>

          <div id="field-date">
            <DatePicker
              ariaLabel="Wedding date"
              value={data.date ?? ""}
              onChange={(v) => update({ date: v })}
              onFocus={() => scrollTo("date")}
            />
          </div>

          <div id="field-heroImage">
            <ImageUpload
              label="Main photo"
              description="The big one at the top of your site."
              value={data.heroImage}
              onChange={(url) => {
                update({ heroImage: url });
                scrollTo("name1");
              }}
            />
          </div>

          <FormField
            id="field-tagline"
            label="A few words about you two"
            action={
              <AIGenerateButton
                type="tagline"
                names={names}
                theme={data.theme}
                input={data.tagline}
                hasValue={Boolean(data.tagline)}
                onGenerated={(text) => {
                  update({ tagline: text });
                  scrollTo("tagline");
                }}
              />
            }
          >
            <DebouncedInput
              type="text"
              value={data.tagline ?? ""}
              onCommit={(v) => update({ tagline: v })}
              onFocus={() => scrollTo("tagline")}
              placeholder="A celebration of love"
              className={inputClass}
            />
          </FormField>

          <div className="rounded-lg border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2.5 space-y-1.5">
            <ToggleRow
              id="field-rsvpEnabled"
              label="Let guests RSVP through the site"
              checked={data.rsvpEnabled ?? false}
              onChange={(v) => {
                update({ rsvpEnabled: v });
                scrollTo("rsvpEnabled");
              }}
            />
            <p className="text-[11px] italic text-gray-500">
              Fill in the details whenever you&rsquo;re ready.
            </p>
          </div>

          {step1Complete && (
            <CompletionLine icon={<SparkleIcon />}>
              Your wedding is taking shape
            </CompletionLine>
          )}

          <ContinueButton
            label="Continue to the day"
            onClick={() => goToStep(2)}
          />
        </FormSection>
        )}

        {/* ── Step 2: When and where ────────────────────────────── */}
        {currentStep === 2 && (
        <FormSection
          id="step-2"
          title="When and where"
          description="Where it happens, and when. Your guests will see this."
          alwaysOpen
        >
          <FormField
            id="field-ceremonyType"
            label="What kind of wedding are you having?"
          >
            <CeremonyTypeChips
              value={data.ceremonyType ?? ""}
              onChange={(v) => {
                update({ ceremonyType: v });
                scrollTo("ceremonyType");
              }}
            />
          </FormField>

          <FormField id="field-ceremonyVenue" label="Ceremony venue">
            <DebouncedInput
              type="text"
              value={data.ceremonyVenue ?? ""}
              onCommit={(v) => update({ ceremonyVenue: v })}
              onFocus={() => scrollTo("ceremonyVenue")}
              placeholder="Venue name"
              className={inputClass}
            />
          </FormField>

          <FormField id="field-ceremonyAddress" label="Ceremony address">
            <DebouncedTextarea
              rows={3}
              value={data.ceremonyAddress ?? ""}
              onCommit={(v) => update({ ceremonyAddress: v })}
              onFocus={() => scrollTo("ceremonyAddress")}
              placeholder="Antonio's Tagaytay&#10;4150 Aguinaldo Highway&#10;Tagaytay City, Cavite"
              className={textareaClass}
            />
          </FormField>

          <FormField id="field-ceremonyTime" label="Ceremony time">
            <TimePicker
              value={data.ceremonyTime}
              onChange={(v) => update({ ceremonyTime: v })}
              onFocus={() => scrollTo("ceremonyTime")}
            />
          </FormField>

          <ToggleRow
            label="Reception is at a different venue"
            checked={differentReception}
            onChange={(v) => {
              setDifferentReception(v);
              if (!v) update({ receptionVenue: "", receptionAddress: "" });
            }}
          />

          {differentReception && (
            <>
              <FormField id="field-receptionVenue" label="Reception venue">
                <DebouncedInput
                  type="text"
                  value={data.receptionVenue ?? ""}
                  onCommit={(v) => update({ receptionVenue: v })}
                  onFocus={() => scrollTo("receptionVenue")}
                  placeholder="Venue name"
                  className={inputClass}
                />
              </FormField>

              <FormField id="field-receptionAddress" label="Reception address">
                <DebouncedTextarea
                  rows={3}
                  value={data.receptionAddress ?? ""}
                  onCommit={(v) => update({ receptionAddress: v })}
                  onFocus={() => scrollTo("receptionAddress")}
                  placeholder="The Peninsula Manila&#10;Corner of Ayala &amp; Makati Ave&#10;Makati City"
                  className={textareaClass}
                />
              </FormField>

              <FormField id="field-receptionTime" label="Reception time">
                <TimePicker
                  value={data.receptionTime}
                  onChange={(v) => update({ receptionTime: v })}
                  onFocus={() => scrollTo("receptionTime")}
                />
              </FormField>
            </>
          )}

          {step2Complete && (
            <CompletionLine icon={<MapPinIcon />}>
              Venue locked in
            </CompletionLine>
          )}

          <ContinueButton
            label="Continue to personal touches"
            onClick={() => goToStep(3)}
          />
        </FormSection>
        )}

        {/* ── Step 3: Make it more personal (optional) ────────────── */}
        {currentStep === 3 && (
        <FormSection
          id="step-3"
          title="Make it more personal"
          description="Add anything else that makes the site yours."
          alwaysOpen
        >
          <SectionManager
            activeSections={activeSectionsForManager}
            onChange={handleSectionsChange}
            editorFor={renderEditorFor}
            expandedSections={expandedSections}
            onToggleExpanded={toggleSectionExpanded}
          />

          {cta && (
            <div className="space-y-2">
              {cta.muted && cta.note && showCtaNote && (
                <p className="text-[12px] italic text-[#A09580]">
                  {cta.note}
                </p>
              )}
              <ContinueButton
                label={cta.label}
                variant={cta.muted ? "muted" : "primary"}
                onClick={() => {
                  if (cta.muted && cta.note) {
                    setShowCtaNote(true);
                    setTimeout(() => setShowCtaNote(false), 3000);
                  }
                  cta.onClick();
                }}
              />
            </div>
          )}
        </FormSection>
        )}

        {/* ── Advanced ─ visible once Step 2 has been touched OR a click-to-
            edit targeted an Advanced field (advancedOpen forced true).
            Renders below whichever step's tab is currently active. */}
        {showAdvanced && (
          <FormSection
            title="Advanced"
            description="Custom colors and logo image."
            open={advancedOpen}
            onToggle={(next) => setAdvancedOpen(next)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField id="field-colors.primary" label="Primary color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.colors?.primary ?? "#C4917B"}
                    onChange={(e) => {
                      update({
                        colors: {
                          primary: e.target.value,
                          accent: data.colors?.accent ?? e.target.value,
                        },
                      });
                      scrollTo("colors.primary");
                    }}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-[#E0D9CE] p-0 appearance-none"
                  />
                  <DebouncedInput
                    type="text"
                    value={data.colors?.primary ?? ""}
                    onCommit={(v) =>
                      update({
                        colors: {
                          primary: v,
                          accent: data.colors?.accent ?? "",
                        },
                      })
                    }
                    onFocus={() => scrollTo("colors.primary")}
                    placeholder="#C4917B"
                    className={`${inputClass} flex-1`}
                  />
                </div>
              </FormField>

              <FormField id="field-colors.accent" label="Accent color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.colors?.accent ?? "#D4A995"}
                    onChange={(e) => {
                      update({
                        colors: {
                          primary: data.colors?.primary ?? e.target.value,
                          accent: e.target.value,
                        },
                      });
                      scrollTo("colors.accent");
                    }}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-[#E0D9CE] p-0 appearance-none"
                  />
                  <DebouncedInput
                    type="text"
                    value={data.colors?.accent ?? ""}
                    onCommit={(v) =>
                      update({
                        colors: {
                          primary: data.colors?.primary ?? "",
                          accent: v,
                        },
                      })
                    }
                    onFocus={() => scrollTo("colors.accent")}
                    placeholder="#D4A995"
                    className={`${inputClass} flex-1`}
                  />
                </div>
              </FormField>
            </div>

            <div id="field-logoImage">
              <ImageUpload
                label="Logo / monogram"
                value={data.logoImage}
                onChange={(url) => {
                  update({ logoImage: url });
                  scrollTo("name1");
                }}
              />
            </div>
          </FormSection>
        )}
        </div>
      </div>
    </div>
  );
}
