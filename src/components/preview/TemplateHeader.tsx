"use client";

import { useState } from "react";
import type { ThemeConfig } from "@/lib/themes";
import type { Viewport } from "./ViewportSwitcher";

interface TemplateHeaderProps {
  names?: string;
  date?: string;
  theme: ThemeConfig;
  viewport: Viewport;
}

const NAV_LINKS = ["Our Story", "Details", "RSVP"];

/**
 * Extract initials from "Name1 & Name2" → "N&N"
 * Handles single names, multiple words, etc.
 */
function getInitials(names?: string): string {
  if (!names) return "";
  const parts = names.split(/\s*&\s*/);
  return parts
    .map((p) => p.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("&");
}

export default function TemplateHeader({
  names,
  date,
  theme,
  viewport,
}: TemplateHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = viewport === "mobile";
  const initials = getInitials(names);

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: `${theme.bg}F2`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          padding: isMobile ? "14px 16px" : "14px 32px",
        }}
      >
        {/* Logo — initials monogram */}
        <div className="flex items-center" style={{ gap: isMobile ? 10 : 12 }}>
          {initials ? (
            <div
              className="flex items-center justify-center"
              style={{
                width: isMobile ? 34 : 38,
                height: isMobile ? 34 : 38,
                border: `1.5px solid ${theme.accent}`,
                borderRadius:
                  theme.name === "minimal" ? 6 : theme.name === "cinematic" ? 0 : "50%",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: theme.accent,
                  fontFamily: theme.headingFont,
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 400,
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                }}
              >
                {initials}
              </span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: isMobile ? 34 : 38,
                height: isMobile ? 34 : 38,
                border: `1.5px solid ${theme.border}`,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={theme.textMuted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
          )}

          <div>
            {names ? (
              <p
                className="font-light tracking-tight"
                style={{
                  color: theme.text,
                  fontFamily: theme.headingFont,
                  fontSize: isMobile ? 14 : 16,
                }}
              >
                {names}
              </p>
            ) : (
              <p
                className="font-light tracking-tight"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.headingFont,
                  fontSize: isMobile ? 14 : 16,
                }}
              >
                Love, Coded
              </p>
            )}
            {date && (
              <p
                className="uppercase"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 9,
                  letterSpacing: "0.25em",
                  marginTop: 1,
                }}
              >
                {date}
              </p>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        {!isMobile ? (
          <nav className="flex items-center" style={{ gap: 28 }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                className="uppercase transition-opacity duration-200 hover:opacity-60"
                style={{
                  color: theme.textMuted,
                  fontFamily: theme.bodyFont,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                }}
              >
                {link}
              </a>
            ))}
          </nav>
        ) : (
          /* Mobile hamburger */
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.text}
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <nav
          className="flex flex-col border-t"
          style={{
            borderColor: theme.border,
            background: theme.bg,
            padding: "12px 16px",
            gap: 12,
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setMenuOpen(false)}
              className="uppercase transition-opacity duration-200 hover:opacity-60"
              style={{
                color: theme.textMuted,
                fontFamily: theme.bodyFont,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.2em",
              }}
            >
              {link}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
