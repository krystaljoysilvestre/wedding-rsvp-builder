"use client";

import { useWedding } from "@/context/WeddingContext";
import FormSection from "./FormSection";
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
import TimelineEditor from "./TimelineEditor";
import ImageUpload from "./ImageUpload";

// ─── Field → preview section for scroll targeting ────────────────────

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
  backgroundStyle: "section-closing",
};

// ─── Toggle component ────────────────────────────────────────────────

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
      className="relative h-5 w-10 rounded-full transition-colors duration-300"
      style={{ background: checked ? "#1A1A1A" : "#E0D9CE" }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export default function EditPanel() {
  const { data, update, setScrollTarget } = useWedding();

  function scrollTo(field: string) {
    const section = FIELD_SECTION[field];
    if (section) setScrollTarget(section);
  }

  return (
    <div className="flex h-full flex-col bg-[#FDFBF7]">
      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* ── Section 1: Identity & Style ──────────────── */}
        <FormSection title="Identity & Style">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="First Name">
              <input
                type="text"
                value={data.name1 ?? ""}
                onChange={(e) => update({ name1: e.target.value })}
                onFocus={() => scrollTo("name1")}
                placeholder="e.g. Krystal"
                className={inputClass}
              />
            </FormField>
            <FormField label="Partner's Name">
              <input
                type="text"
                value={data.name2 ?? ""}
                onChange={(e) => update({ name2: e.target.value })}
                onFocus={() => scrollTo("name2")}
                placeholder="e.g. Jom"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Primary Color">
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
                  className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border border-[#E0D9CE] p-0 appearance-none"
                />
                <input
                  type="text"
                  value={data.colors?.primary ?? ""}
                  onChange={(e) => {
                    update({
                      colors: {
                        primary: e.target.value,
                        accent: data.colors?.accent ?? "",
                      },
                    });
                  }}
                  onFocus={() => scrollTo("colors.primary")}
                  placeholder="#C4917B"
                  className={`${inputClass} flex-1`}
                />
              </div>
            </FormField>

            <FormField label="Accent Color">
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
                  className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border border-[#E0D9CE] p-0 appearance-none"
                />
                <input
                  type="text"
                  value={data.colors?.accent ?? ""}
                  onChange={(e) => {
                    update({
                      colors: {
                        primary: data.colors?.primary ?? "",
                        accent: e.target.value,
                      },
                    });
                  }}
                  onFocus={() => scrollTo("colors.accent")}
                  placeholder="#D4A995"
                  className={`${inputClass} flex-1`}
                />
              </div>
            </FormField>
          </div>

          <FormField label="Tagline">
            <input
              type="text"
              value={data.tagline ?? ""}
              onChange={(e) => update({ tagline: e.target.value })}
              onFocus={() => scrollTo("tagline")}
              placeholder="A celebration of love"
              className={inputClass}
            />
          </FormField>
        </FormSection>

        {/* ── Section 2: Event Details ─────────────────── */}
        <FormSection title="Event Details">
          <FormField label="Wedding Date">
            <input
              type="text"
              value={data.date ?? ""}
              onChange={(e) => update({ date: e.target.value })}
              onFocus={() => scrollTo("date")}
              placeholder="June 15, 2026"
              className={inputClass}
            />
          </FormField>

          <FormField label="Ceremony Type">
            <select
              value={data.ceremonyType ?? ""}
              onChange={(e) => {
                update({ ceremonyType: e.target.value });
                scrollTo("ceremonyType");
              }}
              className={selectClass}
            >
              <option value="">Select...</option>
              <option value="Church">Church</option>
              <option value="Garden">Garden</option>
              <option value="Beach">Beach</option>
              <option value="Venue / Hall">Venue / Hall</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <FormField label="Ceremony Venue">
            <input
              type="text"
              value={data.ceremonyVenue ?? ""}
              onChange={(e) => update({ ceremonyVenue: e.target.value })}
              onFocus={() => scrollTo("ceremonyVenue")}
              placeholder="Venue name"
              className={inputClass}
            />
          </FormField>

          <FormField label="Ceremony Address">
            <input
              type="text"
              value={data.ceremonyAddress ?? ""}
              onChange={(e) => update({ ceremonyAddress: e.target.value })}
              onFocus={() => scrollTo("ceremonyAddress")}
              placeholder="Full address"
              className={inputClass}
            />
          </FormField>

          <FormField label="Reception Venue">
            <input
              type="text"
              value={data.receptionVenue ?? ""}
              onChange={(e) => update({ receptionVenue: e.target.value })}
              onFocus={() => scrollTo("receptionVenue")}
              placeholder="Leave empty if same as ceremony"
              className={inputClass}
            />
          </FormField>

          <FormField label="Reception Address">
            <input
              type="text"
              value={data.receptionAddress ?? ""}
              onChange={(e) => update({ receptionAddress: e.target.value })}
              onFocus={() => scrollTo("receptionAddress")}
              placeholder="Leave empty if same as ceremony"
              className={inputClass}
            />
          </FormField>
        </FormSection>

        {/* ── Section 3: Content ───────────────────────── */}
        <FormSection title="Content">
          <FormField label="Our Story">
            <textarea
              rows={4}
              value={data.story ?? ""}
              onChange={(e) => update({ story: e.target.value })}
              onFocus={() => scrollTo("story")}
              placeholder="Share how you two met..."
              className={textareaClass}
            />
          </FormField>

          <FormField label="Welcome Message">
            <textarea
              rows={3}
              value={data.welcomeMessage ?? ""}
              onChange={(e) => update({ welcomeMessage: e.target.value })}
              onFocus={() => scrollTo("welcomeMessage")}
              placeholder="A warm message for your guests"
              className={textareaClass}
            />
          </FormField>
        </FormSection>

        {/* ── Section 4: Experience ────────────────────── */}
        <FormSection title="Experience">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5C4F3D]">
              Enable RSVP
            </span>
            <Toggle
              checked={data.rsvpEnabled ?? false}
              onChange={(v) => {
                update({ rsvpEnabled: v });
                scrollTo("rsvpEnabled");
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5C4F3D]">
              Show Countdown
            </span>
            <Toggle
              checked={data.countdownEnabled ?? false}
              onChange={(v) => {
                update({ countdownEnabled: v });
                scrollTo("countdownEnabled");
              }}
            />
          </div>

          <FormField label="Dress Code">
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

          <FormField label="Timeline">
            <TimelineEditor
              items={data.timeline ?? []}
              onChange={(items) => {
                update({ timeline: items });
                scrollTo("timeline");
              }}
            />
          </FormField>
        </FormSection>

        {/* ── Section 5: Photos ─────────────────────────── */}
        <FormSection title="Photos">
          <ImageUpload
            label="Logo / Monogram"
            value={data.logoImage}
            onChange={(url) => {
              update({ logoImage: url });
              scrollTo("name1");
            }}
          />
          <ImageUpload
            label="Hero Image"
            value={data.heroImage}
            onChange={(url) => {
              update({ heroImage: url });
              scrollTo("name1");
            }}
          />
          <ImageUpload
            label="Closing Image"
            value={data.closingImage}
            onChange={(url) => {
              update({ closingImage: url });
              scrollTo("noteToGuests");
            }}
          />
        </FormSection>

        {/* ── Section 6: Enhancements ──────────────────── */}
        <FormSection title="Enhancements">
          <FormField label="Note to Guests">
            <textarea
              rows={3}
              value={data.noteToGuests ?? ""}
              onChange={(e) => update({ noteToGuests: e.target.value })}
              onFocus={() => scrollTo("noteToGuests")}
              placeholder="A special message from your heart"
              className={textareaClass}
            />
          </FormField>

          <FormField label="Background Style">
            <select
              value={data.backgroundStyle ?? ""}
              onChange={(e) => {
                update({ backgroundStyle: e.target.value });
                scrollTo("backgroundStyle");
              }}
              className={selectClass}
            >
              <option value="">Default</option>
              <option value="Floral">Floral</option>
              <option value="Minimal">Minimal</option>
              <option value="Photo-based">Photo-based</option>
              <option value="Cinematic">Cinematic</option>
            </select>
          </FormField>
        </FormSection>
      </div>
    </div>
  );
}
