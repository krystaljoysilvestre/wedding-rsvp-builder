import type { ThemeConfig } from "@/lib/themes";
import type { TimelineItem } from "@/lib/types";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface TimelineSectionProps {
  timeline: TimelineItem[];
  theme: ThemeConfig;
  viewport: Viewport;
}

/** Map common event keywords to inline SVG illustrations */
function EventIcon({ label, color }: { label: string; color: string }) {
  const l = label.toLowerCase();

  // Ceremony / vows — rings
  if (l.includes("ceremony") || l.includes("vow") || l.includes("wedding")) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="11" cy="14" r="6" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="17" cy="14" r="6" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="14" cy="10" r="1" fill={color} opacity="0.3" />
      </svg>
    );
  }

  // Cocktails / drinks
  if (l.includes("cocktail") || l.includes("drink") || l.includes("toast")) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M8 6L14 14L20 6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="14" y1="14" x2="14" y2="22" stroke={color} strokeWidth="1" opacity="0.4" />
        <line x1="10" y1="22" x2="18" y2="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <circle cx="12" cy="9" r="1" fill={color} opacity="0.3" />
      </svg>
    );
  }

  // Dinner / feast / meal
  if (l.includes("dinner") || l.includes("feast") || l.includes("meal") || l.includes("lunch")) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="8" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <circle cx="14" cy="14" r="4" stroke={color} strokeWidth="0.6" opacity="0.3" />
        <line x1="4" y1="14" x2="7" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <line x1="21" y1="14" x2="24" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  // Dance / party
  if (l.includes("dance") || l.includes("party") || l.includes("celebration")) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L15.5 10H21L16.5 13.5L18 20L14 16L10 20L11.5 13.5L7 10H12.5L14 4Z" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <circle cx="14" cy="12" r="2" fill={color} opacity="0.15" />
      </svg>
    );
  }

  // Photos / camera
  if (l.includes("photo") || l.includes("picture") || l.includes("portrait")) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="9" width="18" height="13" rx="2" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <circle cx="14" cy="15" r="4" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <circle cx="14" cy="15" r="1.5" fill={color} opacity="0.2" />
        <path d="M10 9V7H18V9" stroke={color} strokeWidth="0.8" opacity="0.35" />
      </svg>
    );
  }

  // Default — clock
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="14" y1="14" x2="14" y2="9" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="14" y1="14" x2="18" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <circle cx="14" cy="14" r="1" fill={color} opacity="0.3" />
    </svg>
  );
}

export default function TimelineSection({
  timeline,
  theme,
  viewport,
}: TimelineSectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bgAlt,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
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
          Timeline
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        {/* Vertical timeline */}
        <div className="mt-12 relative">
          {/* Center line */}
          {!isMobile && (
            <div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2"
              style={{ width: 1, background: `${theme.accent}20` }}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 24 : 32 }}>
            {timeline.map((item, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  gap: isMobile ? 8 : 0,
                }}
              >
                {/* Time — left side */}
                {item.time && (
                  <div
                    style={{
                      width: isMobile ? "auto" : "calc(50% - 24px)",
                      textAlign: isMobile ? "center" : "right",
                      paddingRight: isMobile ? 0 : 16,
                    }}
                  >
                    <p
                      className="uppercase"
                      style={{
                        color: theme.accent,
                        fontFamily: theme.bodyFont,
                        fontSize: 11,
                        fontWeight: theme.bodyWeight,
                        letterSpacing: "0.15em",
                      }}
                    >
                      {item.time}
                    </p>
                  </div>
                )}

                {/* Center icon */}
                <div
                  className="relative z-10 flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: theme.bg,
                    border: `1px solid ${theme.accent}30`,
                  }}
                >
                  <EventIcon label={item.label} color={theme.accent} />
                </div>

                {/* Label — right side */}
                <div
                  style={{
                    width: isMobile ? "auto" : "calc(50% - 24px)",
                    textAlign: isMobile ? "center" : "left",
                    paddingLeft: isMobile ? 0 : 16,
                  }}
                >
                  <p
                    style={{
                      color: theme.text,
                      fontFamily: theme.headingFont,
                      fontWeight: theme.headingWeight,
                      fontSize: isMobile ? 15 : 17,
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
