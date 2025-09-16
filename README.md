# Dream Subconscious — Web Experience Spec

This document is the primary product spec for the site. It describes the narrative arc, layout language, interactions, and copy style across three pages. The underlying scaffold follows semantic HTML, BEM, and ES modules (see `AGENTS.md`).

## Experience Overview

- Information Architecture: three pages move from order to disorder — Surreal Landscapes → Human Dream Fragments → Nightmares & Chaos.
- Grid Language: Page 1 intact grid; Page 2 disrupted/broken grid; Page 3 collapsed/deformed grid.
- Interaction Axis: Hover → Click → Shuffle.
- Text Role: short, aphoristic lines as subconscious prompts.
- Color Rhythm: Page 1 bright; Page 2 soft; Page 3 dark.
- Motion Beat: slow-in → subtle random micro‑motions → urgent.

## Navigation & Global

- Top Navigation: Surreal Landscapes | Human Dream Fragments | Nightmares & Chaos.
- Global Controls: bottom‑right Shuffle; top‑right Info.
- Typography: titles — Playfair; body — Inter; prompts — IBM Plex Mono.
- Audio (optional): chime on hover; page flip on click; breathing sound on shuffle.

## Page 1 — Surreal Landscapes

- Layout: 12‑column × 8‑row grid.
- Hero: floating island (large image).
- Secondary: melting clocks, sky fissures, texture shards.
- Interactions:
  - Hover Parallax: images tilt subtly in 3D.
  - Light Follow: cursor position maps to a moving highlight.
  - Flip Card: front shows image; back reveals Prompt + short line.
  - Gentle Breeze: small random drift animations.
- Copy Examples:
  - Short line: “Have you ever seen the sky split?”
  - Prompt: “floating island, impossible geology, surreal sky”.

## Page 2 — Human Dream Fragments

- Layout: masonry‑style irregular grid with slanted fracture lines in the background.
- Interactions:
  - Memory Erasure (scratch‑off): drag/click to reveal a clean image.
  - Story Thread: choose three cards; a dynamic timeline + generated sentence appears at the top.
  - Text Fragmentation: hover scatters the text, then it re‑aggregates.
  - Audio (optional): clicking a card triggers ambient sound slices.
- Copy Examples:
  - Card Title: “An Uncertain Summer”.
  - Generated Sentence: “I remember he never looked back, but the wind knew.”

## Page 3 — Nightmares & Chaos

- Layout: freely drifting fragment layers over a dark, noisy background.
- Interactions:
  - Enter Chaos: fragments crack, then reassemble into a deformed grid.
  - Panic Mode (P): screen shake + intensified noise.
  - Fear Reveal (press‑and‑hold): reveals cracks/noise layers.
  - Heartbeat Pulse: background shadows breathe with rhythm.
  
Implementation status (structure-first):
- Added a `chaos` Block with semantic HTML and BEM in `page-3.html`.
- Structural motion and states in `styles/main.css` (no visual theming yet).
- Behavior wired in `scripts/main.js` using data-* hooks and delegation.
- Controls: “Enter Chaos” button, “Fear Reveal (Hold)” button, and `P` key.
- Copy Examples:
  - “Night keeps you hidden between its teeth.”
  - “Waking is another kind of fall.”

## Shuffle

- Page 1: randomize item positions within the grid.
- Page 2: reassign card heights.
- Page 3: recalculate fragment drift paths.

---

## Project Scaffold

This repository is initialized as a clean, structure‑first web project. The focus is on semantic HTML, strict parent–child hierarchy, BEM naming, and clean separation of concerns across HTML/CSS/JS.

### Folder Layout

```
index.html
styles/
  main.css
scripts/
  main.js
assets/
  images/
    .gitkeep
README.md
AGENTS.md
```

### Open Locally

- Option 1: open `index.html` directly in your browser.
- Option 2: serve locally (recommended) using any static server, for example:
  - Python: `python -m http.server` then visit `http://localhost:8000`
  - Node: `npx serve .` (or any similar static server)

Pages:
- Page 1: `index.html`
- Page 2: `page-2.html`
- Page 3: `page-3.html`

### Conventions (Summary)

- Semantic HTML sections: `header`, `main`, `section`, `article`, `footer`, `nav`.
- One `<h1>` per page; use `<h2>` for section headings inside Blocks.
- BEM naming: `block`, `block__element`, `block--modifier`.
- Each top‑level `section` in `<main>` is a Block.
- Use `data-*` attributes for JavaScript hooks; avoid class‑based behavior.
- External links: `target="_blank"` and `rel="noopener noreferrer"`.
- Images have meaningful `alt`; prefer `figure`/`figcaption` for captions.
- HTML for structure, CSS for presentation, JS for behavior.
- ES modules in `scripts/main.js`; prefer event delegation and scoped DOM queries.

For full details, see `AGENTS.md`.

### Page 1 — Implementation Notes

- Block: `.surreal` inside `main` (`#surreal`).
- Layout: 12 × 8 CSS Grid; main flip card centered; secondary elements positioned around.
- Interactions (implemented in `scripts/main.js`):
  - Hover Parallax: card tilts subtly with cursor.
  - Light Follow: highlight tracks mouse via CSS variables.
  - Flip Card: button toggles front image ↔ back text (Prompt + short line).
  - Breeze: secondary elements drift with randomized motion.
- Placeholder asset: `assets/images/placeholder-floating-island.svg` (replace later).

### Page 2 �� Implementation Notes

- Blocks: `.thread` (Story Thread) and `.fragments` (masonry grid).
- Layout: CSS columns for masonry; tilted fracture lines rendered via `repeating-linear-gradient` background on `.fragments`.
- Interactions (implemented in `scripts/main.js`):
  - Memory Erasure: drag on each card’s canvas to reveal the clear image beneath (destination-out erasing).
  - Story Thread: select three cards via the “选择” button; three dots at the top fill left-to-right and the sentence appears.
  - Text Fragmentation: hovering a card scatters the title letters, then they re-aggregate on mouse out.
  - Audio (optional): selecting a card plays a short ambient slice via WebAudio (no external assets).
- Copy: default card title is “不确定的夏天”; generated sentence is “我记得他从未回头，但风知道。”
