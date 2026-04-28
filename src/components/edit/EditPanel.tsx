"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { displayNames } from "@/lib/types";
import { getTheme, THEME_PALETTES } from "@/lib/themes";
import FormSection from "./FormSection";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import { DebouncedInput, DebouncedTextarea } from "./DebouncedField";
import TimelineEditor from "./TimelineEditor";
import ImageUpload from "./ImageUpload";
import AIGenerateButton from "./AIGenerateButton";
import StepProgress from "./StepProgress";
import TemplatePicker from "./TemplatePicker";
import DatePicker from "./DatePicker";
import SectionManager from "./SectionManager";
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
  2: "section-rsvp",
  3: "section-details",
  4: "section-hero", // step 4 is enhancement — show the whole flow from the top
};

// Reverse: when a step is open in the editor, which preview sections
// represent what the user is currently editing. Steps 1-3 each map to a
// single canonical section now (essentials only). Step 4 is enhancement
// and doesn't claim any single section as "active."
const STEP_TO_SECTIONS: Record<number, string[]> = {
  1: ["section-hero"],
  2: ["section-rsvp"],
  3: ["section-details"],
};
const ADVANCED_SECTIONS = ["section-closing"];

// Inverse direction of FIELD_SECTION: when a preview section is clicked,
// the editor needs to know which step to open. "advanced" means the
// Advanced section (independent of currentStep 1/2/3/4).
type StepKey = 1 | 2 | 3 | 4 | "advanced";
const FIELD_TO_STEP: Record<string, StepKey> = {
  // Step 1 — Basics: names, date, hero image, tagline
  name1: 1,
  name2: 1,
  date: 1,
  heroImage: 1,
  tagline: 1,
  // Step 2 — Guests & RSVP
  rsvpEnabled: 2,
  // Step 3 — Details: ceremony type, venue, address, time, reception
  ceremonyType: 3,
  ceremonyVenue: 3,
  ceremonyAddress: 3,
  ceremonyTime: 3,
  receptionVenue: 3,
  receptionAddress: 3,
  receptionTime: 3,
  // Step 4 — Optional enhancements: story, welcome, logistics extras,
  // plus the 8 optional section editors.
  welcomeMessage: 4,
  story: 4,
  timeline: 4,
  dressCode: 4,
  countdownEnabled: 4,
  noteToGuests: 4,
  closingImage: 4,
  galleryImages: 4,
  travelInfo: 4,
  registryLinks: 4,
  faqItems: 4,
  weddingParty: 4,
  mapAddress: 4,
  hashtag: 4,
  musicEmbed: 4,
  saveTheDateMessage: 4,
  // Advanced — pure visual overrides
  "colors.primary": "advanced",
  "colors.accent": "advanced",
  logoImage: "advanced",
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
}: {
  label: string;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    // Brief delay so the spinner is visible before the transition begins.
    // The button typically unmounts when its parent step closes, so loading
    // state cleanup happens via unmount; the timeout only matters if the
    // button stays mounted (e.g., Review & Publish).
    setTimeout(() => {
      onClick();
      setLoading(false);
    }, 150);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="group mt-2 inline-flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2C2C2C] disabled:cursor-wait disabled:opacity-90"
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
      {icon}
      <p className="text-[12px] italic">{children}</p>
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

function EnvelopeIcon() {
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
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
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

export default function EditPanel() {
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
  const [pickerOpen, setPickerOpen] = useState(false);

  const [differentReception, setDifferentReception] = useState(
    Boolean(data.receptionVenue || data.receptionAddress),
  );

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
    requestAnimationFrame(() => {
      document
        .getElementById(`step-${step}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleStep(step: number) {
    if (currentStep === step) {
      setCurrentStep(0);
    } else {
      goToStep(step);
    }
  }

  function goToReview() {
    setCurrentStep(0);
    setScrollTarget("section-hero");
  }

  const names = displayNames(data.name1, data.name2);
  const themeLabel = getTheme(data.theme).label;

  // ── Step completion ────────────────────────────────────────────────
  // Step 1 — Basics: names + date are required; hero image is optional.
  const step1Complete = Boolean(data.name1 && data.name2 && data.date);
  // Step 2 — Guests & RSVP: complete when the toggle is on.
  const step2Complete = Boolean(data.rsvpEnabled);
  // Step 3 — Details: venue + address.
  const step3Complete = Boolean(data.ceremonyVenue && data.ceremonyAddress);

  // Advanced unlocks once Step 3 has been touched (venue/address) OR a
  // click-to-edit targeted an Advanced field (advancedOpen forced true).
  const step3Started = Boolean(data.ceremonyVenue || data.ceremonyAddress);
  const showAdvanced = step3Started || advancedOpen;

  return (
    <div className="flex h-full flex-col bg-[#FDFBF7]">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <StepProgress
          activeStep={currentStep}
          onStepClick={goToStep}
          steps={[
            { label: "Basics", complete: step1Complete },
            { label: "Guests", complete: step2Complete },
            { label: "Details", complete: step3Complete },
          ]}
        />

        {/* ── Step 1 ─────────────────────────────────────── */}
        <FormSection
          id="step-1"
          title="Step 1: Start Your Wedding"
          description="Let's begin with the essentials."
          open={currentStep === 1}
          onToggle={() => toggleStep(1)}
        >
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2.5">
            <span className="text-[12px] text-[#5C4F3D]">
              Change style:{" "}
              <span className="font-medium text-[#1A1A1A]">{themeLabel}</span>
            </span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-[12px] font-medium text-[#5C4F3D] underline decoration-transparent underline-offset-2 transition-all hover:text-[#1A1A1A] hover:decoration-[#1A1A1A]"
            >
              Change
            </button>
          </div>

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
            <FormField id="field-name2" label="Partner's name">
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
              label="Hero image"
              value={data.heroImage}
              onChange={(url) => {
                update({ heroImage: url });
                scrollTo("name1");
              }}
            />
          </div>

          <FormField
            id="field-tagline"
            label="Tagline"
            action={
              <AIGenerateButton
                type="tagline"
                names={names}
                theme={data.theme}
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

          {step1Complete && (
            <CompletionLine icon={<SparkleIcon />}>
              Your wedding is taking shape
            </CompletionLine>
          )}

          <ContinueButton
            label="Continue to Guests & RSVP"
            onClick={() => goToStep(2)}
          />
        </FormSection>

        {/* ── Step 2: Guests & RSVP ─────────────────────────── */}
        <FormSection
          id="step-2"
          title="Step 2: Guests & RSVP"
          description="Let guests confirm they're coming."
          open={currentStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <ToggleRow
            id="field-rsvpEnabled"
            label="Show an RSVP form on the site"
            checked={data.rsvpEnabled ?? false}
            onChange={(v) => {
              update({ rsvpEnabled: v });
              scrollTo("rsvpEnabled");
            }}
          />

          <p className="text-[12px] italic text-gray-500">
            Guests will see a simple RSVP form. You can customize the
            wording later.
          </p>

          {step2Complete && (
            <CompletionLine icon={<EnvelopeIcon />}>
              Guests can RSVP
            </CompletionLine>
          )}

          <ContinueButton
            label="Continue to Details"
            onClick={() => goToStep(3)}
          />
        </FormSection>

        {/* ── Step 3: Details ────────────────────────────── */}
        <FormSection
          id="step-3"
          title="Step 3: Details"
          description="Where the ceremony happens."
          open={currentStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <FormField id="field-ceremonyType" label="Ceremony type">
            <select
              value={data.ceremonyType ?? ""}
              onChange={(e) => {
                update({ ceremonyType: e.target.value });
                scrollTo("ceremonyType");
              }}
              className={selectClass}
            >
              <option value="">Select…</option>
              <option value="Church">Church</option>
              <option value="Garden">Garden</option>
              <option value="Beach">Beach</option>
              <option value="Venue / Hall">Venue / Hall</option>
              <option value="Other">Other</option>
            </select>
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
            <DebouncedInput
              type="text"
              value={data.ceremonyAddress ?? ""}
              onCommit={(v) => update({ ceremonyAddress: v })}
              onFocus={() => scrollTo("ceremonyAddress")}
              placeholder="Full address"
              className={inputClass}
            />
          </FormField>

          <FormField id="field-ceremonyTime" label="Ceremony time">
            <DebouncedInput
              type="text"
              value={data.ceremonyTime ?? ""}
              onCommit={(v) => update({ ceremonyTime: v })}
              onFocus={() => scrollTo("ceremonyTime")}
              placeholder="e.g. 4:00 PM"
              className={inputClass}
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
                <DebouncedInput
                  type="text"
                  value={data.receptionAddress ?? ""}
                  onCommit={(v) => update({ receptionAddress: v })}
                  onFocus={() => scrollTo("receptionAddress")}
                  placeholder="Full address"
                  className={inputClass}
                />
              </FormField>

              <FormField id="field-receptionTime" label="Reception time">
                <DebouncedInput
                  type="text"
                  value={data.receptionTime ?? ""}
                  onCommit={(v) => update({ receptionTime: v })}
                  onFocus={() => scrollTo("receptionTime")}
                  placeholder="e.g. 6:00 PM"
                  className={inputClass}
                />
              </FormField>
            </>
          )}

          {step3Complete && (
            <CompletionLine icon={<MapPinIcon />}>
              Venue locked in
            </CompletionLine>
          )}

          <ContinueButton
            label="Continue to Make it Personal"
            onClick={() => goToStep(4)}
          />
        </FormSection>

        {/* ── Step 4: Make it more personal (optional) ────────────── */}
        <FormSection
          id="step-4"
          title="Make it more personal"
          description="Optional — your site is already complete with the essentials."
          open={currentStep === 4}
          onToggle={() => toggleStep(4)}
        >
          <SectionManager
            activeSections={
              data.userSections && data.userSections.length > 0
                ? data.userSections
                : getTheme(data.theme).sections
            }
            onChange={(next) => update({ userSections: next })}
          />

          {/* Per-section editor blocks — shown only when that section is
              currently in the active list (theme default OR user override). */}
          {(() => {
            const list =
              data.userSections && data.userSections.length > 0
                ? data.userSections
                : getTheme(data.theme).sections;
            const has = (id: SectionId) => list.includes(id);
            const OPTIONAL_CONTENT_SECTIONS: SectionId[] = [
              "story",
              "timeline",
              "dresscode",
              "countdown",
              "closing",
              "gallery",
              "travel",
              "registry",
              "faq",
              "weddingParty",
              "map",
              "hashtag",
              "saveTheDate",
            ];
            const hasOptionalContent = OPTIONAL_CONTENT_SECTIONS.some(has);
            if (!hasOptionalContent) return null;
            return (
              <div className="mt-6 space-y-5 border-t border-[#EDE8E0] pt-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#A09580]">
                  What goes in each section
                </p>

                {has("story") && (
                  <>
                    <FormField
                      id="field-welcomeMessage"
                      label="Welcome message"
                      action={
                        <AIGenerateButton
                          type="welcome"
                          names={names}
                          theme={data.theme}
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
                )}

                {has("timeline") && (
                  <FormField id="field-timeline" label="Timeline">
                    <TimelineEditor
                      items={data.timeline ?? []}
                      onChange={(items) => {
                        update({ timeline: items });
                        scrollTo("timeline");
                      }}
                    />
                  </FormField>
                )}

                {has("dresscode") && (
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
                )}

                {has("countdown") && (
                  <ToggleRow
                    id="field-countdownEnabled"
                    label="Show countdown"
                    checked={data.countdownEnabled ?? false}
                    onChange={(v) => {
                      update({ countdownEnabled: v });
                      scrollTo("countdownEnabled");
                    }}
                  />
                )}

                {has("closing") && (
                  <>
                    <div id="field-closingImage">
                      <ImageUpload
                        label="Closing image"
                        value={data.closingImage}
                        onChange={(url) => {
                          update({ closingImage: url });
                          scrollTo("noteToGuests");
                        }}
                      />
                    </div>

                    <FormField
                      id="field-noteToGuests"
                      label="Note to guests"
                      action={
                        <AIGenerateButton
                          type="note"
                          names={names}
                          theme={data.theme}
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
                )}

                {has("gallery") && (
                  <FormField id="field-galleryImages" label="Gallery">
                    <GalleryEditor
                      images={data.galleryImages ?? []}
                      onChange={(next) => update({ galleryImages: next })}
                    />
                  </FormField>
                )}

                {has("travel") && (
                  <FormField id="field-travelInfo" label="Travel & accommodation">
                    <DebouncedTextarea
                      rows={4}
                      value={data.travelInfo ?? ""}
                      onCommit={(v) => update({ travelInfo: v })}
                      onFocus={() => scrollTo("travelInfo")}
                      placeholder="Hotels, airports, parking…"
                      className={textareaClass}
                    />
                  </FormField>
                )}

                {has("registry") && (
                  <FormField id="field-registryLinks" label="Registry links">
                    <RegistryEditor
                      links={data.registryLinks ?? []}
                      onChange={(next) => update({ registryLinks: next })}
                    />
                  </FormField>
                )}

                {has("faq") && (
                  <FormField id="field-faqItems" label="FAQ">
                    <FaqEditor
                      items={data.faqItems ?? []}
                      onChange={(next) => update({ faqItems: next })}
                    />
                  </FormField>
                )}

                {has("weddingParty") && (
                  <FormField id="field-weddingParty" label="Wedding party">
                    <PartyEditor
                      members={data.weddingParty ?? []}
                      onChange={(next) => update({ weddingParty: next })}
                    />
                  </FormField>
                )}

                {has("map") && (
                  <FormField id="field-mapAddress" label="Map address">
                    <DebouncedTextarea
                      rows={3}
                      value={data.mapAddress ?? ""}
                      onCommit={(v) => update({ mapAddress: v })}
                      onFocus={() => scrollTo("mapAddress")}
                      placeholder="Venue name&#10;Street address&#10;City, Country"
                      className={textareaClass}
                    />
                  </FormField>
                )}

                {has("hashtag") && (
                  <>
                    <FormField id="field-hashtag" label="Wedding hashtag">
                      <DebouncedInput
                        type="text"
                        value={data.hashtag ?? ""}
                        onCommit={(v) => update({ hashtag: v })}
                        onFocus={() => scrollTo("hashtag")}
                        placeholder="#OliviaAndHenry2026"
                        className={inputClass}
                      />
                    </FormField>
                    <FormField id="field-musicEmbed" label="Music playlist URL">
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
                )}

                {has("saveTheDate") && (
                  <FormField
                    id="field-saveTheDateMessage"
                    label="Save-the-date message"
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
                )}
              </div>
            );
          })()}

          <ContinueButton label="Review & Publish" onClick={goToReview} />
        </FormSection>

        {/* ── Advanced ─ visible once Step 3 has been touched OR a click-to-
            edit targeted an Advanced field (advancedOpen forced true). */}
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

      <TemplatePicker
        open={pickerOpen}
        current={data.theme}
        onSelect={(theme) => {
          update({ theme, colors: THEME_PALETTES[theme] });
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
