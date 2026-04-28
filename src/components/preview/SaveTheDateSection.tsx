import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface SaveTheDateSectionProps {
  message: string;
  date?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function SaveTheDateSection({
  message,
  date,
  theme,
  viewport,
}: SaveTheDateSectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bgAlt,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
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
          Save the Date
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        {date && (
          <p
            className="mt-8 uppercase"
            style={{
              color: theme.accent,
              fontFamily: theme.headingFont,
              fontWeight: theme.headingWeight,
              fontStyle: theme.headingStyle,
              fontSize: isMobile ? 28 : 42,
              letterSpacing: "0.1em",
            }}
          >
            {date}
          </p>
        )}

        <p
          className="mt-6"
          style={{
            color: theme.text,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 14 : 16,
            lineHeight: 1.7,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>
      </div>
    </section>
  );
}
