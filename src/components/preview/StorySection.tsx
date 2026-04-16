import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament, { Divider } from "./Ornament";

interface StorySectionProps {
  story?: string;
  welcomeMessage?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function StorySection({
  story,
  welcomeMessage,
  theme,
  viewport,
}: StorySectionProps) {
  const isMobile = viewport === "mobile";
  const content = story || welcomeMessage;

  if (!content) return null;

  return (
    <section
      className="reveal-section flex items-center justify-center"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: isMobile ? "100%" : 580, textAlign: "center" }}>
        {/* Label */}
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
          {story ? "Our Story" : "Welcome"}
        </p>

        {/* Ornament */}
        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        {/* Opening quote — skip for minimal */}
        {theme.ornament !== "none" && (
          <p
            className="mt-8"
            style={{
              color: theme.accent,
              fontFamily: theme.headingFont,
              fontSize: isMobile ? 48 : 64,
              lineHeight: 1,
              height: isMobile ? 28 : 36,
              overflow: "visible",
              opacity: 0.12,
            }}
          >
            &ldquo;
          </p>
        )}

        {/* Story content */}
        <p
          style={{
            color: theme.text,
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            fontStyle: theme.headingStyle,
            fontSize: isMobile ? 17 : 22,
            lineHeight: 2,
            marginTop: theme.ornament !== "none" ? 16 : 32,
          }}
        >
          {content}
        </p>

        {/* Closing quote */}
        {theme.ornament !== "none" && (
          <p
            className="mt-4"
            style={{
              color: theme.accent,
              fontFamily: theme.headingFont,
              fontSize: isMobile ? 48 : 64,
              lineHeight: 1,
              height: isMobile ? 28 : 36,
              overflow: "visible",
              opacity: 0.12,
            }}
          >
            &rdquo;
          </p>
        )}

        {/* Welcome message if both exist */}
        {story && welcomeMessage && (
          <>
            <div className="mt-12">
              <Divider theme={theme} />
            </div>
            <p
              className="mt-8"
              style={{
                color: theme.textMuted,
                fontFamily: theme.bodyFont,
                fontSize: isMobile ? 13 : 15,
                fontWeight: theme.bodyWeight,
                lineHeight: 1.9,
              }}
            >
              {welcomeMessage}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
