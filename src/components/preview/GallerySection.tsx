import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface GallerySectionProps {
  images: string[];
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function GallerySection({
  images,
  theme,
  viewport,
}: GallerySectionProps) {
  const isMobile = viewport === "mobile";
  const cols = isMobile ? 2 : 3;
  const gap = isMobile ? 8 : 14;

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            Gallery
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
              fontSize: isMobile ? 28 : 40,
            }}
          >
            Moments together
          </h2>
        </div>

        <div
          className="mt-10"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap,
          }}
        >
          {images.slice(0, 6).map((src, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1 / 1",
                background: `url('${src}') center/cover no-repeat ${theme.bgAlt}`,
                borderRadius: theme.borderRadius,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
