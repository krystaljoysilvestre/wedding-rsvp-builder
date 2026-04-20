# Contributing Templates

Templates are the visual "outfit" of every wedding site built with Coded with Love. Today we ship four — Romantic, Elegant, Minimal, Cinematic. We'd love more voices.

This guide is for the person adding a new template. You don't need to know the codebase — you need a vibe, a palette, and ten minutes.

## What a template is (without the code talk)

A template is a consistent look for a wedding site: its background color, its fonts, its little decorative touches between sections, the mood of its photography. The sections themselves (hero, story, timeline, RSVP) are the same for every template. What changes is the *feeling*.

A good template is a **vibe**, not a component. "Sunset desert" is a template. "A dark mode toggle" isn't.

## What makes a template

Every template is a combination of:

- **A vibe** — one short sentence that captures the feeling. *"Sunset desert wedding, warm and free-spirited."*
- **A palette** — 5 colors: background, alt background, text, accent, muted accent. Pick colors that belong together.
- **Two fonts** — a display font for headings (usually a serif or script) and a body font (usually a sans-serif). Both from Google Fonts.
- **An ornament style** — the decorative mark between sections. Four exist: *floral, geometric, lines, none.* Pick one, or propose a new one.
- **Hero and closing images** — two photos from Unsplash (or uploaded) that capture the mood.

Think of it like styling a real wedding — the invitations, the menu cards, the signage, the venue mood board. It's a coherent visual language.

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
```

4. Claude reads the skill, fills in any gaps, and makes all the file edits.
5. Visit [`localhost:3000`](http://localhost:3000). Your template shows up as a card on the landing page.
6. Click it. You're dropped into the builder with your template applied.
7. Iterate — ask Claude things like *"make the accent warmer"*, *"the heading feels heavy — try a lighter weight"*, *"swap the hero for a candlelit image"*. Claude will make the edits.
8. When happy, commit and open a PR.

## When it's done

A new template is done when:

- ☐ It shows up in the landing page's template gallery.
- ☐ It's selectable in the builder's TemplateSwitcher pills.
- ☐ It renders cleanly on desktop, tablet, and mobile.
- ☐ It feels *visibly different* from the other four — not a reskin.
- ☐ `npm run build` passes.

## Not sure where to start?

Easiest path: take one of the existing four and riff on it. "Cinematic but lighter" or "Romantic with a nighttime mood" are legit starting points. Ask Claude: *"Show me how Elegant is configured, then build a new template called Moody based on it."*

## Philosophy

- **One hero moment per template.** Each template should have a signature feeling: Romantic's soft florals, Elegant's geometric crispness, Minimal's negative space, Cinematic's gold-on-black. Yours should have one too.
- **Two-font max.** More than two fonts in a template starts to feel like a Canva accident.
- **Distinct, not reskinned.** If your template and one of the existing four could be confused in a screenshot, you need more differentiation — usually in typography or ornament, not just color.
- **Don't ship something you wouldn't send to a friend.** A couple is going to pick this to represent one of the most important days of their life. Treat the bar accordingly.

## Questions

Ask Claude. It has full context:

- *"What's the simplest existing template to copy?"* → Elegant.
- *"What ornament styles exist?"* → floral, geometric, lines, none.
- *"Where does the hero image come from?"* → Template config points to a URL; Unsplash is the default source.
- *"How do I preview only my new template?"* → Visit `/builder?theme=<your-slug>`.
- *"Can I propose a new ornament style?"* → Yes. Tell Claude in the brief; it'll add the SVG branch.
