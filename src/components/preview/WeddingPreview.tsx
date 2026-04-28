"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWedding } from "@/context/WeddingContext";
import { getTheme } from "@/lib/themes";
import { withDummyFallback } from "@/lib/dummyData";
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
import SectionLock from "./SectionLock";

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_MAX_WIDTH: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function WeddingPreview() {
  const { data, generating, scrollTarget, setScrollTarget, demoMode } = useWedding();
  const scrollRef = useRef<HTMLDivElement>(null);
  const baseTheme = getTheme(data.theme);
  // Merge real user data over per-template dummy data so every section
  // always has believable content. Sections stay behind a SectionLock
  // overlay until the user fills the unlocking field(s).
  const displayData = useMemo(() => withDummyFallback(data.theme, data), [data]);

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

    // ─── Color math for derived heading / body colors ─────
    // Convert a hex color to HSL so we can restyle headings/body to a shade
    // of the chosen primary (keeping hue + saturation, retargeting lightness).
    function hexToHsl(hex: string): [number, number, number] {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return [0, 0, l];
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h = 0;
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return [h * 60, s, l];
    }

    function hslToHex(h: number, s: number, l: number): string {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      const to = (v: number) =>
        Math.round((v + m) * 255).toString(16).padStart(2, "0");
      return `#${to(r)}${to(g)}${to(b)}`;
    }

    function deriveShade(hex: string, targetL: number, satCap = 0.7): string {
      const [h, s] = hexToHsl(hex);
      return hslToHex(h, Math.min(s, satCap), targetL);
    }

    // Measure the base template's background lightness. Light backgrounds
    // (> 0.5) get dark derived text; dark backgrounds keep their original
    // light text so contrast doesn't invert into unreadability.
    const [, , bgLightness] = hexToHsl(
      baseTheme.bg.length === 7 ? baseTheme.bg : "#FFFFFF"
    );
    const bgIsLight = bgLightness > 0.5;

    if (isHex(primary)) {
      const derivedText = bgIsLight
        ? deriveShade(primary, 0.18, 0.6)
        : baseTheme.text;
      const derivedMuted = bgIsLight
        ? deriveShade(primary, 0.48, 0.45)
        : baseTheme.textMuted;

      return {
        ...baseTheme,
        text: derivedText,
        textMuted: derivedMuted,
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
    if (!scroller) return;

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
  }, [data, theme, viewport]);

  return (
    <div className="flex h-full flex-col bg-[#F0EDEA]">
      {/* Toolbar — hidden on mobile */}
      {!demoMode && (
        <div className="hidden items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 md:flex">
          <p className="text-[12px] italic text-gray-500">
            Preview your site
          </p>
          <ViewportSwitcher active={viewport} onChange={setViewport} />
        </div>
      )}

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
              name1={displayData.name1} name2={displayData.name2}
              date={displayData.date}
              logoImage={data.logoImage}
              theme={theme}
              viewport={viewport}
            />

            <div id="section-hero">
              <SectionLock
                locked={demoMode ? false : !data.name1 || !data.name2}
                hint="Add your names"
                overlayBg={theme.bg}
              >
                <HeroSection
                  name1={displayData.name1} name2={displayData.name2}
                  date={displayData.date}
                  tagline={displayData.tagline}
                  customImage={data.heroImage ?? displayData.heroImage}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-story">
              <SectionLock
                locked={demoMode ? false : !data.story && !data.welcomeMessage}
                hint="Share your story"
                overlayBg={theme.bg}
              >
                <StorySection
                  story={displayData.story}
                  welcomeMessage={displayData.welcomeMessage}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-countdown">
              <SectionLock
                locked={demoMode ? false : !data.countdownEnabled || !data.date}
                hint="Turn on the countdown"
                overlayBg={theme.bg}
              >
                <CountdownSection
                  date={displayData.date ?? ""}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-details">
              <SectionLock
                locked={demoMode ? false : !data.ceremonyVenue && !data.date}
                hint="Add your venue"
                overlayBg={theme.bg}
              >
                <DetailsSection
                  date={displayData.date}
                  ceremonyType={displayData.ceremonyType}
                  ceremonyVenue={displayData.ceremonyVenue}
                  ceremonyAddress={displayData.ceremonyAddress}
                  receptionVenue={displayData.receptionVenue}
                  receptionAddress={displayData.receptionAddress}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-timeline">
              <SectionLock
                locked={demoMode ? false : !data.timeline || data.timeline.length === 0}
                hint="Add your timeline"
                overlayBg={theme.bg}
              >
                <TimelineSection
                  timeline={displayData.timeline ?? []}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-dresscode">
              <SectionLock
                locked={demoMode ? false : !data.dressCode}
                hint="Set a dress code"
                overlayBg={theme.bg}
              >
                <DressCodeSection
                  dressCode={displayData.dressCode ?? ""}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>

            <div id="section-rsvp">
              <SectionLock
                locked={demoMode ? false : !data.rsvpEnabled}
                hint="Turn on RSVP"
                overlayBg={theme.bg}
              >
                <RsvpSection theme={theme} viewport={viewport} />
              </SectionLock>
            </div>

            <div id="section-closing">
              <SectionLock
                locked={demoMode ? false : !data.noteToGuests && (!data.name1 || !data.name2)}
                hint="Leave a note for guests"
                overlayBg={theme.bg}
              >
                <ClosingSection
                  name1={displayData.name1} name2={displayData.name2}
                  noteToGuests={displayData.noteToGuests}
                  customImage={data.closingImage ?? displayData.closingImage}
                  theme={theme}
                  viewport={viewport}
                />
              </SectionLock>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
