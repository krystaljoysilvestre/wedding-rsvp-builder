import type { ThemeConfig } from "@/lib/themes";
import type { RegistryLink } from "@/lib/types";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface RegistrySectionProps {
  links: RegistryLink[];
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function RegistrySection({
  links,
  theme,
  viewport,
}: RegistrySectionProps) {
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
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
          With Love
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
          Registry
        </h2>

        <p
          className="mt-4"
          style={{
            color: theme.textMuted,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 13 : 15,
            lineHeight: 1.6,
          }}
        >
          Your presence is our gift — but if you wish to celebrate further:
        </p>

        <div
          className="mt-8"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                minWidth: 200,
                padding: "10px 24px",
                border: `1px solid ${theme.accentMuted}`,
                borderRadius: theme.borderRadius,
                color: theme.text,
                fontFamily: theme.bodyFont,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: theme.labelSpacing,
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
