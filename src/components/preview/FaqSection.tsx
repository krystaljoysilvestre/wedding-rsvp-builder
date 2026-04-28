import type { ThemeConfig } from "@/lib/themes";
import type { FaqItem } from "@/lib/types";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface FaqSectionProps {
  items: FaqItem[];
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function FaqSection({
  items,
  theme,
  viewport,
}: FaqSectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bgAlt,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
            Good to know
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
            Frequently asked
          </h2>
        </div>

        <div className="mt-12" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                paddingBottom: 24,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <h3
                style={{
                  color: theme.text,
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  fontSize: isMobile ? 16 : 19,
                }}
              >
                {item.question}
              </h3>
              <p
                className="mt-2"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: isMobile ? 13 : 15,
                  lineHeight: 1.7,
                }}
              >
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
