# Repository Guidelines

## Project Structure & Module Organization
- Root files: `index.html`, `README.md`, `AGENTS.md`.
- Styles in `styles/main.css` (single file for now). Add new blocks in Components section.
- Scripts now split per page (`scripts/index.js`, `scripts/page-2.js`, `scripts/page-3.js`) with shared helpers in `scripts/common.js` and `scripts/utils.js`. Keep block logic scoped to block roots.
- Assets in `assets/images/` (keep `.gitkeep` while empty).
- New `<section>` in `<main>` = Block with BEM naming. Log changes in Change Log.

## HTML Rules
- Use semantic elements (`header`, `main`, `section`, `article`, `footer`, `nav`).
- One `<h1>` per page; `<h2>` for block headings.
- Use `data-*` attributes for JS hooks; do not target classes.
- All `<img>` need meaningful `alt`. Use `figure` + `figcaption` when captions exist.
- External links must use `target="_blank"` and `rel="noopener noreferrer"`.
- Attribute order: `id`, `class`, `data-*`, `aria-*`, `href/src`, `type`, `target`, `rel`, `alt`, `title`, `role`.
- Use only relative paths (`./assets/images/...`).

## CSS Rules
- Keep all styles in `styles/main.css` with sections:
  1) Reset/normalize
  2) Base/typography
  3) Layout
  4) Components/Blocks (BEM)
  5) Utilities/helpers
- Order within block: root â†?elements â†?modifiers â†?states.
- Comment block boundaries and parentâ€“child relationships.
- Avoid inline styles and `!important`. Use BEM modifiers.
- Keep structure-oriented styles only (no colors/sizes at this stage).
 - Visual tokens: define colors/spacing/radii as CSS variables under `:root`; keep presentation simple and lively while preserving structure-first principles.
 - External CSS/animation libs may be included via CDN to aid design (e.g., Open Props for tokens, Motion One for animations). Project-specific component styles and overrides remain in `styles/main.css`.

## JS Rules
- ES modules only. Put constants/selectors at the top.
- Prefer event delegation on block root for dynamic children.
- Scope DOM queries to the relevant block root.
- Organize code phases: query â†?bind events â†?update DOM. Comment each phase.
- Use `data-*` attributes for behavior, not class selectors.
 - Optional animation libs can be loaded via ESM CDN with graceful fallback (keep features working without them).

## Formatting Rules
- Indentation: 2 spaces. Encoding: UTF-8. Newlines: LF. End file with newline.
- No trailing spaces.
- Import/link order: CSS before JS; use `defer` and `type="module"`.

## Change Log
- 2025-09-09: Initial scaffold (`index.html`, `styles/main.css`, `scripts/main.js`, `assets/images/.gitkeep`, updated `README.md`, conventions in `AGENTS.md`).
- 2025-09-11: Split into three pages with shared header/nav and grid-based sections. Added `page-2.html` (Human Dream Fragments) and `page-3.html` (Nightmares & Chaos); updated `index.html` to Surreal Landscapes; kept styles in `styles/main.css` and behavior in `scripts/main.js` per BEM/ESM conventions.
 - 2025-09-11: Cleanup â€?removed unused IDs, data attributes, and inline comments from `index.html`, `page-2.html`, and `page-3.html` while preserving JS hooks and accessibility (`aria-*`).
- 2025-09-16: Added chaos echo console with whisper log and fragment pulse states on `page-3.html`, `styles/main.css`, and `scripts/main.js`.
- 2025-09-16: Split legacy `scripts/main.js` into per-page modules (`scripts/index.js`, `scripts/page-2.js`, `scripts/page-3.js`) with shared `scripts/common.js`; updated HTML includes and this guide.

## Agent-Specific Instructions
- Follow this fileâ€™s conventions. Keep changes minimal and scoped.
- Match existing patterns; donâ€™t reformat unrelated files.
- Update this guide if conventions evolve.

