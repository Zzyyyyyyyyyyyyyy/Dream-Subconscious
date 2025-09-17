// scripts/common.js
// Shared progressive enhancements reused across pages.

const HEADER_SELECTOR = '.site-header';
const NAV_SELECTOR = '[data-animate="nav"]';
const NAV_LINK_SELECTOR = '[data-animate="nav-link"]';
const SURREAL_SELECTOR = '[data-block="surreal"]';
const FRAGMENTS_SELECTOR = '[data-block="fragments"]';
const CHAOS_SELECTOR = '[data-block="chaos"]';
const CHAOS_STAGE_SELECTOR = '.chaos__stage';
const FRAGMENT_CARD_SELECTOR = '[data-card="item"]';
const REVEAL_SELECTOR = '[data-reveal]';
const REVEAL_ITEM_SELECTOR = '[data-reveal="item"]';

export async function initGsap(scope = document) {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm');
    const gsap = mod.gsap || mod.default || mod;
    if (!gsap || (typeof gsap.from !== 'function' && typeof gsap.to !== 'function')) return;

    const header = scope.querySelector(HEADER_SELECTOR);
    if (header) {
      gsap.from(header, { y: -24, opacity: 0, duration: 0.6, ease: 'power2.out' });
    }

    const nav = scope.querySelector(NAV_SELECTOR);
    if (nav) {
      const links = nav.querySelectorAll(NAV_LINK_SELECTOR);
      if (links.length) {
        gsap.from(links, { y: -8, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06, delay: 0.05 });
      }
    }

    const surreal = scope.querySelector(SURREAL_SELECTOR);
    if (surreal) {
      const items = surreal.querySelectorAll(REVEAL_ITEM_SELECTOR);
      if (items.length) {
        gsap.from(items, { y: 12, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05, delay: 0.1 });
      }
    }

    const fragments = scope.querySelector(FRAGMENTS_SELECTOR);
    if (fragments) {
      const cards = fragments.querySelectorAll(FRAGMENT_CARD_SELECTOR);
      if (cards.length) {
        gsap.from(cards, { y: 12, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04, delay: 0.1 });
      }
    }

    const chaos = scope.querySelector(CHAOS_SELECTOR);
    if (chaos) {
      const stage = chaos.querySelector(CHAOS_STAGE_SELECTOR);
      if (stage) {
        gsap.from(stage, { scale: 0.985, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 });
      }
    }
  } catch (_) {
    // GSAP unavailable; ignore and continue without animation.
  }
}

export async function initReveals(scope = document) {
  const els = Array.from(scope.querySelectorAll(REVEAL_SELECTOR));
  if (!els.length || !('IntersectionObserver' in window)) return;

  let motion = null;
  try {
    motion = await import('https://cdn.jsdelivr.net/npm/motion@10.16.4/+esm');
  } catch (_) {
    // Optional dependency failed to load; continue with CSS fallback.
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      reveal(el, motion);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

  els.forEach((el, index) => {
    el.setAttribute('data-reveal-ready', 'true');
    el.style.setProperty('--reveal-delay', `${Math.min(index * 40, 240)}ms`);
    io.observe(el);
  });
}

function reveal(el, motion) {
  if (motion && typeof motion.animate === 'function') {
    try {
      motion.animate(el, { opacity: [0, 1], transform: ['translateY(12px)', 'none'] }, {
        duration: 0.6,
        easing: 'cubic-bezier(.21,.9,.31,1)',
        delay: parseDelay(el)
      });
      el.setAttribute('data-revealed', 'true');
      return;
    } catch (_) {
      // Fall back to CSS transition.
    }
  }

  requestAnimationFrame(() => el.setAttribute('data-revealed', 'true'));
}

function parseDelay(el) {
  const val = getComputedStyle(el).getPropertyValue('--reveal-delay').trim();
  if (!val) return 0;
  try {
    return Number(val.replace('ms', '')) || 0;
  } catch (_) {
    return 0;
  }
}
