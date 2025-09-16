// scripts/main.js
// ES module entry. Behavior is minimal and focuses on structure.
// Organization: constants → setup → bindings → DOM updates.

// ----------------------------
// Constants (selectors, events)
// ----------------------------
const SELECTORS = {
  root: '#main',
  blocks: {
    timeline: '[data-block="timeline"]',
    surreal: '[data-block="surreal"]',
    chaos: '[data-block="chaos"]',
    thread: '[data-block="thread"]',
    fragments: '[data-block="fragments"]'
  },
  actions: {
    toggleItem: '[data-action="toggle-item"]',
    flipCard: '[data-action="flip-card"]',
    enterChaos: '[data-action="enter-chaos"]',
    fearReveal: '[data-action="fear-reveal"]',
    selectCard: '[data-action="select-card"]'
  },
  layers: {
    scratch: '[data-layer="scratch"]'
  },
  reveal: '[data-reveal]'
};

// ----------------------------
// Init
// ----------------------------
function init() {
  const root = document.querySelector(SELECTORS.root);
  if (!root) return;

  const timelineRoot = root.querySelector(SELECTORS.blocks.timeline);
  if (timelineRoot) initTimeline(timelineRoot);

  const surrealRoot = root.querySelector(SELECTORS.blocks.surreal);
  if (surrealRoot) initSurreal(surrealRoot);

  const chaosRoot = root.querySelector(SELECTORS.blocks.chaos);
  if (chaosRoot) initChaos(chaosRoot);

  const threadRoot = root.querySelector(SELECTORS.blocks.thread);
  const fragmentsRoot = root.querySelector(SELECTORS.blocks.fragments);
  if (fragmentsRoot) initFragments(fragmentsRoot, threadRoot);

  // Progressive enhancement: reveal-on-scroll animations
  initReveals(document);

  // Optional: GSAP micro-animations for nav and hero
  initGsap(document);
}

// ----------------------------
// Timeline Block
// Keep queries scoped to the block root.
// Use event delegation for dynamic children.
// ----------------------------
function initTimeline(blockRoot) {
  // Bind events
  blockRoot.addEventListener('click', onTimelineClick);

  // Example update function (no visual side-effects)
  function onTimelineClick(event) {
    const control = event.target.closest(SELECTORS.actions.toggleItem);
    if (!control || !blockRoot.contains(control)) return;
    event.preventDefault();

    // Update DOM: toggle aria-pressed to reflect state.
    const pressed = control.getAttribute('aria-pressed') === 'true';
    control.setAttribute('aria-pressed', String(!pressed));
    // Future enhancement: toggle a BEM state class on the nearest item.
    // const item = control.closest('.timeline__item');
    // if (item) item.classList.toggle('timeline__item--active', !pressed);
  }
}

// ----------------------------
// Surreal Block (Page 1)
// Features: parallax tilt, light-follow, flip-card, breeze drift
// Keep queries scoped to block root; use data-* hooks only.
// ----------------------------
function initSurreal(blockRoot) {
  const card = blockRoot.querySelector('[data-role="card"]');
  if (!card) return;

  // Breeze: assign random motion to floaters
  const floaters = blockRoot.querySelectorAll('[data-float]');
  floaters.forEach((el, i) => {
    const tx = (Math.random() * 4 - 2).toFixed(2) + '%'; // -2%..2%
    const ty = (Math.random() * 4 - 2).toFixed(2) + '%'; // -2%..2%
    const dur = (8 + Math.random() * 8).toFixed(2) + 's';
    const delay = (Math.random() * 4).toFixed(2) + 's';
    el.style.setProperty('--tx', tx);
    el.style.setProperty('--ty', ty);
    el.style.setProperty('--dur', dur);
    el.style.setProperty('--delay', delay);
  });

  // Parallax tilt + light-follow
  let raf = null;
  let lastEvent = null;

  function applyPointerEffects() {
    if (!lastEvent) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(lastEvent.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(lastEvent.clientY - rect.top, rect.height));
    const px = x / rect.width;  // 0..1
    const py = y / rect.height; // 0..1

    const TILT = 10; // degrees max
    const rx = (0.5 - py) * TILT; // invert Y for natural tilt
    const ry = (px - 0.5) * TILT;

    card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(2) + '%');
    raf = null;
  }

  function onPointerMove(e) {
    lastEvent = e;
    if (raf) return;
    raf = requestAnimationFrame(applyPointerEffects);
  }

  function onPointerLeave() {
    lastEvent = null;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  }

  blockRoot.addEventListener('pointermove', onPointerMove);
  blockRoot.addEventListener('pointerleave', onPointerLeave);

  // Flip card via delegation
  blockRoot.addEventListener('click', (event) => {
    const btn = event.target.closest(SELECTORS.actions.flipCard);
    if (!btn || !blockRoot.contains(btn)) return;
    event.preventDefault();
    const flipped = card.getAttribute('data-flipped') === 'true';
    card.setAttribute('data-flipped', flipped ? 'false' : 'true');
    btn.setAttribute('aria-pressed', String(!flipped));
  });
}

// ----------------------------
// Chaos Block (Page 3)
// Interactions: Enter Chaos (shatter→grid), Panic Mode (P), Fear Reveal (hold)
// ----------------------------
function initChaos(blockRoot) {
  // State helpers
  const setState = (cls, on) => blockRoot.classList.toggle(cls, on);
  const hasState = (cls) => blockRoot.classList.contains(cls);

  // Defaults
  setState('chaos--drift', true);

  // Delegated clicks
  blockRoot.addEventListener('click', (event) => {
    const enter = event.target.closest(SELECTORS.actions.enterChaos);
    if (enter && blockRoot.contains(enter)) {
      event.preventDefault();
      const toGrid = !hasState('chaos--grid');
      // brief shatter pulse can be represented by toggling drift quickly
      setState('chaos--drift', !toGrid);
      setState('chaos--grid', toGrid);
      enter.setAttribute('aria-pressed', String(toGrid));
      return;
    }
  });

  // Fear Reveal: press and hold
  let revealPressed = false;
  function startReveal() {
    revealPressed = true;
    setState('chaos--reveal', true);
    const btn = blockRoot.querySelector(SELECTORS.actions.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'true');
  }
  function endReveal() {
    if (!revealPressed) return;
    revealPressed = false;
    setState('chaos--reveal', false);
    const btn = blockRoot.querySelector(SELECTORS.actions.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  blockRoot.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest(SELECTORS.actions.fearReveal);
    if (btn && blockRoot.contains(btn)) {
      e.preventDefault();
      startReveal();
    }
  });
  blockRoot.addEventListener('pointerup', endReveal);
  blockRoot.addEventListener('pointercancel', endReveal);
  blockRoot.addEventListener('pointerleave', endReveal);

  // Panic Mode: toggle with P key
  function onKey(e) {
    if (e.key && e.key.toLowerCase() === 'p') {
      const on = !hasState('chaos--panic');
      setState('chaos--panic', on);
    }
  }
  document.addEventListener('keydown', onKey);
}

// ----------------------------
// Utilities
// ----------------------------
export function greetUser(name) {
  console.log(`Welcome, ${name}`);
}

// Boot
init();

// ----------------------------
// Optional GSAP animations (progressive enhancement)
// - Uses ESM CDN; gracefully no-op if unavailable.
// ----------------------------
async function initGsap(scope = document) {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm');
    const gsap = mod.gsap || mod.default || mod;
    if (!gsap || (typeof gsap.from !== 'function' && typeof gsap.to !== 'function')) return;

    // Header entrance
    const header = scope.querySelector('.site-header');
    if (header) {
      gsap.from(header, { y: -24, opacity: 0, duration: 0.6, ease: 'power2.out' });
    }

    // Nav links stagger
    const nav = scope.querySelector('[data-animate="nav"]');
    if (nav) {
      const links = nav.querySelectorAll('[data-animate="nav-link"]');
      if (links.length) {
        gsap.from(links, { y: -8, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06, delay: 0.05 });
      }
    }

    // Page-specific light entrance
    const surreal = scope.querySelector(SELECTORS.blocks.surreal);
    if (surreal) {
      const items = surreal.querySelectorAll('[data-reveal="item"]');
      if (items.length) gsap.from(items, { y: 12, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05, delay: 0.1 });
    }
    const fragments = scope.querySelector(SELECTORS.blocks.fragments);
    if (fragments) {
      const cards = fragments.querySelectorAll('[data-card="item"]');
      if (cards.length) gsap.from(cards, { y: 12, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04, delay: 0.1 });
    }
    const chaos = scope.querySelector(SELECTORS.blocks.chaos);
    if (chaos) {
      const stage = chaos.querySelector('.chaos__stage');
      if (stage) gsap.from(stage, { scale: 0.985, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 });
    }
  } catch (_) {
    // GSAP not available; ignore
  }
}

// ----------------------------
// Fragments Block (Page 2)
// - Masonry grid is CSS-only.
// - Scratch-off via <canvas> overlay drawing and destination-out.
// - Selecting up to 3 cards populates the Story Thread block.
// - Optional audio slice on select via WebAudio.
// ----------------------------
function initFragments(blockRoot, threadRoot) {
  const state = {
    selected: [], // array of data-id strings
    scratch: new WeakMap(), // cardEl -> {canvas, ctx, drawing}
    audio: null
  };

  // Prepare titles for hover fragmentation (wrap each char)
  const titles = blockRoot.querySelectorAll('[data-role="title"]');
  titles.forEach(wrapTitleChars);

  // Initialize scratch layers per card
  const cards = blockRoot.querySelectorAll('[data-card="item"]');
  cards.forEach(setupScratchForCard);

  // Event delegation for selection and scratching
  blockRoot.addEventListener('click', onClick);
  blockRoot.addEventListener('pointerdown', onPointerDown);
  blockRoot.addEventListener('pointermove', onPointerMove);
  blockRoot.addEventListener('pointerup', onPointerUp);
  blockRoot.addEventListener('pointercancel', onPointerUp);

  // Resize observer to keep canvas in sync
  const ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      const card = entry.target.closest('[data-card="item"]');
      if (card) resizeCanvas(card);
    }
  });
  cards.forEach(card => ro.observe(card));

  // -------------
  // Event handlers
  // -------------
  function onClick(event) {
    const selectBtn = event.target.closest(SELECTORS.actions.selectCard);
    if (selectBtn && blockRoot.contains(selectBtn)) {
      event.preventDefault();
      const card = selectBtn.closest('[data-card="item"]');
      if (!card) return;
      toggleSelect(card, selectBtn);
      updateThread();
      playAmbientSlice();
    }
}

// ----------------------------
// Reveal-on-scroll (progressive enhancement)
// - Uses IntersectionObserver; if Motion One is available, uses it for nicer easing
// ----------------------------
async function initReveals(scope = document) {
  const els = Array.from(scope.querySelectorAll(SELECTORS.reveal));
  if (!els.length || !('IntersectionObserver' in window)) return;

  // Try to load Motion One (optional)
  let motion = null;
  try {
    motion = await import('https://cdn.jsdelivr.net/npm/motion@10.16.4/+esm');
  } catch (_) {
    // no-op
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      reveal(el, motion);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

  els.forEach((el, i) => {
    // slight stagger via style var for CSS fallback
    el.style.setProperty('--reveal-delay', `${Math.min(i * 40, 240)}ms`);
    io.observe(el);
  });
}

function reveal(el, motion) {
  // If Motion One is available, animate with it; otherwise use CSS transition fallback
  if (motion && typeof motion.animate === 'function') {
    try {
      motion.animate(
        el,
        { opacity: [0, 1], transform: ['translateY(12px)', 'none'] },
        { duration: 0.6, easing: 'cubic-bezier(.21,.9,.31,1)', delay: parseDelay(el) }
      );
      el.setAttribute('data-revealed', 'true');
      return;
    } catch (_) {
      // fall through to CSS
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

  function onPointerDown(event) {
    const canvas = event.target.closest(SELECTORS.layers.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    event.preventDefault();
    const card = canvas.closest('[data-card="item"]');
    const s = ensureScratch(card);
    s.drawing = true;
    canvas.setPointerCapture(event.pointerId);
    scratchAt(s, event);
  }

  function onPointerMove(event) {
    // Only when actively scratching
    const canvas = event.target.closest(SELECTORS.layers.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    const card = canvas.closest('[data-card="item"]');
    const s = state.scratch.get(card);
    if (!s || !s.drawing) return;
    scratchAt(s, event);
  }

  function onPointerUp(event) {
    const canvas = event.target.closest(SELECTORS.layers.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    const card = canvas.closest('[data-card="item"]');
    const s = state.scratch.get(card);
    if (s) s.drawing = false;
  }

  // -------------
  // Helpers
  // -------------
  function wrapTitleChars(el) {
    if (!el || el.dataset.fragged === 'true') return;
    const text = el.textContent || '';
    el.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.setAttribute('data-frag-char', '');
      span.textContent = ch;
      el.appendChild(span);
    }
    el.dataset.fragged = 'true';
  }

  function setupScratchForCard(card) {
    ensureScratch(card);
  }

  function ensureScratch(card) {
    let s = state.scratch.get(card);
    if (s) return s;
    const canvas = card.querySelector(SELECTORS.layers.scratch);
    const img = card.querySelector('img');
    const ctx = canvas.getContext('2d');
    s = { canvas, ctx, drawing: false, img };
    state.scratch.set(card, s);
    resizeCanvas(card);
    return s;
  }

  function resizeCanvas(card) {
    const s = state.scratch.get(card);
    if (!s) return;
    const rect = s.canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (s.canvas.width !== width || s.canvas.height !== height) {
      s.canvas.width = width;
      s.canvas.height = height;
    }
    // Draw blurred image on canvas as the overlay to be erased
    // Scale image to canvas size
    try {
      s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
      if (s.img && s.img.complete) {
        s.ctx.drawImage(s.img, 0, 0, s.canvas.width, s.canvas.height);
      } else if (s.img) {
        s.img.addEventListener('load', () => {
          s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
          s.ctx.drawImage(s.img, 0, 0, s.canvas.width, s.canvas.height);
        }, { once: true });
      }
      // Set compositing mode for erasing on draw
      s.ctx.globalCompositeOperation = 'destination-out';
    } catch (_) {
      /* noop */
    }
  }

  function scratchAt(s, event) {
    const rect = s.canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const x = (event.clientX - rect.left) * dpr;
    const y = (event.clientY - rect.top) * dpr;
    const r = Math.max(12, Math.round(Math.min(s.canvas.width, s.canvas.height) * 0.05));
    s.ctx.beginPath();
    s.ctx.arc(x, y, r, 0, Math.PI * 2);
    s.ctx.fill();
  }

  function toggleSelect(card, button) {
    const id = card.getAttribute('data-id');
    const idx = state.selected.indexOf(id);
    if (idx >= 0) {
      state.selected.splice(idx, 1);
      card.classList.remove('fragments__card--selected');
      button.setAttribute('aria-pressed', 'false');
    } else {
      if (state.selected.length >= 3) state.selected.shift();
      state.selected.push(id);
      card.classList.add('fragments__card--selected');
      button.setAttribute('aria-pressed', 'true');
    }
  }

  function updateThread() {
    if (!threadRoot) return;
    const dots = threadRoot.querySelectorAll('.thread__dot');
    dots.forEach((dot, i) => {
      if (i < state.selected.length) {
        dot.setAttribute('data-active', 'true');
      } else {
        dot.removeAttribute('data-active');
      }
    });

    const sentenceEl = threadRoot.querySelector('[data-thread="sentence"]');
    const text = state.selected.length === 3
      ? '我记得他从未回头，但风知道。'
      : '';
    if (sentenceEl) sentenceEl.textContent = text;
  }

  // WebAudio: lightweight ambient slice on select
  function playAmbientSlice() {
    try {
      if (!state.audio) state.audio = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = state.audio;
      const dur = 0.25 + Math.random() * 0.2;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 220 + Math.random() * 220;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);

      const bufferSize = 2 * ctx.sampleRate * dur;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.07;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const ngain = ctx.createGain();
      ngain.gain.setValueAtTime(0.001, now);
      ngain.gain.linearRampToValueAtTime(0.02, now + 0.03);
      ngain.gain.exponentialRampToValueAtTime(0.00001, now + dur);
      noise.connect(ngain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + dur);
    } catch (_) {
      // optional; ignore failures
    }
  }
}
