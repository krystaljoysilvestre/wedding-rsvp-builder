import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface DetailsSectionProps {
  date?: string;
  ceremonyType?: string;
  ceremonyVenue?: string;
  ceremonyAddress?: string;
  ceremonyTime?: string;
  receptionVenue?: string;
  receptionAddress?: string;
  receptionTime?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function DetailsSection({
  date,
  ceremonyType,
  ceremonyAddress,
  ceremonyVenue,
  ceremonyTime,
  receptionVenue,
  receptionAddress,
  receptionTime,
  theme,
  viewport,
}: DetailsSectionProps) {
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
          The Details
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <div
          className="mt-14"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile || !receptionVenue ? "1fr" : "1fr 1fr",
            gap: isMobile ? 48 : 64,
          }}
        >
          {/* Ceremony */}
          <div>
            <p
              className="uppercase"
              style={{
                color: theme.textMuted,
                fontFamily: theme.bodyFont,
                fontSize: 10,
                fontWeight: theme.bodyWeight,
                letterSpacing: theme.labelSpacing,
              }}
            >
              {ceremonyType ? `${ceremonyType} Ceremony` : "Ceremony"}
            </p>
            <p
              className="mt-4"
              style={{
                color: theme.text,
                fontFamily: theme.headingFont,
                fontWeight: theme.headingWeight,
                fontStyle: theme.headingStyle,
                fontSize: isMobile ? 20 : 26,
              }}
            >
              {date || "Date to be announced"}
            </p>
            <p
              className="mt-3 leading-relaxed"
              style={{
                color: theme.textMuted,
                fontFamily: theme.bodyFont,
                fontSize: 14,
                fontWeight: theme.bodyWeight,
              }}
            >
              {ceremonyVenue || "Venue to be announced"}
            </p>
            {ceremonyAddress && (
              <p
                className="mt-1 leading-relaxed"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 13,
                  opacity: 0.75,
                }}
              >
                {ceremonyAddress}
              </p>
            )}
            {ceremonyTime && (
              <p
                className="mt-2"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 14,
                }}
              >
                {ceremonyTime}
              </p>
            )}
          </div>

          {/* Reception */}
          {receptionVenue && (
            <div>
              <p
                className="uppercase"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 10,
                  fontWeight: theme.bodyWeight,
                  letterSpacing: theme.labelSpacing,
                }}
              >
                Reception
              </p>
              <p
                className="mt-4"
                style={{
                  color: theme.text,
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  fontSize: isMobile ? 20 : 26,
                }}
              >
                {date || "Date to be announced"}
              </p>
              <p
                className="mt-3 leading-relaxed"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 14,
                  fontWeight: theme.bodyWeight,
                }}
              >
                {receptionVenue}
              </p>
              {receptionAddress && (
                <p
                  className="mt-1 leading-relaxed"
                  style={{
                    color: theme.textMuted,
                    fontFamily: theme.bodyFont,
                    fontSize: 13,
                    opacity: 0.75,
                  }}
                >
                  {receptionAddress}
                </p>
              )}
              {receptionTime && (
                <p
                  className="mt-2"
                  style={{
                    color: theme.textMuted,
                    fontFamily: theme.bodyFont,
                    fontSize: 14,
                  }}
                >
                  {receptionTime}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
