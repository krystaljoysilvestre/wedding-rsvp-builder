import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface MapSectionProps {
  address: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function MapSection({
  address,
  theme,
  viewport,
}: MapSectionProps) {
  const isMobile = viewport === "mobile";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

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
          Find Us
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
          Location
        </h2>

        <p
          className="mt-6"
          style={{
            color: theme.text,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 14 : 16,
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {address}
        </p>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block uppercase"
          style={{
            padding: "10px 28px",
            border: `1px solid ${theme.accent}`,
            borderRadius: theme.borderRadius,
            color: theme.accent,
            fontFamily: theme.bodyFont,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: theme.labelSpacing,
            textDecoration: "none",
          }}
        >
          Open in Maps
        </a>
      </div>
    </section>
  );
}
