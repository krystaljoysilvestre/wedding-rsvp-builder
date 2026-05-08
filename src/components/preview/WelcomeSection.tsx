import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface WelcomeSectionProps {
  welcomeMessage?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function WelcomeSection({
  welcomeMessage,
  theme,
  viewport,
}: WelcomeSectionProps) {
  if (!welcomeMessage) return null;
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section flex items-center justify-center"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: isMobile ? "100%" : 540, textAlign: "center" }}>
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
          Welcome
        </p>
        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>
        <p
          className="mt-8"
          style={{
            color: theme.text,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 15 : 17,
            fontWeight: theme.bodyWeight,
            lineHeight: 1.85,
          }}
        >
          {welcomeMessage}
        </p>
      </div>
    </section>
  );
}
