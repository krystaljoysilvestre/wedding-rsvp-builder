"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#templates", label: "Templates" },
  { href: "#how", label: "How It Works" },
  { href: "#features", label: "Features" },
];

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Flip past ~70vh — deep enough that the hero's gradient + subtitle
      // has passed, so the solid header reveals cleanly over the templates.
      const threshold = window.innerHeight * 0.7;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[60] transition-all duration-[400ms] ease-out"
      style={{
        height: scrolled ? 64 : 76,
        background: scrolled
          ? "rgba(253, 251, 247, 0.85)"
          : "linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0) 100%)",
        backdropFilter: scrolled ? "blur(14px) saturate(130%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(130%)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 8px 32px -20px rgba(0,0,0,0.15)" : "none",
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group relative flex items-center gap-2.5"
          style={{
            color: scrolled ? "#1A1A1A" : "#F2E8D5",
            transition: "color 400ms ease",
          }}
        >
          <div className="relative">
            {/* Outer ring — pulse + rotate */}
            <svg
              className="lp-header-logo-ring absolute -inset-1.5 opacity-60"
              viewBox="0 0 40 40"
              fill="none"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke={scrolled ? "#C9A96E" : "#E8D5C4"}
                strokeWidth="0.5"
                strokeDasharray="1 3"
                style={{ transition: "stroke 400ms ease" }}
              />
            </svg>
            {/* Heart + bracket mark */}
            <svg
              className="relative h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: scrolled ? "#C4917B" : "#C9A96E", transition: "color 400ms ease" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              <path d="M9.5 10l-2 2 2 2" strokeWidth={2} />
              <path d="M14.5 10l2 2-2 2" strokeWidth={2} />
            </svg>
          </div>
          <span
            className="text-[15px] sm:text-base"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Coded with Love
          </span>
        </Link>

        {/* Nav — desktop only */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 text-[11px] font-medium uppercase tracking-[0.3em] transition-colors duration-300"
              style={{
                fontFamily: "var(--font-dm-sans)",
                color: scrolled ? "#5C4F3D" : "rgba(242, 232, 213, 0.65)",
              }}
            >
              {link.label}
              <span
                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-400 group-hover:w-full"
                style={{
                  background: scrolled ? "#C4917B" : "#C9A96E",
                }}
              />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/builder"
          className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-none border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] transition-all duration-400 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.3em]"
          style={{
            fontFamily: "var(--font-dm-sans)",
            borderColor: scrolled ? "#1A1A1A" : "#C9A96E",
            background: scrolled ? "#1A1A1A" : "transparent",
            color: scrolled ? "#FDFBF7" : "#F2E8D5",
          }}
        >
          Begin
          <svg
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      {/* Pulse-rotate the logo ring */}
      <style>{`
        @keyframes lp-header-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lp-header-logo-ring {
          animation: lp-header-ring-spin 40s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </header>
  );
}
