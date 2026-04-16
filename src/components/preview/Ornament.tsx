import type { ThemeConfig, OrnamentStyle } from "@/lib/themes";

interface OrnamentProps {
  theme: ThemeConfig;
  color?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Renders a theme-appropriate decorative ornament.
 * - romantic: floral/botanical flourish
 * - elegant: geometric diamond star
 * - minimal: nothing (clean)
 * - cinematic: horizontal lines
 */
export default function Ornament({ theme, color, size = "md" }: OrnamentProps) {
  const c = color ?? theme.accent;
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.3 : 1;

  return <OrnamentSvg style={theme.ornament} color={c} scale={scale} />;
}

function OrnamentSvg({
  style,
  color,
  scale,
}: {
  style: OrnamentStyle;
  color: string;
  scale: number;
}) {
  if (style === "none") return null;

  if (style === "floral") {
    return (
      <svg
        width={48 * scale}
        height={20 * scale}
        viewBox="0 0 48 20"
        fill="none"
        className="mx-auto"
      >
        {/* Leaf left */}
        <path
          d="M4 10C4 10 10 4 16 6C16 6 12 10 4 10Z"
          fill={color}
          opacity="0.15"
        />
        <path
          d="M4 10C4 10 10 16 16 14C16 14 12 10 4 10Z"
          fill={color}
          opacity="0.12"
        />
        {/* Center dot */}
        <circle cx="24" cy="10" r="1.5" fill={color} opacity="0.35" />
        {/* Leaf right */}
        <path
          d="M44 10C44 10 38 4 32 6C32 6 36 10 44 10Z"
          fill={color}
          opacity="0.15"
        />
        <path
          d="M44 10C44 10 38 16 32 14C32 14 36 10 44 10Z"
          fill={color}
          opacity="0.12"
        />
        {/* Thin stem lines */}
        <line x1="16" y1="10" x2="22" y2="10" stroke={color} strokeWidth="0.4" opacity="0.25" />
        <line x1="26" y1="10" x2="32" y2="10" stroke={color} strokeWidth="0.4" opacity="0.25" />
      </svg>
    );
  }

  if (style === "geometric") {
    return (
      <div className="mx-auto flex items-center justify-center gap-3">
        <div style={{ width: 24 * scale, height: 0.5, background: color, opacity: 0.3 }} />
        <svg
          width={8 * scale}
          height={8 * scale}
          viewBox="0 0 8 8"
          fill="none"
        >
          <path
            d="M4 0L4.9 3.1L8 4L4.9 4.9L4 8L3.1 4.9L0 4L3.1 3.1L4 0Z"
            fill={color}
            opacity="0.4"
          />
        </svg>
        <div style={{ width: 24 * scale, height: 0.5, background: color, opacity: 0.3 }} />
      </div>
    );
  }

  // "lines" — cinematic
  return (
    <div className="mx-auto flex items-center justify-center gap-4">
      <div style={{ width: 32 * scale, height: 0.5, background: color, opacity: 0.3 }} />
      <div style={{ width: 4 * scale, height: 4 * scale, border: `0.5px solid ${color}`, opacity: 0.35, transform: "rotate(45deg)" }} />
      <div style={{ width: 32 * scale, height: 0.5, background: color, opacity: 0.3 }} />
    </div>
  );
}

/** Simple divider line — width adapts to theme */
export function Divider({ theme, color }: { theme: ThemeConfig; color?: string }) {
  return (
    <div
      className="mx-auto"
      style={{
        width: theme.dividerWidth,
        height: 0.5,
        background: color ?? theme.border,
      }}
    />
  );
}
