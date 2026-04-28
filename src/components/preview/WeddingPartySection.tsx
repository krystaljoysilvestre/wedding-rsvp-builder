import type { ThemeConfig } from "@/lib/themes";
import type { PartyMember } from "@/lib/types";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface WeddingPartySectionProps {
  members: PartyMember[];
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function WeddingPartySection({
  members,
  theme,
  viewport,
}: WeddingPartySectionProps) {
  const isMobile = viewport === "mobile";
  const cols = isMobile ? 2 : 4;

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
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
            By Our Side
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
            Wedding party
          </h2>
        </div>

        <div
          className="mt-12"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 24,
          }}
        >
          {members.map((m, i) => {
            const initial = (m.name?.charAt(0) ?? "?").toUpperCase();
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: isMobile ? 72 : 96,
                    height: isMobile ? 72 : 96,
                    margin: "0 auto",
                    borderRadius: "50%",
                    border: `1.5px solid ${theme.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.accent,
                    fontFamily: theme.headingFont,
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: theme.headingWeight,
                  }}
                >
                  {initial}
                </div>
                <p
                  className="mt-3"
                  style={{
                    color: theme.text,
                    fontFamily: theme.headingFont,
                    fontWeight: theme.headingWeight,
                    fontSize: isMobile ? 14 : 16,
                  }}
                >
                  {m.name}
                </p>
                <p
                  className="mt-1 uppercase"
                  style={{
                    color: theme.textMuted,
                    fontFamily: theme.bodyFont,
                    fontSize: 9,
                    letterSpacing: theme.labelSpacing,
                  }}
                >
                  {m.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
