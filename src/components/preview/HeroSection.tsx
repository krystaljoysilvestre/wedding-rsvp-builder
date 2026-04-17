import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface HeroSectionProps {
  name1?: string;
  name2?: string;
  date?: string;
  tagline?: string;
  customImage?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function HeroSection({
  name1,
  name2,
  date,
  customImage,
  tagline,
  theme,
  viewport,
}: HeroSectionProps) {
  const displayTagline = tagline || "A celebration of love";
  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  const nameSize = isMobile ? 38 : isTablet ? 56 : 80;

  return (
    <section
      className="hero-section relative flex items-center justify-center overflow-hidden"
      style={{
        background: theme.bgAlt,
        minHeight: isMobile ? "85vh" : "100vh",
      }}
    >
      {/* Background image — theme-specific */}
      <div
        className="hero-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${customImage || theme.heroImage}')` }}
      />

      {/* Overlay layers */}
      <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center"
        style={{ padding: isMobile ? "0 24px" : "0 64px" }}
      >
        {/* Ornament */}
        <div className="hero-ornament mb-6 opacity-0">
          <Ornament theme={theme} color="rgba(255,255,255,0.35)" size="md" />
        </div>

        {/* Tagline */}
        <p
          className="hero-tagline font-medium uppercase opacity-0"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 9 : 11,
            fontWeight: theme.bodyWeight,
            letterSpacing: theme.labelSpacing,
          }}
        >
          {displayTagline}
        </p>

        {/* Names */}
        <div className="mt-6" style={{ lineHeight: 1.2 }}>
          {name1 && name2 ? (
            <>
              <h1
                className="hero-name-1 tracking-tight opacity-0"
                style={{
                  color: "#FFFFFF",
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  fontSize: nameSize,
                }}
              >
                {name1}
              </h1>
              <p
                className="hero-ampersand my-2 italic opacity-0"
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: theme.headingFont,
                  fontSize: isMobile ? 20 : 28,
                  fontWeight: 300,
                }}
              >
                &amp;
              </p>
              <h1
                className="hero-name-2 tracking-tight opacity-0"
                style={{
                  color: "#FFFFFF",
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  fontSize: nameSize,
                }}
              >
                {name2}
              </h1>
            </>
          ) : (
            <h1
              className="hero-name-1 tracking-tight opacity-0"
              style={{
                color: "#FFFFFF",
                fontFamily: theme.headingFont,
                fontWeight: theme.headingWeight,
                fontStyle: theme.headingStyle,
                fontSize: nameSize,
              }}
            >
              {name1 || "Your Names"}
            </h1>
          )}
        </div>

        {/* Divider */}
        <div className="hero-divider mx-auto mt-8 opacity-0">
          <Ornament theme={theme} color="rgba(255,255,255,0.3)" size="sm" />
        </div>

        {/* Date */}
        {date && (
          <p
            className="hero-date mt-6 uppercase opacity-0"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: theme.bodyFont,
              fontSize: isMobile ? 10 : 12,
              fontWeight: theme.bodyWeight,
              letterSpacing: theme.labelSpacing,
            }}
          >
            {date}
          </p>
        )}

        {/* Scroll hint */}
        <div className="hero-scroll-hint mt-16 opacity-0">
          <div
            className="mx-auto"
            style={{
              width: 1,
              height: isMobile ? 32 : 48,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
