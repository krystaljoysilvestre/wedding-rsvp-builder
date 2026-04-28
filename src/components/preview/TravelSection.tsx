import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface TravelSectionProps {
  travelInfo: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function TravelSection({
  travelInfo,
  theme,
  viewport,
}: TravelSectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bgAlt,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
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
          Travel & Stay
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <h2
          className="mt-6"
          style={{
            color: theme.text,
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            fontStyle: theme.headingStyle,
            fontSize: isMobile ? 26 : 36,
          }}
        >
          Getting there
        </h2>

        <p
          className="mt-8 whitespace-pre-line"
          style={{
            color: theme.textMuted,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 14 : 16,
            lineHeight: 1.7,
          }}
        >
          {travelInfo}
        </p>
      </div>
    </section>
  );
}
