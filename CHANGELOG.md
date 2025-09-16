# Changelog

## [Unreleased]
- feat: add `formatDate(date)` helper in `scripts/utils.js` to format dates as `YYYY-MM-DD`.
 - feat: add Page 2 `page-2.html` with Blocks `thread` and `fragments`; masonry layout, scratch-off reveal, story thread, text fragmentation, and optional audio slices; extend `styles/main.css` and `scripts/main.js`.
- feat: add Chaos block (Page 3) in `index.html` with interactions (Enter Chaos, Panic Mode via `P`, Fear Reveal hold) per `AGENTS.md` conventions.
  - styles added under `styles/main.css` (chaos block section).
  - behavior wired in `scripts/main.js` (`initChaos`).
 - refactor: split into three pages with unified header nav (`index.html`, `page-2.html`, `page-3.html`); moved Chaos block to `page-3.html`; kept Surreal block on `index.html`; updated README.
- chore: remove unused IDs, unused data-* attributes, and non-essential HTML comments from all HTML pages; retain `aria-*` and required JS hooks.
 - feat: shared modern nav (grid-based) styled under `.site-header*` in `styles/main.css`; added `data-animate` hooks on nav/links.
 - feat: progressive enhancement with GSAP (ESM CDN) for header/nav/section entrance animations; graceful fallback when unavailable.

## 2025-09-10
- style: introduce visual theme and tokens in `styles/main.css` (simple but vibrant). Added CSS variables under `:root`, refreshed header/nav, feature, timeline, surreal card, fragments/thread, and chaos stage styling. Kept all JS hooks and behaviors intact.
- docs: update `AGENTS.md` CSS rules to allow design tokens in Base/typography.
 - feat: add optional design/animation libs via CDN. Linked Open Props tokens and added editorial theme toggle via `html[data-theme="editorial"]` in `index.html` and `page-2.html`. Introduced non-invasive reveal-on-scroll (IntersectionObserver + optional Motion One ESM) in `scripts/main.js`. Added `[data-reveal]` attributes to key elements.
