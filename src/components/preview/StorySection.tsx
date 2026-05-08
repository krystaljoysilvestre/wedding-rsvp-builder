import type { ThemeConfig } from "@/lib/themes";
import type { StoryMilestone } from "@/lib/types";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface StorySectionProps {
  story?: string;
  storyTimeline?: StoryMilestone[];
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function StorySection({
  story,
  storyTimeline,
  theme,
  viewport,
}: StorySectionProps) {
  const format = theme.storyFormat ?? "prose";
  return format === "timeline" ? (
    <TimelineLayout
      milestones={storyTimeline}
      theme={theme}
      viewport={viewport}
    />
  ) : (
    <ProseLayout story={story} theme={theme} viewport={viewport} />
  );
}

// ─── Prose layout (default) ────────────────────────────────────────

function ProseLayout({
  story,
  theme,
  viewport,
}: {
  story?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}) {
  if (!story) return null;
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section flex items-center justify-center"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: isMobile ? "100%" : 580, textAlign: "center" }}>
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
          Our Story
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

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
          {story}
        </p>

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
      </div>
    </section>
  );
}

// ─── Timeline layout (theme.storyFormat === "timeline") ────────────

function TimelineLayout({
  milestones,
  theme,
  viewport,
}: {
  milestones?: StoryMilestone[];
  theme: ThemeConfig;
  viewport: Viewport;
}) {
  if (!milestones || milestones.length === 0) return null;
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section flex items-center justify-center"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: isMobile ? "100%" : 600, textAlign: "center" }}>
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
          Our Story
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <ol
          className="mt-10 flex flex-col items-center"
          style={{ gap: isMobile ? 32 : 40 }}
        >
          {milestones.map((m, i) => (
            <li
              key={i}
              className="flex flex-col items-center"
              style={{ gap: isMobile ? 6 : 8 }}
            >
              {m.image && (
                <div
                  className="bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${m.image}')`,
                    width: isMobile ? 140 : 180,
                    height: isMobile ? 140 : 180,
                    borderRadius: theme.borderRadius,
                    marginBottom: isMobile ? 8 : 12,
                  }}
                  aria-hidden
                />
              )}
              <span
                className="uppercase"
                style={{
                  color: theme.accent,
                  fontFamily: theme.bodyFont,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: theme.bodyWeight,
                  letterSpacing: theme.labelSpacing,
                }}
              >
                {m.year}
              </span>
              <span
                style={{
                  color: theme.text,
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  fontSize: isMobile ? 18 : 24,
                  lineHeight: 1.3,
                }}
              >
                {m.label}
              </span>
              {/* Connector — between items, not after the last */}
              {i < milestones.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    width: 1,
                    height: isMobile ? 24 : 32,
                    background: theme.accentMuted,
                    opacity: 0.4,
                    marginTop: isMobile ? 12 : 16,
                  }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
