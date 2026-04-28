# Contributing Templates

Templates are the visual "outfit" of every wedding site built with Coded with Love. Today we ship 17 — Romantic, Elegant, Minimal, Cinematic, Garden, Modern, Art Deco, Boho, Coastal, Vintage, Daisy, Rustic, Watercolor, Tropical, Whimsical, Regal, Industrial. We'd love more voices.

This guide is for the person adding a new template. You don't need to know the codebase — you need a vibe, a palette, and ten minutes.

## What a template is (without the code talk)

A template is a consistent look AND structure for a wedding site: its background color, its fonts, its little decorative touches between sections, the mood of its photography, and **which sections show up and in what order**. Hero is always first, but the rest is the template's call — Minimal is stripped to 4 sections, Cinematic puts the countdown right after Hero, Industrial leads with logistics. Each template has its own rhythm.

A good template is a **vibe + a structure**, not just a component. "Sunset desert that opens with the love story" is a template. "A dark mode toggle" isn't.

## What makes a template

Every template is a combination of:

- **A vibe** — one short sentence that captures the feeling. *"Sunset desert wedding, warm and free-spirited."*
- **A palette** — 5 colors: background, alt background, text, accent, muted accent. Pick colors that belong together.
- **Two fonts** — a display font for headings (usually a serif or script) and a body font (usually a sans-serif). Both from Google Fonts.
- **An ornament style** — the decorative mark between sections. Four exist: *floral, geometric, lines, none.* Pick one, or propose a new one.
- **Hero and closing images** — two photos from Unsplash (or uploaded) that capture the mood.
- **A section list** — which of the 16 available sections appear, and in what order. Hero is always first; everything else is up to the template's character.

Think of it like styling a real wedding — the invitations, the menu cards, the signage, the venue mood board. It's a coherent visual *and structural* language.

## The 16 sections you can pick from

**Core:** Hero, Our Story, Countdown, Details, Timeline, Dress Code, RSVP, Closing Note

**Optional:** Gallery (photos), Travel (hotels / parking), Registry (gift links), FAQ, Wedding Party (bridesmaids/groomsmen), Map (venue location), Hashtag & Music (Spotify embed), Save the Date (pre-wedding banner)

A user can later add or remove any of these — but the template chooses the **default** set, which is what couples see when they pick that template.

## How to add one

1. Clone the repo, run `npm install` then `npm run dev`.
2. Open Claude Code in the project root.
3. Paste this brief into Claude (fill in the blanks — anything you're not sure about, write `?` and Claude will ask):

```
/theme-variant

Name:          
Label:         
Vibe:          
Palette:       
Heading font:  
Body font:     
Ornament:      
Hero image:    
Closing image: 
Sections:      (which sections appear, in what order — leave blank to inherit the default 8)
```

4. Claude reads the skill, fills in any gaps, and makes all the file edits.
5. Visit [`localhost:3000`](http://localhost:3000). Your template shows up as a card on the landing page.
6. Click it. You're dropped into the builder with your template applied.
7. Iterate — ask Claude things like *"make the accent warmer"*, *"the heading feels heavy — try a lighter weight"*, *"swap the hero for a candlelit image"*. Claude will make the edits.
8. When happy, commit and open a PR.

## When it's done

A new template is done when:

- ☐ It shows up in the landing page's template gallery.
- ☐ It's selectable in the builder's template picker modal (click "Change" in Step 1).
- ☐ Its `sections` array renders the chosen section list in the chosen order.
- ☐ It renders cleanly on desktop, tablet, and mobile.
- ☐ It feels *visibly different* from the others — not a reskin. Different sections / order helps; not just colors.
- ☐ `npm run build` passes.

## Going deeper

This guide covers adding one new theme. For the broader design-with-Claude workflow — refining existing themes, palette work, ornament variants, and the brief→screenshot→critique loop — see [DESIGN.md](./DESIGN.md).

## Not sure where to start?

Easiest path: take one of the existing 17 and riff on it. "Cinematic but lighter" or "Romantic with a nighttime mood" are legit starting points. Ask Claude: *"Show me how Elegant is configured, then build a new template called Moody based on it."*

## Philosophy

- **One hero moment per template.** Each template should have a signature feeling: Romantic's soft florals, Elegant's geometric crispness, Minimal's negative space, Cinematic's gold-on-black. Yours should have one too.
- **Two-font max.** More than two fonts in a template starts to feel like a Canva accident.
- **Distinct, not reskinned.** If your template and one of the existing 17 could be confused in a screenshot, you need more differentiation — usually in typography, ornament, or **section structure**, not just color.
- **Use the section list as a tool.** A formal template can lead with Details + Dress Code (Regal does); a casual outdoor template can skip both Countdown and Dress Code (Garden does); a story-driven template can put Story right after Hero (Boho). Same 16 sections in 17 different orders gives 17 genuinely different sites.
- **Don't ship something you wouldn't send to a friend.** A couple is going to pick this to represent one of the most important days of their life. Treat the bar accordingly.

## Questions

Ask Claude. It has full context:

- *"What's the simplest existing template to copy?"* → Elegant.
- *"What ornament styles exist?"* → floral, geometric, lines, none.
- *"Where does the hero image come from?"* → Template config points to a URL; Unsplash is the default source.
- *"How do I preview only my new template?"* → Visit `/builder?theme=<your-slug>`.
- *"Can I propose a new ornament style?"* → Yes. Tell Claude in the brief; it'll add the SVG branch.
