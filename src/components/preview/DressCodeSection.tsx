import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface DressCodeSectionProps {
  dressCode: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function DressCodeSection({
  dressCode,
  theme,
  viewport,
}: DressCodeSectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bgAlt,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
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
          Dress Code
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <p
          className="mt-8"
          style={{
            color: theme.text,
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            fontStyle: theme.headingStyle,
            fontSize: isMobile ? 22 : 30,
          }}
        >
          {dressCode}
        </p>
      </div>
    </section>
  );
}
