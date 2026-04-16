"use client";

import { useState } from "react";
import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";
import Ornament from "./Ornament";

interface RsvpSectionProps {
  theme: ThemeConfig;
  viewport: Viewport;
}

export default function RsvpSection({ theme, viewport }: RsvpSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const isMobile = viewport === "mobile";

  return (
    <section
      className="reveal-section"
      style={{
        background: theme.bg,
        padding: isMobile ? theme.sectionPaddingMobile : theme.sectionPadding,
      }}
    >
      <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
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
          RSVP
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
            fontSize: isMobile ? 18 : 22,
          }}
        >
          We would be honored by your presence
        </p>

        {!submitted ? (
          <div className="mt-12 space-y-6" style={{ textAlign: "left" }}>
            <div>
              <label
                className="block uppercase"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 9,
                  letterSpacing: theme.labelSpacing,
                  marginBottom: 8,
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full border-b-2 bg-transparent py-3 outline-none transition-all duration-300 placeholder:opacity-30"
                style={{
                  color: theme.text,
                  borderColor: theme.border,
                  fontFamily: theme.headingFont,
                  fontSize: 16,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  borderRadius: theme.borderRadius,
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.accent)}
                onBlur={(e) => (e.target.style.borderColor = theme.border)}
              />
            </div>

            <div>
              <label
                className="block uppercase"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 9,
                  letterSpacing: theme.labelSpacing,
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Email address"
                className="w-full border-b-2 bg-transparent py-3 outline-none transition-all duration-300 placeholder:opacity-30"
                style={{
                  color: theme.text,
                  borderColor: theme.border,
                  fontFamily: theme.headingFont,
                  fontSize: 16,
                  fontWeight: theme.headingWeight,
                  fontStyle: theme.headingStyle,
                  borderRadius: theme.borderRadius,
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.accent)}
                onBlur={(e) => (e.target.style.borderColor = theme.border)}
              />
            </div>

            <div
              className="pt-8"
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "center",
                gap: isMobile ? 12 : 16,
              }}
            >
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                onMouseEnter={() => setHovered("accept")}
                onMouseLeave={() => setHovered(null)}
                className="border transition-all duration-500"
                style={{
                  color: theme.bg,
                  background: hovered === "accept" ? theme.accentMuted : theme.accent,
                  borderColor: theme.accent,
                  fontFamily: theme.bodyFont,
                  padding: "14px 36px",
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: theme.labelSpacing,
                  borderRadius: theme.borderRadius,
                }}
              >
                Joyfully Accept
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                onMouseEnter={() => setHovered("decline")}
                onMouseLeave={() => setHovered(null)}
                className="border transition-all duration-500"
                style={{
                  color: hovered === "decline" ? theme.text : theme.textMuted,
                  background: "transparent",
                  borderColor: hovered === "decline" ? theme.accent : theme.border,
                  fontFamily: theme.bodyFont,
                  padding: "14px 36px",
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: theme.labelSpacing,
                  borderRadius: theme.borderRadius,
                }}
              >
                Regretfully Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="mx-auto mb-4"
            >
              <circle cx="16" cy="16" r="15" stroke={theme.accent} strokeWidth="0.5" />
              <path
                d="M10 16.5L14 20.5L22 12.5"
                stroke={theme.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              style={{
                color: theme.text,
                fontFamily: theme.headingFont,
                fontWeight: theme.headingWeight,
                fontStyle: theme.headingStyle,
                fontSize: 18,
              }}
            >
              Thank you
            </p>
            <p
              className="mt-2"
              style={{
                color: theme.textMuted,
                fontFamily: theme.bodyFont,
                fontSize: 13,
              }}
            >
              We look forward to celebrating with you.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
