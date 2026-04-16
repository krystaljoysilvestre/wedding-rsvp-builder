import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface ClosingSectionProps {
  names?: string;
  noteToGuests?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function ClosingSection({
  names,
  noteToGuests,
  theme,
  viewport,
}: ClosingSectionProps) {
  const displayNames = names || "Your Names";
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: isMobile ? "60vh" : "70vh",
        padding: isMobile ? "0 24px" : "0 48px",
        background: theme.bgAlt,
      }}
    >
      {/* Parallax background */}
      <div
        className="closing-bg absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${theme.closingImage}')`,
          opacity: 0.07,
        }}
      />

      <div className="relative z-10 text-center">
        {/* Ornament */}
        <div className="mb-8">
          <Ornament theme={theme} size="lg" />
        </div>

        <p
          className="uppercase"
          style={{
            color: theme.accentMuted,
            fontFamily: theme.bodyFont,
            fontSize: 10,
            fontWeight: theme.bodyWeight,
            letterSpacing: theme.labelSpacing,
          }}
        >
          With love
        </p>

        <h2
          className="mt-6 tracking-tight"
          style={{
            color: theme.text,
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            fontStyle: theme.headingStyle,
            fontSize: isMobile ? 34 : 52,
          }}
        >
          {displayNames}
        </h2>

        {/* Ornament divider */}
        <div className="mt-8">
          <Ornament theme={theme} color={`${theme.accent}60`} size="sm" />
        </div>

        <p
          className="mt-8"
          style={{
            color: theme.textMuted,
            fontFamily: noteToGuests ? theme.headingFont : theme.bodyFont,
            fontSize: noteToGuests ? (isMobile ? 15 : 17) : 11,
            fontWeight: noteToGuests ? theme.headingWeight : theme.bodyWeight,
            letterSpacing: noteToGuests ? "0.01em" : theme.labelSpacing,
            textTransform: noteToGuests ? "none" : "uppercase",
            fontStyle: noteToGuests ? "italic" : "normal",
            lineHeight: 1.8,
            maxWidth: 420,
            margin: "32px auto 0",
          }}
        >
          {noteToGuests || "We can\u2019t wait to celebrate with you"}
        </p>
      </div>
    </section>
  );
}
