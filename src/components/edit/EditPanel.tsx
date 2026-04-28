"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { displayNames } from "@/lib/types";
import { getTheme, THEME_PALETTES } from "@/lib/themes";
import FormSection from "./FormSection";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import { BlurInput, BlurTextarea } from "./BlurField";
import TimelineEditor from "./TimelineEditor";
import ImageUpload from "./ImageUpload";
import AIGenerateButton from "./AIGenerateButton";
import StepProgress from "./StepProgress";
import TemplatePicker from "./TemplatePicker";
import DatePicker, { formatDate } from "./DatePicker";

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
  receptionVenue: "section-details",
  receptionAddress: "section-details",
  story: "section-story",
  welcomeMessage: "section-story",
  rsvpEnabled: "section-rsvp",
  timeline: "section-timeline",
  dressCode: "section-dresscode",
  countdownEnabled: "section-countdown",
  noteToGuests: "section-closing",
};

// When a step opens, the preview scrolls to the matching section so the user
// sees what they're about to edit.
const STEP_TO_PREVIEW: Record<number, string> = {
  1: "section-hero",
  2: "section-story",
  3: "section-details",
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
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
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

function CompletionLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] italic text-[#5C4F3D]" aria-live="polite">
      {children}
    </p>
  );
}

export default function EditPanel() {
  const { data, update, setScrollTarget } = useWedding();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [differentReception, setDifferentReception] = useState(
    Boolean(data.receptionVenue || data.receptionAddress),
  );

  // Seed today's date when the user first lands without a date set.
  useEffect(() => {
    if (!data.date) {
      update({ date: formatDate(new Date()) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const step1Complete = Boolean(data.name1 && data.name2 && data.date);
  const step2Complete = Boolean(
    data.tagline && data.story && data.welcomeMessage,
  );
  const step3Complete = Boolean(data.ceremonyVenue && data.ceremonyAddress);

  // Advanced unlocks once Step 3 has been touched.
  const step3Started = Boolean(
    data.ceremonyType ||
      data.ceremonyVenue ||
      data.ceremonyAddress ||
      data.dressCode ||
      (data.timeline && data.timeline.length > 0),
  );

  return (
    <div className="flex h-full flex-col bg-[#FDFBF7]">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <StepProgress
          activeStep={currentStep}
          onStepClick={goToStep}
          steps={[
            { label: "Basics", complete: step1Complete },
            { label: "Story", complete: step2Complete },
            { label: "The day", complete: step3Complete },
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
            <FormField label="Your name">
              <BlurInput
                type="text"
                value={data.name1 ?? ""}
                onCommit={(v) => update({ name1: v })}
                onFocus={() => scrollTo("name1")}
                placeholder="Olivia"
                className={inputClass}
              />
            </FormField>
            <FormField label="Partner's name">
              <BlurInput
                type="text"
                value={data.name2 ?? ""}
                onCommit={(v) => update({ name2: v })}
                onFocus={() => scrollTo("name2")}
                placeholder="Henry"
                className={inputClass}
              />
            </FormField>
          </div>

          <DatePicker
            ariaLabel="Wedding date"
            value={data.date ?? ""}
            onChange={(v) => update({ date: v })}
            onFocus={() => scrollTo("date")}
          />

          {step1Complete && (
            <CompletionLine>✨ Your wedding is taking shape</CompletionLine>
          )}

          <ContinueButton
            label="Continue to Your Story"
            onClick={() => goToStep(2)}
          />
        </FormSection>

        {/* ── Step 2 ─────────────────────────────────────── */}
        <FormSection
          id="step-2"
          title="Step 2: Tell Your Story"
          description="This is what your guests will remember."
          open={currentStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <ImageUpload
            label="Hero image"
            value={data.heroImage}
            onChange={(url) => {
              update({ heroImage: url });
              scrollTo("name1");
            }}
          />

          <FormField
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
            <BlurInput
              type="text"
              value={data.tagline ?? ""}
              onCommit={(v) => update({ tagline: v })}
              onFocus={() => scrollTo("tagline")}
              placeholder="A celebration of love"
              className={inputClass}
            />
          </FormField>

          <FormField
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
            <BlurTextarea
              rows={4}
              value={data.story ?? ""}
              onCommit={(v) => update({ story: v })}
              onFocus={() => scrollTo("story")}
              placeholder="Share how you two met..."
              className={textareaClass}
            />
          </FormField>

          <FormField
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
            <BlurTextarea
              rows={3}
              value={data.welcomeMessage ?? ""}
              onCommit={(v) => update({ welcomeMessage: v })}
              onFocus={() => scrollTo("welcomeMessage")}
              placeholder="A warm message for your guests"
              className={textareaClass}
            />
          </FormField>

          {step2Complete && (
            <CompletionLine>💛 This story is beautiful</CompletionLine>
          )}

          <ContinueButton
            label="Continue to Plan Your Day"
            onClick={() => goToStep(3)}
          />
        </FormSection>

        {/* ── Step 3 ─────────────────────────────────────── */}
        <FormSection
          id="step-3"
          title="Step 3: Plan Your Day"
          description="When and where everything happens."
          open={currentStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <FormField label="Ceremony type">
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

          <FormField label="Ceremony venue">
            <BlurInput
              type="text"
              value={data.ceremonyVenue ?? ""}
              onCommit={(v) => update({ ceremonyVenue: v })}
              onFocus={() => scrollTo("ceremonyVenue")}
              placeholder="Venue name"
              className={inputClass}
            />
          </FormField>

          <FormField label="Ceremony address">
            <BlurInput
              type="text"
              value={data.ceremonyAddress ?? ""}
              onCommit={(v) => update({ ceremonyAddress: v })}
              onFocus={() => scrollTo("ceremonyAddress")}
              placeholder="Full address"
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
              <FormField label="Reception venue">
                <BlurInput
                  type="text"
                  value={data.receptionVenue ?? ""}
                  onCommit={(v) => update({ receptionVenue: v })}
                  onFocus={() => scrollTo("receptionVenue")}
                  placeholder="Venue name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Reception address">
                <BlurInput
                  type="text"
                  value={data.receptionAddress ?? ""}
                  onCommit={(v) => update({ receptionAddress: v })}
                  onFocus={() => scrollTo("receptionAddress")}
                  placeholder="Full address"
                  className={inputClass}
                />
              </FormField>
            </>
          )}

          <FormField label="Timeline">
            <TimelineEditor
              items={data.timeline ?? []}
              onChange={(items) => {
                update({ timeline: items });
                scrollTo("timeline");
              }}
            />
          </FormField>

          <FormField label="Dress code">
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

          <ToggleRow
            label="Show RSVP"
            checked={data.rsvpEnabled ?? false}
            onChange={(v) => {
              update({ rsvpEnabled: v });
              scrollTo("rsvpEnabled");
            }}
          />

          <ToggleRow
            label="Show countdown"
            checked={data.countdownEnabled ?? false}
            onChange={(v) => {
              update({ countdownEnabled: v });
              scrollTo("countdownEnabled");
            }}
          />

          {step3Complete && (
            <CompletionLine>🎉 Everything&apos;s planned</CompletionLine>
          )}

          <ContinueButton label="Review & Publish" onClick={goToReview} />
        </FormSection>

        {/* ── Advanced (gated until Step 3 has been touched) ─ */}
        {step3Started && (
          <FormSection
            title="Advanced"
            description="Custom colors, extra images, personal note."
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Primary color">
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
                  <BlurInput
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

              <FormField label="Accent color">
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
                  <BlurInput
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

            <ImageUpload
              label="Logo / monogram"
              value={data.logoImage}
              onChange={(url) => {
                update({ logoImage: url });
                scrollTo("name1");
              }}
            />

            <ImageUpload
              label="Closing image"
              value={data.closingImage}
              onChange={(url) => {
                update({ closingImage: url });
                scrollTo("noteToGuests");
              }}
            />

            <FormField
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
              <BlurTextarea
                rows={3}
                value={data.noteToGuests ?? ""}
                onCommit={(v) => update({ noteToGuests: v })}
                onFocus={() => scrollTo("noteToGuests")}
                placeholder="A special message from your heart"
                className={textareaClass}
              />
            </FormField>
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
