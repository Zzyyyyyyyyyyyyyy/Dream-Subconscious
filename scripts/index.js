// scripts/index.js
// Module for the Surreal Landscapes page.

import { initReveals, initGsap } from './common.js';

const ROOT_SELECTOR = '#main';
const BLOCK_SELECTOR = '[data-block="surreal"]';
const ACTIONS = {
  flipCard: '[data-action="flip-card"]',
  setTone: '[data-action="set-tone"]',
  shuffleSurreal: '[data-action="shuffle-surreal"]'
};

const SURREAL_TONES = {
  dawn: {
    description: 'Tone set to Dawn: gentle drafts and lifted horizons.',
    float: { spread: 2.4, duration: [9, 14] },
    presets: [
      {
        id: 'dawn-1',
        title: 'Surreal Landscapes',
        prompt: 'floating island, impossible geology, surreal sky',
        quote: 'Have you ever seen the sky split?',
        status: 'Dawn fragment resurfaced: skylines fold open with soft light.'
      },
      {
        id: 'dawn-2',
        title: 'Morning Isles',
        prompt: 'sunlit archipelago, mirrored water, quiet bells',
        quote: 'The bells drifted ahead like small moons.',
        status: 'Dawn fragment drawn: bells drift through suspended harbors.'
      },
      {
        id: 'dawn-3',
        title: 'Cloud Loom',
        prompt: 'woven clouds, laddered beams, silent birds',
        quote: 'We climbed light to reach the quiet birds.',
        status: 'Dawn fragment woven: beams braid pathways across the sky.'
      }
    ]
  },
  dusk: {
    description: 'Tone set to Dusk: long shadows and memory afterglow.',
    float: { spread: 3.1, duration: [11, 17] },
    presets: [
      {
        id: 'dusk-1',
        title: 'Nocturne Bridges',
        prompt: 'mirrored river, glass bridge, distant choir',
        quote: 'The river kept every color it swallowed.',
        status: 'Dusk fragment resurfaced: bridges remember each echo.'
      },
      {
        id: 'dusk-2',
        title: 'Amber Threshold',
        prompt: 'rustling corridors, candle windows, slow rain',
        quote: 'Rain wrote the same name on every door.',
        status: 'Dusk fragment held: corridors glow with patient rain.'
      },
      {
        id: 'dusk-3',
        title: 'Shadow Lanterns',
        prompt: 'hanging lanterns, double horizons, soft neon',
        quote: 'We walked beside our reflections to stay warm.',
        status: 'Dusk fragment lit: lanterns follow the second horizon.'
      }
    ]
  },
  storm: {
    description: 'Tone set to Storm: charged air and restless stitching.',
    float: { spread: 3.8, duration: [7, 12] },
    presets: [
      {
        id: 'storm-1',
        title: 'Static Choir',
        prompt: 'thunder glass, rising choir, fractured rain',
        quote: 'Every note cracked the sky a little wider.',
        status: 'Storm fragment tuned: thunder threads the open glass.'
      },
      {
        id: 'storm-2',
        title: 'Signal Bloom',
        prompt: 'lightning gardens, electric petals, humming wires',
        quote: 'The garden bloomed only when the wires hummed.',
        status: 'Storm fragment sparked: petals ignite along the wires.'
      },
      {
        id: 'storm-3',
        title: 'Cyclone Atlas',
        prompt: 'spiral maps, magnetic wind, rushing ink',
        quote: 'Ink rivers lifted from the pages into the air.',
        status: 'Storm fragment mapped: winds redraw the atlas in midair.'
      }
    ]
  }
};

function init() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;

  const surrealRoot = root.querySelector(BLOCK_SELECTOR);
  if (!surrealRoot) return;

  initSurreal(surrealRoot);
  initReveals(document);
  initGsap(document);
}

function initSurreal(blockRoot) {
  const card = blockRoot.querySelector('[data-role="card"]');
  if (!card) return;

  const floaters = blockRoot.querySelectorAll('[data-float]');
  const promptEl = card.querySelector('.surreal__prompt');
  const quoteEl = card.querySelector('.surreal__quote');
  const titleEl = card.querySelector('.surreal__title');
  const controlsRoot = blockRoot.querySelector('[data-role="controls"]');
  const toneSelect = controlsRoot ? controlsRoot.querySelector(ACTIONS.setTone) : null;
  const statusEl = blockRoot.querySelector('[data-role="status"]');

  const state = {
    tone: toneSelect && toneSelect.value ? toneSelect.value : 'dawn',
    lastPreset: null,
    announceFrame: null
  };

  const hasTone = (name) => Object.prototype.hasOwnProperty.call(SURREAL_TONES, name);

  function getToneConfig(name) {
    return hasTone(name) ? SURREAL_TONES[name] : SURREAL_TONES.dawn;
  }

  function refreshFloaters(config) {
    if (!floaters.length) return;
    const spread = config?.float?.spread ?? 2;
    const duration = config?.float?.duration ?? [8, 16];
    const minDur = Math.min(duration[0], duration[1] ?? duration[0]);
    const maxDur = Math.max(duration[0], duration[1] ?? duration[0]);
    floaters.forEach((el) => {
      const tx = ((Math.random() * 2 - 1) * spread).toFixed(2) + '%';
      const ty = ((Math.random() * 2 - 1) * spread).toFixed(2) + '%';
      const durRange = Math.max(maxDur - minDur, 0.1);
      const dur = (minDur + Math.random() * durRange).toFixed(2) + 's';
      const delay = (Math.random() * 4).toFixed(2) + 's';
      el.style.setProperty('--tx', tx);
      el.style.setProperty('--ty', ty);
      el.style.setProperty('--dur', dur);
      el.style.setProperty('--delay', delay);
    });
  }

  function announce(message) {
    if (!statusEl) return;
    if (state.announceFrame) cancelAnimationFrame(state.announceFrame);
    statusEl.textContent = '';
    if (!message) {
      state.announceFrame = null;
      return;
    }
    state.announceFrame = requestAnimationFrame(() => {
      statusEl.textContent = message;
      state.announceFrame = null;
    });
  }

  function applyPreset(preset, announceChange = true) {
    if (!preset) return;
    if (titleEl) titleEl.textContent = preset.title;
    if (promptEl) promptEl.textContent = preset.prompt;
    if (quoteEl) quoteEl.textContent = preset.quote;
    state.lastPreset = preset.id;
    if (announceChange && preset.status) announce(preset.status);
  }

  function setTone(nextTone, options = {}) {
    const candidate = (nextTone || '').trim();
    const toneKey = hasTone(candidate) ? candidate : 'dawn';
    state.tone = toneKey;
    blockRoot.setAttribute('data-tone', toneKey);
    if (toneSelect && toneSelect.value !== toneKey) toneSelect.value = toneKey;
    refreshFloaters(getToneConfig(toneKey));
    state.lastPreset = null;
    if (options.announceTone !== false) {
      const cfg = getToneConfig(toneKey);
      if (cfg.description) announce(cfg.description);
    }
  }

  function pickPreset() {
    const cfg = getToneConfig(state.tone);
    const presets = Array.isArray(cfg.presets) ? cfg.presets : [];
    if (!presets.length) return null;
    let pool = presets;
    if (state.lastPreset && presets.length > 1) {
      pool = presets.filter((item) => item.id !== state.lastPreset);
      if (!pool.length) pool = presets;
    }
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  function shuffleFragment(options = {}) {
    const preset = pickPreset();
    if (preset) applyPreset(preset, options.announce !== false);
  }

  if (controlsRoot) {
    controlsRoot.addEventListener('change', (event) => {
      const select = event.target.closest(ACTIONS.setTone);
      if (!select || !controlsRoot.contains(select)) return;
      setTone(select.value);
      shuffleFragment();
    });

    controlsRoot.addEventListener('click', (event) => {
      const btn = event.target.closest(ACTIONS.shuffleSurreal);
      if (!btn || !controlsRoot.contains(btn)) return;
      event.preventDefault();
      shuffleFragment();
    });
  }

  setTone(state.tone, { announceTone: false });
  const initialConfig = getToneConfig(state.tone);
  if (initialConfig.presets && initialConfig.presets.length) {
    applyPreset(initialConfig.presets[0], false);
  }
  if (initialConfig.description) announce(initialConfig.description);

  let raf = null;
  let lastEvent = null;

  function applyPointerEffects() {
    if (!lastEvent) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(lastEvent.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(lastEvent.clientY - rect.top, rect.height));
    const px = x / rect.width;
    const py = y / rect.height;

    const TILT = 10;
    const rx = (0.5 - py) * TILT;
    const ry = (px - 0.5) * TILT;

    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    card.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
    card.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
    raf = null;
  }

  function onPointerMove(event) {
    lastEvent = event;
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

  blockRoot.addEventListener('click', (event) => {
    const btn = event.target.closest(ACTIONS.flipCard);
    if (!btn || !blockRoot.contains(btn)) return;
    event.preventDefault();
    const flipped = card.getAttribute('data-flipped') === 'true';
    card.setAttribute('data-flipped', flipped ? 'false' : 'true');
    btn.setAttribute('aria-pressed', String(!flipped));
  });
}

init();
