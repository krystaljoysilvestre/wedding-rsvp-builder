"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWedding } from "@/context/WeddingContext";
import { getTheme } from "@/lib/themes";
import ViewportSwitcher, { type Viewport } from "./ViewportSwitcher";
import TemplateHeader from "./TemplateHeader";
import HeroSection from "./HeroSection";
import StorySection from "./StorySection";
import DetailsSection from "./DetailsSection";
import TimelineSection from "./TimelineSection";
import CountdownSection from "./CountdownSection";
import DressCodeSection from "./DressCodeSection";
import RsvpSection from "./RsvpSection";
import ClosingSection from "./ClosingSection";

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_MAX_WIDTH: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function WeddingPreview() {
  const { data, generating, scrollTarget, setScrollTarget } = useWedding();
  const scrollRef = useRef<HTMLDivElement>(null);
  const baseTheme = getTheme(data.theme);
  const hasData = Boolean(data.name1);

  // Merge custom color motif into theme — colors, images, overlay
  const theme = useMemo(() => {
    if (!data.colors?.primary) return baseTheme;
    const primary = data.colors.primary;
    const accent = data.colors.accent || primary;
    const key = `${primary}&${accent}`.toLowerCase();

    // Curated images matched to popular color palettes
    const IMAGE_MAP: Record<string, { hero: string; closing: string }> = {
      "#f4c2c2&#d4a843": {
        hero: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1600&q=80",
        closing: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=60",
      },
      "#9caf88&#fffff0": {
        hero: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=80",
        closing: "https://images.unsplash.com/photo-1464699908537-0954e50791ee?w=1200&q=60",
      },
      "#1b2a4a&#c0c0c0": {
        hero: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
        closing: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=60",
      },
      "#6b2737&#fffdd0": {
        hero: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80",
        closing: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60",
      },
    };

    const isHex = (s: string) => /^#[0-9A-Fa-f]{3,8}$/.test(s);
    const matched = IMAGE_MAP[key];

    // Build hex-to-rgba overlay for custom colors
    function hexToOverlay(hex: string, opacity: number): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      if (isNaN(r)) return baseTheme.heroOverlay;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (isHex(primary)) {
      return {
        ...baseTheme,
        accent: primary,
        accentMuted: isHex(accent) ? accent : primary,
        border: `${primary}33`,
        heroOverlay: hexToOverlay(primary, 0.35),
        ...(matched
          ? { heroImage: matched.hero, closingImage: matched.closing }
          : {}),
      };
    }
    return baseTheme;
  }, [baseTheme, data.colors]);

  const [viewport, setViewport] = useState<Viewport>("desktop");

  // Scroll to the relevant section when data changes
  useEffect(() => {
    if (!scrollTarget || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`#${scrollTarget}`);
    if (el) {
      // Small delay so the DOM has rendered the new content
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    setScrollTarget(null);
  }, [scrollTarget, setScrollTarget]);

  // GSAP animations
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !hasData) return;

    const ctx = gsap.context(() => {
      // ─── Hero entrance ─────────────────────────────
      const heroTl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Slow cinematic bg zoom
      heroTl.to(".hero-bg", {
        scale: 1.1,
        duration: 12,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });

      // Ornament fades in with rotation
      heroTl.fromTo(
        ".hero-ornament",
        { opacity: 0, scale: 0.6, rotation: -90 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.6 },
        0.2
      );

      // Tagline slides up
      heroTl.fromTo(
        ".hero-tagline",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.4 },
        0.5
      );

      // Names — staggered entrance
      heroTl.fromTo(
        ".hero-name-1",
        { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 1.6 },
        0.8
      );
      heroTl.fromTo(
        ".hero-ampersand",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1.0 },
        1.1
      );
      heroTl.fromTo(
        ".hero-name-2",
        { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 1.6 },
        1.2
      );

      // Divider expands from center
      heroTl.fromTo(
        ".hero-divider",
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 1.2 },
        1.6
      );

      // Date fades in
      heroTl.fromTo(
        ".hero-date",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.0 },
        1.8
      );

      // Scroll hint — subtle pulse
      heroTl.fromTo(
        ".hero-scroll-hint",
        { opacity: 0 },
        { opacity: 1, duration: 1.0 },
        2.2
      );
      gsap.to(".hero-scroll-hint", {
        opacity: 0.3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3,
      });

      // ─── Scroll-triggered reveals ──────────────────
      const sections = scroller.querySelectorAll(".reveal-section");
      sections.forEach((section) => {
        // Stagger child elements in
        const children = section.querySelectorAll(
          "p, h1, h2, h3, label, div:not(.absolute):not([class*='bg-']), input, button, svg"
        );

        gsap.fromTo(
          children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              scroller: scroller,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ─── Parallax on closing bg ────────────────────
      gsap.to(".closing-bg", {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: ".closing-bg",
          scroller: scroller,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, scrollRef);

    return () => ctx.revert();
  }, [data, theme, hasData, viewport]);

  return (
    <div className="flex h-full flex-col bg-[#F0EDEA]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Preview
        </p>
        <ViewportSwitcher active={viewport} onChange={setViewport} />
      </div>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading overlay */}
        {generating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#F0EDEA]/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center gap-2">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#B8A48E] [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#B8A48E] [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#B8A48E]" />
              </div>
              <p className="text-sm font-medium text-[#5C4F3D]">
                Crafting your website...
              </p>
              <p className="mt-1 text-[11px] text-[#A09580]">
                Generating personalized content with AI
              </p>
            </div>
          </div>
        )}

        {/* Viewport frame */}
        <div
          className="mx-auto h-full transition-[max-width] duration-500 ease-out"
          style={{
            maxWidth: VIEWPORT_MAX_WIDTH[viewport],
            boxShadow:
              viewport !== "desktop"
                ? "0 0 0 1px rgba(0,0,0,0.06), 0 25px 50px -12px rgba(0,0,0,0.15)"
                : "none",
          }}
        >
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto"
            style={{
              background: theme.bg,
              transition: "background 0.6s ease",
            }}
          >
            <TemplateHeader
              name1={data.name1} name2={data.name2}
              date={data.date}
              logoImage={data.logoImage}
              theme={theme}
              viewport={viewport}
            />

            {hasData ? (
              <>
                <div id="section-hero">
                  <HeroSection
                    name1={data.name1} name2={data.name2}
                    date={data.date}
                    tagline={data.tagline}
                    customImage={data.heroImage}
                    theme={theme}
                    viewport={viewport}
                  />
                </div>

                {(data.story || data.welcomeMessage) && (
                  <div id="section-story">
                    <StorySection
                      story={data.story}
                      welcomeMessage={data.welcomeMessage}
                      theme={theme}
                      viewport={viewport}
                    />
                  </div>
                )}

                {data.countdownEnabled && data.date && (
                  <div id="section-countdown">
                    <CountdownSection
                      date={data.date}
                      theme={theme}
                      viewport={viewport}
                    />
                  </div>
                )}

                {(data.ceremonyVenue || data.date) && (
                  <div id="section-details">
                    <DetailsSection
                      date={data.date}
                      ceremonyType={data.ceremonyType}
                      ceremonyVenue={data.ceremonyVenue}
                      ceremonyAddress={data.ceremonyAddress}
                      receptionVenue={data.receptionVenue}
                      receptionAddress={data.receptionAddress}
                      theme={theme}
                      viewport={viewport}
                    />
                  </div>
                )}

                {data.timeline && data.timeline.length > 0 && (
                  <div id="section-timeline">
                    <TimelineSection
                      timeline={data.timeline}
                      theme={theme}
                      viewport={viewport}
                    />
                  </div>
                )}

                {data.dressCode && (
                  <div id="section-dresscode">
                    <DressCodeSection
                      dressCode={data.dressCode}
                      theme={theme}
                      viewport={viewport}
                    />
                  </div>
                )}

                {data.rsvpEnabled && (
                  <div id="section-rsvp">
                    <RsvpSection theme={theme} viewport={viewport} />
                  </div>
                )}

                <div id="section-closing">
                  <ClosingSection
                    name1={data.name1} name2={data.name2}
                    noteToGuests={data.noteToGuests}
                    customImage={data.closingImage}
                    theme={theme}
                    viewport={viewport}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center px-8">
                <div className="text-center">
                  <div
                    className="mx-auto mb-5 h-px w-12"
                    style={{ background: theme.border }}
                  />
                  <p
                    className="text-3xl font-light tracking-tight"
                    style={{ color: theme.text, fontFamily: theme.headingFont }}
                  >
                    Your wedding website
                  </p>
                  <p
                    className="mt-3 text-sm"
                    style={{ color: theme.textMuted, fontFamily: theme.bodyFont }}
                  >
                    Answer a few questions and watch it come to life.
                  </p>
                  <div
                    className="mx-auto mt-5 h-px w-12"
                    style={{ background: theme.border }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
