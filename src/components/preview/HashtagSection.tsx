import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface HashtagSectionProps {
  hashtag: string;
  musicEmbed?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function HashtagSection({
  hashtag,
  musicEmbed,
  theme,
  viewport,
}: HashtagSectionProps) {
  const isMobile = viewport === "mobile";
  const tag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
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
          Share the day
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <p
          className="mt-8"
          style={{
            color: theme.accent,
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            fontStyle: theme.headingStyle,
            fontSize: isMobile ? 32 : 48,
          }}
        >
          {tag}
        </p>

        <p
          className="mt-4"
          style={{
            color: theme.textMuted,
            fontFamily: theme.bodyFont,
            fontSize: isMobile ? 13 : 15,
            lineHeight: 1.6,
          }}
        >
          Tag your photos so we can relive every moment with you.
        </p>

        {musicEmbed && (
          <a
            href={musicEmbed}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block uppercase"
            style={{
              padding: "10px 28px",
              border: `1px solid ${theme.accentMuted}`,
              borderRadius: theme.borderRadius,
              color: theme.text,
              fontFamily: theme.bodyFont,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: theme.labelSpacing,
              textDecoration: "none",
            }}
          >
            ♪ Open Playlist
          </a>
        )}
      </div>
    </section>
  );
}
