"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    name: "Romantic",
    desc: "Soft serifs, warm blush tones, and botanical flourishes for the hopeless romantics.",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    colors: ["#FDF8F4", "#C4917B", "#3D2B1F"],
    font: "var(--font-cormorant), serif",
  },
  {
    name: "Elegant",
    desc: "High-contrast serif headings, clean lines, and monochrome sophistication.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    colors: ["#FFFFFF", "#0A0A0A", "#6B6B6B"],
    font: "var(--font-playfair), serif",
  },
  {
    name: "Minimal",
    desc: "Clean geometric sans-serif, airy spacing, and understated beauty.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    colors: ["#FAFAFA", "#555555", "#1A1A1A"],
    font: "var(--font-inter), sans-serif",
  },
  {
    name: "Cinematic",
    desc: "Dark, dramatic, gold-accented — like the opening credits of your love story.",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    colors: ["#0C0C0C", "#C9A96E", "#F2E8D5"],
    font: "var(--font-cinzel), serif",
  },
];

const FEATURES = [
  {
    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    title: "Conversational Builder",
    desc: "No forms, no drag-and-drop. Just a warm conversation that builds your site step by step.",
  },
  {
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z",
    title: "AI-Powered Content",
    desc: "Taglines, love stories, welcome messages — generated with the perfect tone for your celebration.",
  },
  {
    icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Live Preview",
    desc: "Watch your wedding website come to life in real time as you answer each question.",
  },
  {
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    title: "Fully Responsive",
    desc: "Preview your site on desktop, tablet, and mobile — it looks stunning everywhere.",
  },
  {
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    title: "Romantic Themes",
    desc: "Four hand-crafted themes — each with unique fonts, ornaments, colors, and animations.",
  },
  {
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    title: "GSAP Animations",
    desc: "Cinematic entrance effects, scroll reveals, parallax, and elegant micro-interactions.",
  },
];

const STEPS_DATA = [
  { num: "01", title: "Whisper your story", desc: "Our AI planner asks the sweetest questions — your names, your date, the place where it all begins." },
  { num: "02", title: "Watch love take shape", desc: "With every answer, your wedding website blooms in real time — cinematic, elegant, and entirely yours." },
  { num: "03", title: "Share the joy", desc: "Preview it on any device, perfect every detail, then share the page that celebrates your forever." },
];

// ─── Floating particles ──────────────────────────────────────────────

// Pre-computed particle positions to avoid SSR/client hydration mismatch
const PARTICLE_DATA = [
  { w: 2.1, o: 0.18, l: 12, t: 45 }, { w: 1.4, o: 0.09, l: 78, t: 23 },
  { w: 3.2, o: 0.25, l: 34, t: 67 }, { w: 1.8, o: 0.12, l: 91, t: 8 },
  { w: 2.6, o: 0.21, l: 56, t: 82 }, { w: 1.2, o: 0.07, l: 23, t: 51 },
  { w: 3.0, o: 0.28, l: 67, t: 34 }, { w: 1.6, o: 0.14, l: 45, t: 91 },
  { w: 2.4, o: 0.16, l: 8, t: 72 },  { w: 1.9, o: 0.22, l: 82, t: 15 },
  { w: 2.8, o: 0.11, l: 51, t: 58 }, { w: 1.3, o: 0.19, l: 15, t: 38 },
  { w: 3.5, o: 0.08, l: 72, t: 5 },  { w: 2.0, o: 0.24, l: 38, t: 78 },
  { w: 1.5, o: 0.13, l: 95, t: 42 }, { w: 2.7, o: 0.17, l: 5, t: 88 },
  { w: 1.7, o: 0.26, l: 60, t: 19 }, { w: 3.1, o: 0.10, l: 28, t: 63 },
  { w: 2.3, o: 0.20, l: 85, t: 31 }, { w: 1.1, o: 0.15, l: 42, t: 95 },
];

function Particles() {
  return (
    <div className="lp-particles pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLE_DATA.map((p, i) => (
        <div
          key={i}
          className="lp-particle absolute rounded-full"
          style={{
            width: p.w,
            height: p.w,
            background: `rgba(201, 169, 110, ${p.o})`,
            left: `${p.l}%`,
            top: `${p.t}%`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ─── Floating particles — slow, dreamy drift ───
      gsap.utils.toArray<HTMLElement>(".lp-particle").forEach((p) => {
        gsap.to(p, {
          x: `random(-60, 60)`,
          y: `random(-100, 30)`,
          duration: `random(14, 28)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // ─── Hero background — very slow cinematic zoom ─
      gsap.to(".lp-hero-bg", {
        scale: 1.12,
        duration: 30,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });

      // ─── Hero entrance — slow, intentional, romantic ─
      const heroTl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      // Ornament — gentle, slow rotation
      heroTl.fromTo(
        ".lp-hero-ornament",
        { opacity: 0, scale: 0.5, rotation: -90 },
        { opacity: 1, scale: 1, rotation: 0, duration: 3, ease: "power2.inOut" },
        0
      );

      // Badge — soft fade
      heroTl.fromTo(
        ".lp-hero-badge",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 2 },
        1.0
      );

      // Title characters — slow wave, like a whisper
      const titleChars = document.querySelectorAll(".lp-hero-char");
      heroTl.fromTo(
        titleChars,
        { opacity: 0, y: 50, rotateX: -30 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 2.0,
          stagger: 0.06,
          ease: "power3.out",
        },
        1.8
      );

      // Subtitle — breathes in slowly
      heroTl.fromTo(
        ".lp-hero-sub",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 2.4 },
        3.2
      );

      // CTA buttons — gentle appearance
      heroTl.fromTo(
        ".lp-hero-cta-btn",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.8, stagger: 0.3 },
        4.2
      );

      // Scroll indicator — late, gentle
      heroTl.fromTo(
        ".lp-hero-scroll",
        { opacity: 0 },
        { opacity: 1, duration: 2 },
        5.5
      );
      gsap.to(".lp-hero-scroll", {
        y: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 6,
      });

      // ─── Parallax hero layers on scroll ────────────
      gsap.to(".lp-hero-bg", {
        y: 120,
        ease: "none",
        scrollTrigger: {
          trigger: ".lp-hero",
          start: "top top",
          end: "bottom top",
          scrub: 2,
        },
      });
      gsap.to(".lp-hero-content", {
        y: -50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".lp-hero",
          start: "60% top",
          end: "bottom top",
          scrub: 2,
        },
      });

      // ─── Section heading reveals — slow wipe ───────
      gsap.utils.toArray<HTMLElement>(".lp-heading-line").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 2.0,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ─── Generic scroll reveals — gentle rise ──────
      gsap.utils.toArray<HTMLElement>(".lp-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ─── Template cards — slow stagger ─────────────
      gsap.fromTo(
        ".lp-template-card",
        { opacity: 0, y: 60, rotateY: -5 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1.6,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".lp-templates-grid",
            start: "top 84%",
            toggleActions: "play none none none",
          },
        }
      );

      // ─── Steps — slow, graceful entrance ───────────
      gsap.utils.toArray<HTMLElement>(".lp-step").forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
        tl.fromTo(
          el.querySelector(".lp-step-num"),
          { opacity: 0, scale: 1.5, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: "power2.out" }
        );
        tl.fromTo(
          el.querySelector(".lp-step-line"),
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: "power2.inOut" },
          0.4
        );
        tl.fromTo(
          el.querySelector(".lp-step-title"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" },
          0.8
        );
        tl.fromTo(
          el.querySelector(".lp-step-desc"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" },
          1.2
        );
      });

      // ─── Feature cards — slow, gentle stagger ──────
      gsap.fromTo(
        ".lp-feature",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          stagger: 0.18,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".lp-features-grid",
            start: "top 84%",
            toggleActions: "play none none none",
          },
        }
      );

      // ─── CTA parallax bg — dreamy ─────────────────
      gsap.to(".lp-cta-bg", {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: ".lp-cta",
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate template showcase
  useEffect(() => {
    const id = setInterval(() => {
      setActiveTemplate((p) => (p + 1) % TEMPLATES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Split title into characters for wave animation
  const titleText = "Coded with Love";
  const titleChars = titleText.split("").map((ch, i) => (
    <span
      key={i}
      className="lp-hero-char inline-block opacity-0"
      style={{ perspective: 600 }}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));

  return (
    <div ref={pageRef} className="overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="lp-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6">
        {/* Bg image with parallax */}
        <div
          className="lp-hero-bg absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80')",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]" />

        {/* Floating particles */}
        <Particles />

        {/* Content */}
        <div className="lp-hero-content relative z-10 mx-auto max-w-3xl text-center">
          {/* Decorative ornament */}
          <div className="lp-hero-ornament mx-auto mb-8 opacity-0">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto">
              <circle cx="32" cy="32" r="30" stroke="rgba(201,169,110,0.15)" strokeWidth="0.5" />
              <circle cx="32" cy="32" r="20" stroke="rgba(201,169,110,0.1)" strokeWidth="0.5" />
              <circle cx="32" cy="32" r="10" stroke="rgba(201,169,110,0.08)" strokeWidth="0.5" />
              <circle cx="32" cy="32" r="2" fill="rgba(201,169,110,0.3)" />
            </svg>
          </div>

          {/* Badge */}
          <div className="lp-hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 opacity-0 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              <path d="M9.5 10l-2 2 2 2" strokeWidth={2} />
              <path d="M14.5 10l2 2-2 2" strokeWidth={2} />
            </svg>
            <span className="text-xs font-medium text-white/60" style={{ fontFamily: "var(--font-dm-sans)" }}>
              AI-Powered Wedding Websites
            </span>
          </div>

          {/* Title — character-split wave reveal */}
          <h1
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#F2E8D5",
              letterSpacing: "-0.02em",
            }}
          >
            {titleChars}
          </h1>

          {/* Subtitle */}
          <p
            className="lp-hero-sub mx-auto mt-6 max-w-lg opacity-0"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              fontWeight: 400,
              lineHeight: 1.8,
              color: "rgba(242, 232, 213, 0.5)",
            }}
          >
            Because every love story deserves to be told beautifully.
            Have a gentle conversation with AI, and watch as your
            wedding website unfolds — like the first chapter of forever.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/builder"
              className="lp-hero-cta-btn group inline-flex items-center gap-2 rounded-none border border-[#C9A96E] bg-[#C9A96E] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A] opacity-0 transition-all duration-500 hover:bg-transparent hover:text-[#C9A96E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Begin Your Story
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#templates"
              className="lp-hero-cta-btn inline-flex items-center gap-2 px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white/40 opacity-0 transition-colors duration-300 hover:text-white/70"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Explore Styles
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="lp-hero-scroll absolute bottom-10 opacity-0">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Scroll
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ─── Templates ────────────────────────────────── */}
      <section id="templates" className="bg-[#FAFAF8] px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p
              className="lp-reveal text-[10px] font-medium uppercase tracking-[0.5em] text-[#B8A48E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Find Your Aesthetic
            </p>
            <h2
              className="lp-heading-line mt-4"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#1A1A1A",
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              A style for every kind of love
            </h2>
            <p
              className="lp-reveal mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#888]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Hand-crafted templates with unique typography, ornaments, and
              animations — each one designed to make hearts flutter.
            </p>
          </div>

          {/* Template selector dots */}
          <div className="mt-10 flex justify-center gap-2">
            {TEMPLATES.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActiveTemplate(i)}
                className="flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-medium uppercase tracking-[0.15em] transition-all duration-400"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  borderColor: activeTemplate === i ? t.colors[1] : "#E0E0E0",
                  background: activeTemplate === i ? `${t.colors[1]}12` : "white",
                  color: activeTemplate === i ? t.colors[1] : "#999",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full transition-colors duration-400"
                  style={{ background: t.colors[1] }}
                />
                {t.name}
              </button>
            ))}
          </div>

          <div className="lp-templates-grid mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t, i) => (
              <Link
                key={t.name}
                href="/builder"
                className={`lp-template-card group relative overflow-hidden rounded-lg opacity-0 transition-all duration-500 ${
                  activeTemplate === i
                    ? "scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
                style={{
                  background: t.colors[0],
                  outline: activeTemplate === i ? `2px solid ${t.colors[1]}` : "none",
                  outlineOffset: 4,
                }}
                onMouseEnter={() => setActiveTemplate(i)}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url('${t.image}')` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to bottom, ${t.colors[0]}00 30%, ${t.colors[0]} 100%)` }}
                  />
                </div>

                {/* Content */}
                <div className="relative px-5 pb-6 pt-2" style={{ background: t.colors[0] }}>
                  <div className="mb-3 flex gap-1.5">
                    {t.colors.map((c, j) => (
                      <div
                        key={j}
                        className="h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-110"
                        style={{ background: c, border: c === "#FFFFFF" || c === "#FAFAFA" ? "1px solid #E5E5E5" : "none" }}
                      />
                    ))}
                  </div>
                  <h3 className="text-lg" style={{ fontFamily: t.font, fontWeight: 400, color: t.colors[2] }}>
                    {t.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", color: `${t.colors[2]}99` }}>
                    {t.desc}
                  </p>
                  <div
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.25em] transition-all duration-300 group-hover:gap-3"
                    style={{ fontFamily: "var(--font-dm-sans)", color: t.colors[1] }}
                  >
                    Use this template
                    <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────── */}
      <section className="bg-white px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p
              className="lp-reveal text-[10px] font-medium uppercase tracking-[0.5em] text-[#B8A48E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              How the Magic Happens
            </p>
            <h2
              className="lp-heading-line mt-4"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#1A1A1A",
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              From &ldquo;I do&rdquo; to done — in three gentle steps
            </h2>
          </div>

          <div className="mt-20 grid gap-16 sm:grid-cols-3">
            {STEPS_DATA.map((s) => (
              <div key={s.num} className="lp-step text-center">
                <p
                  className="lp-step-num text-5xl font-light opacity-0"
                  style={{ fontFamily: "var(--font-playfair), serif", color: "#E8D5C4" }}
                >
                  {s.num}
                </p>
                <div
                  className="lp-step-line mx-auto mt-4 h-px w-12 origin-left"
                  style={{ background: "#E8D5C4", transform: "scaleX(0)" }}
                />
                <h3
                  className="lp-step-title mt-5 text-base font-medium opacity-0"
                  style={{ fontFamily: "var(--font-dm-sans)", color: "#1A1A1A" }}
                >
                  {s.title}
                </h3>
                <p
                  className="lp-step-desc mt-2 text-[13px] leading-relaxed opacity-0"
                  style={{ fontFamily: "var(--font-dm-sans)", color: "#888" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────── */}
      <section className="bg-[#FAFAF8] px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p
              className="lp-reveal text-[10px] font-medium uppercase tracking-[0.5em] text-[#B8A48E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Features
            </p>
            <h2
              className="lp-heading-line mt-4"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#1A1A1A",
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              Crafted with love, down to every detail
            </h2>
          </div>

          <div className="lp-features-grid mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="lp-feature group rounded-lg border border-[#E8E4DE] bg-white p-6 opacity-0 transition-all duration-500 hover:-translate-y-1 hover:border-[#C9A96E]/30 hover:shadow-xl hover:shadow-[#C9A96E]/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D5C4]/50 transition-colors duration-300 group-hover:border-[#C9A96E]/30 group-hover:bg-[#C9A96E]/5">
                  <svg
                    className="h-5 w-5 text-[#C4917B] transition-colors duration-300 group-hover:text-[#C9A96E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold" style={{ fontFamily: "var(--font-dm-sans)", color: "#1A1A1A" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", color: "#888" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────── */}
      <section className="lp-cta relative overflow-hidden bg-[#0A0A0A] px-6 py-32 sm:py-40">
        <div
          className="lp-cta-bg absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=60')",
            willChange: "transform",
          }}
        />
        <Particles />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="lp-reveal">
            <p
              className="text-[10px] font-medium uppercase tracking-[0.5em] text-[#C9A96E]/50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Your forever starts here
            </p>
            <h2
              className="mt-5"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#F2E8D5",
              }}
            >
              Every love story deserves a page as beautiful as the love itself
            </h2>
            <p
              className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(242, 232, 213, 0.35)" }}
            >
              Let our AI planner guide you through a gentle conversation,
              and in just a few minutes, your love story will have a home
              as beautiful as the day you said yes.
            </p>
            <Link
              href="/builder"
              className="group mt-10 inline-flex items-center gap-2 rounded-none border border-[#C9A96E] bg-[#C9A96E] px-10 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A] transition-all duration-500 hover:bg-transparent hover:text-[#C9A96E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Begin Your Love Story
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              <path d="M9.5 10l-2 2 2 2" strokeWidth={2} />
              <path d="M14.5 10l2 2-2 2" strokeWidth={2} />
            </svg>
            <span className="text-xs font-medium text-[#F2E8D5]/40" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Coded with Love
            </span>
          </div>
          <p className="text-[11px] text-[#F2E8D5]/20" style={{ fontFamily: "var(--font-dm-sans)" }}>
            A portfolio project by a Senior Frontend Engineer
          </p>
        </div>
      </footer>
    </div>
  );
}
