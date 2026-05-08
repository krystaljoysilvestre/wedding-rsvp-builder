"use client";

import { useEffect, useMemo, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { displayNames } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import FormSection from "./FormSection";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import { DebouncedInput, DebouncedTextarea } from "./DebouncedField";
import TimelineEditor from "./TimelineEditor";
import StoryTimelineEditor from "./StoryTimelineEditor";
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
  welcomeMessage: "section-welcome",
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
  // Step 3 — Customize: theme palette + logo (Advanced) + optional sections.
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
  welcomeMessage: "welcome",
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
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "muted";
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading || disabled) return;
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

  const effectivelyMuted = disabled || variant === "muted";
  const variantClasses = effectivelyMuted
    ? "bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/35"
    : "bg-[#1A1A1A] hover:bg-[#2C2C2C]";
  const disabledClasses = disabled
    ? "cursor-not-allowed opacity-70"
    : "disabled:cursor-wait disabled:opacity-90";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-disabled={disabled || undefined}
      className={`group mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-colors ${disabledClasses} ${variantClasses}`}
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

// ─── Inline icons (heroicons-style outline) ──────────────────────────

// Ceremony-type icons. Stroke 1.5, currentColor, h-3.5 w-3.5 to sit
// neatly inside chip buttons. Hand-drawn rather than emoji so the chips
// match the warm minimal aesthetic instead of OS-rendered glyphs.

function CeremonyChipIcon({
  accent,
  children,
}: {
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke={accent ?? "currentColor"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ChurchIcon({ active }: { active?: boolean }) {
  return (
    <CeremonyChipIcon accent={active ? undefined : "#C4917B"}>
      {/* cross on top */}
      <path d="M12 3v4" />
      <path d="M10 5h4" />
      {/* peaked roof + body */}
      <path d="M5 21V12l7-4 7 4v9" />
      {/* door */}
      <path d="M11 21v-4a1 1 0 012 0v4" />
      <path d="M3 21h18" />
    </CeremonyChipIcon>
  );
}

function LeafIcon({ active }: { active?: boolean }) {
  return (
    <CeremonyChipIcon accent={active ? undefined : "#88A688"}>
      <path d="M20 4c-9 0-15 5-15 13a4 4 0 004 4c8 0 13-6 13-15 0-1-1-2-2-2z" />
      <path d="M5 21c0-7 5-12 12-13" />
    </CeremonyChipIcon>
  );
}

function WaveIcon({ active }: { active?: boolean }) {
  return (
    <CeremonyChipIcon accent={active ? undefined : "#8FA8B8"}>
      <path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </CeremonyChipIcon>
  );
}

function ColumnIcon({ active }: { active?: boolean }) {
  return (
    <CeremonyChipIcon accent={active ? undefined : "#B89070"}>
      {/* pediment */}
      <path d="M4 9l8-5 8 5" />
      {/* lintel */}
      <path d="M4 9h16" />
      {/* columns */}
      <path d="M7 9v10" />
      <path d="M12 9v10" />
      <path d="M17 9v10" />
      {/* base */}
      <path d="M3 21h18" />
    </CeremonyChipIcon>
  );
}

function BuildingIcon({ active }: { active?: boolean }) {
  return (
    <CeremonyChipIcon accent={active ? undefined : "#9C8AA8"}>
      {/* outer building */}
      <path d="M5 21V5a1 1 0 011-1h12a1 1 0 011 1v16" />
      <path d="M3 21h18" />
      {/* windows: 3 rows × 2 cols */}
      <path d="M9 8h1.5" />
      <path d="M13.5 8h1.5" />
      <path d="M9 12h1.5" />
      <path d="M13.5 12h1.5" />
      {/* door */}
      <path d="M10 21v-4a2 2 0 014 0v4" />
    </CeremonyChipIcon>
  );
}

// Friendly preset choices for the "what kind of wedding" picker. Order
// matters — most-common first for Filipino couples. Church (Catholic)
// dominates; Garden + Beach are the popular destination types around
// Tagaytay / Boracay / Palawan; Civil covers city-hall ceremonies for
// interfaith or non-religious couples; Hotel covers Manila Hotel /
// Peninsula / Shangri-La ballroom weddings.
const CEREMONY_PRESETS: {
  label: string;
  Icon: (props: { active?: boolean }) => React.ReactElement;
}[] = [
  { label: "Church", Icon: ChurchIcon },
  { label: "Garden", Icon: LeafIcon },
  { label: "Beach", Icon: WaveIcon },
  { label: "Civil", Icon: ColumnIcon },
  { label: "Hotel", Icon: BuildingIcon },
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
          const Icon = p.Icon;
          return (
            <ChipButton
              key={p.label}
              active={active}
              onClick={() => selectPreset(p.label)}
            >
              <Icon active={active} />
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
      setCurrentStep(3);
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

  // Step 3 — Customize: gates on publish state. Stays unchecked
  // until the user actually publishes (Phase 4 of ARCHITECTURE.md).
  // TODO: replace with `Boolean(data.publishedAt)` once publishing ships.
  const step3Complete = false;

  // Step 2 is locked until names + date are filled. Same pattern as
  // step3Locked — chip + Continue button respect the lock; click-to-edit on
  // a Step-2 preview section deliberately bypasses (the in-panel banner
  // "Add your names and date in About you" does the teaching).
  const step2Locked = !step1Complete;

  // Step 3 is locked until 1 + 2 are filled. Same gate as Phase 4 publishing
  // (ARCHITECTURE.md): a wedding site without names/date/venue isn't usable,
  // and the Customize step has nothing meaningful to anchor to. The chip +
  // Continue → 3 button respect this; click-to-edit on a Step-3 preview
  // section deliberately bypasses (the in-panel banner does the teaching
  // when they land).
  const step3Locked = !step1Complete || !step2Complete;

  // ── Step 3 (Customize) — section manager wiring ────────────────────
  const activeSectionsForManager =
    data.userSections && data.userSections.length > 0
      ? data.userSections
      : getTheme(data.theme).sections;

  // Sections that can't be removed from the manager (still draggable).
  // Details + Story (which renders the Welcome note) are essentials; RSVP
  // is locked only when the user has the RSVP toggle enabled in Step 1 —
  // turning the toggle off frees them to remove it again.
  const lockedManagerSections = useMemo<ReadonlySet<SectionId>>(() => {
    const s = new Set<SectionId>(["details", "welcome"]);
    if (data.rsvpEnabled) s.add("rsvp");
    return s;
  }, [data.rsvpEnabled]);

  function handleSectionsChange(next: SectionId[]) {
    // Auto-expand any newly-added section so its editor reveals inline,
    // and scroll the preview to the new section so the bride can see what
    // just landed without hunting for it.
    const added = next.find((id) => !activeSectionsForManager.includes(id));
    if (added) {
      setExpandedSections((prev) => new Set(prev).add(added));
      setScrollTarget(`section-${added}`);
    }
    update({ userSections: next });
  }

  function renderEditorFor(id: SectionId): React.ReactNode {
    return renderInnerEditorFor(id);
  }

  function renderInnerEditorFor(id: SectionId): React.ReactNode {
    switch (id) {
      case "welcome":
        return (
          <FormField id="field-welcomeMessage" label="Welcome note">
            <AIGenerateButton
              type="welcome"
              names={names}
              theme={data.theme}
              input={data.welcomeMessage}
              hasValue={Boolean(data.welcomeMessage)}
              multiline
              onGenerated={(text) => {
                update({ welcomeMessage: text });
                scrollTo("welcomeMessage");
              }}
            >
              <DebouncedTextarea
                rows={3}
                value={data.welcomeMessage ?? ""}
                onCommit={(v) => update({ welcomeMessage: v })}
                onFocus={() => scrollTo("welcomeMessage")}
                placeholder="A warm message for your guests"
                className={`${textareaClass} pr-10`}
              />
            </AIGenerateButton>
          </FormField>
        );
      case "story": {
        const storyFormat = getTheme(data.theme).storyFormat ?? "prose";
        if (storyFormat === "timeline") {
          return (
            <FormField id="field-story" label="Your story timeline">
              <StoryTimelineEditor
                items={data.storyTimeline ?? []}
                onChange={(items) => {
                  update({ storyTimeline: items });
                  scrollTo("story");
                }}
              />
            </FormField>
          );
        }
        return (
          <FormField id="field-story" label="Our love story">
            <AIGenerateButton
              type="story"
              names={names}
              theme={data.theme}
              input={data.story}
              hasValue={Boolean(data.story)}
              multiline
              onGenerated={(text) => {
                update({ story: text });
                scrollTo("story");
              }}
            >
              <DebouncedTextarea
                rows={5}
                value={data.story ?? ""}
                onCommit={(v) => update({ story: v })}
                onFocus={() => scrollTo("story")}
                placeholder="Share how you two met..."
                className={`${textareaClass} pr-10`}
              />
            </AIGenerateButton>
          </FormField>
        );
      }
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
                orientationHint={getTheme(data.theme).heroOrientation ?? "landscape"}
                value={data.closingImage}
                onChange={(url) => {
                  update({ closingImage: url });
                  scrollTo("noteToGuests");
                }}
              />
            </div>
            <FormField id="field-noteToGuests" label="A note to your guests">
              <AIGenerateButton
                type="note"
                names={names}
                theme={data.theme}
                input={data.noteToGuests}
                hasValue={Boolean(data.noteToGuests)}
                multiline
                onGenerated={(text) => {
                  update({ noteToGuests: text });
                  scrollTo("noteToGuests");
                }}
              >
                <DebouncedTextarea
                  rows={3}
                  value={data.noteToGuests ?? ""}
                  onCommit={(v) => update({ noteToGuests: v })}
                  onFocus={() => scrollTo("noteToGuests")}
                  placeholder="A special message from your heart"
                  className={`${textareaClass} pr-10`}
                />
              </AIGenerateButton>
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
                placeholder="#AndreaAndMiguel2026"
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
              {
                label: "The day",
                complete: step2Complete,
                disabled: step2Locked,
              },
              {
                label: "Customize",
                complete: step3Complete,
                disabled: step3Locked,
              },
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
            <FormField id="field-name1" label="Your name" required>
              <DebouncedInput
                type="text"
                value={data.name1 ?? ""}
                onCommit={(v) => update({ name1: v })}
                onFocus={() => scrollTo("name1")}
                placeholder="Andrea"
                className={inputClass}
              />
            </FormField>
            <FormField id="field-name2" label="Your partner's name" required>
              <DebouncedInput
                type="text"
                value={data.name2 ?? ""}
                onCommit={(v) => update({ name2: v })}
                onFocus={() => scrollTo("name2")}
                placeholder="Miguel"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField id="field-date" label="Wedding date" required>
            <DatePicker
              ariaLabel="Wedding date"
              value={data.date ?? ""}
              onChange={(v) => update({ date: v })}
              onFocus={() => scrollTo("date")}
            />
          </FormField>

          <div id="field-heroImage">
            <ImageUpload
              label="Main photo"
              description="The big one at the top of your site."
              orientationHint={getTheme(data.theme).heroOrientation ?? "landscape"}
              value={data.heroImage}
              onChange={(url) => {
                update({ heroImage: url });
                scrollTo("name1");
              }}
            />
          </div>

          <FormField
            id="field-tagline"
            label="Your wedding tagline"
            helper="A short line at the top of your site. Optional."
          >
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
            >
              <DebouncedInput
                type="text"
                value={data.tagline ?? ""}
                onCommit={(v) => update({ tagline: v })}
                onFocus={() => scrollTo("tagline")}
                placeholder="A celebration of love"
                className={`${inputClass} pr-10`}
              />
            </AIGenerateButton>
          </FormField>

          <div className="rounded-lg border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2.5 space-y-1.5">
            <ToggleRow
              id="field-rsvpEnabled"
              label="Let guests RSVP through the site"
              checked={data.rsvpEnabled ?? false}
              onChange={(v) => {
                // Two layers gate the RSVP preview section: presence in the
                // active list AND rsvpEnabled. The Step 1 toggle is the
                // single source of truth — it adds and removes the section
                // from the active list to keep both layers in sync.
                if (v && !activeSectionsForManager.includes("rsvp")) {
                  update({
                    rsvpEnabled: true,
                    userSections: [...activeSectionsForManager, "rsvp"],
                  });
                } else if (
                  !v &&
                  activeSectionsForManager.includes("rsvp")
                ) {
                  update({
                    rsvpEnabled: false,
                    userSections: activeSectionsForManager.filter(
                      (id) => id !== "rsvp",
                    ),
                  });
                } else {
                  update({ rsvpEnabled: v });
                }
                scrollTo("rsvpEnabled");
              }}
            />
            <p className="text-[11px] italic text-gray-500">
              Guests can confirm attendance directly on your site.
            </p>
          </div>

          <ContinueButton
            label="Next: The day"
            onClick={() => goToStep(2)}
            variant={step2Locked ? "muted" : "primary"}
            disabled={step2Locked}
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
          {!step1Complete && (
            <div className="rounded-md border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2 text-[12px] leading-relaxed text-[#5C4F3D]">
              Add your names and date in{" "}
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="underline decoration-[#B8A48E] underline-offset-2 hover:text-[#1A1A1A]"
              >
                About you
              </button>{" "}
              so this page can show your real wedding.
            </div>
          )}

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

          <ContinueButton
            label="Next: Customize"
            onClick={() => goToStep(3)}
            variant={step3Locked ? "muted" : "primary"}
            disabled={step3Locked}
          />
        </FormSection>
        )}

        {/* ── Step 3 — Theme & branding (was "Advanced") ───────────────
            Now rendered first since theme palette + logo are the primary
            customization. Hidden while step 3 is locked so the lock banner
            below can do the teaching without competing chrome. */}
        {currentStep === 3 && !step3Locked && (
          <FormSection
            title="Theme & branding"
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

        {/* ── Step 3: Customize sections + Review/Publish CTA. When step 3
            is locked the Theme & branding panel above is hidden; this
            panel still renders so the lock banner can do the teaching. */}
        {currentStep === 3 && (
          <FormSection
            id="step-3"
            title="Customize"
            description="Add the optional sections that make this site yours."
            alwaysOpen
          >
            {step3Locked && (
              <div className="rounded-md border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2 text-[12px] leading-relaxed text-[#5C4F3D]">
                {!step1Complete ? (
                  <>
                    Customizing comes next — first add your names and date in{" "}
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="underline decoration-[#B8A48E] underline-offset-2 hover:text-[#1A1A1A]"
                    >
                      About you
                    </button>
                    .
                  </>
                ) : (
                  <>
                    Almost there — lock in your venue in{" "}
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="underline decoration-[#B8A48E] underline-offset-2 hover:text-[#1A1A1A]"
                    >
                      The day
                    </button>{" "}
                    first.
                  </>
                )}
              </div>
            )}

            <SectionManager
              activeSections={activeSectionsForManager}
              onChange={handleSectionsChange}
              editorFor={renderEditorFor}
              expandedSections={expandedSections}
              onToggleExpanded={toggleSectionExpanded}
              lockedSections={lockedManagerSections}
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
        </div>
      </div>
    </div>
  );
}
