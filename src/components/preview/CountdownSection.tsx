"use client";

import { useState, useEffect } from "react";
import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface CountdownSectionProps {
  date?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

function getTimeLeft(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownSection({
  date,
  theme,
  viewport,
}: CountdownSectionProps) {
  // Initialize to zeros so SSR and the first client render produce identical
  // markup. The real countdown is populated in useEffect (client-only) to
  // avoid a hydration mismatch from Date.now() differing between server and
  // client.
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const isMobile = viewport === "mobile";

  useEffect(() => {
    if (!date) return;
    setTime(getTimeLeft(date));
    const id = setInterval(() => setTime(getTimeLeft(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return null;

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
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
          Counting Down
        </p>

        <div className="mt-5">
          <Ornament theme={theme} size="sm" />
        </div>

        <div
          className="mt-10"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: isMobile ? 12 : 24,
          }}
        >
          {units.map((u) => (
            <div key={u.label}>
              <p
                style={{
                  color: theme.text,
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontSize: isMobile ? 28 : 42,
                  lineHeight: 1,
                }}
              >
                {String(u.value).padStart(2, "0")}
              </p>
              <p
                className="mt-2 uppercase"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 9,
                  fontWeight: theme.bodyWeight,
                  letterSpacing: theme.labelSpacing,
                }}
              >
                {u.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
