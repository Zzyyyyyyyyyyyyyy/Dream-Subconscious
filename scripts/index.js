// scripts/index.js
// Module for the Surreal Landscapes page.

import { initReveals, initGsap } from './common.js';

const ROOT_SELECTOR = '#main';
const BLOCK_SELECTOR = '[data-block="surreal"]';
const ACTIONS = {
  setTone: '[data-action="set-tone"]',
  shuffleSurreal: '[data-action="shuffle-surreal"]',
  toggleLoop: '[data-action="toggle-loop"]'
};

const SELECTORS = {
  card: '[data-role="card"]',
  windows: '[data-role="windows"]',
  window: '[data-window]',
  windowTitle: '[data-role="window-title"]',
  windowPrompt: '[data-role="window-prompt"]',
  windowQuote: '[data-role="window-quote"]',
  controls: '[data-role="controls"]',
  status: '[data-role="status"]',
  floaters: '[data-float]'
};

const LOOP_INTERVAL = 8000;
const MAX_WINDOWS = 3;

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
  const card = blockRoot.querySelector(SELECTORS.card);
  if (!card) return;

  const windowsRoot = card.querySelector(SELECTORS.windows);
  const windowEls = windowsRoot ? Array.from(windowsRoot.querySelectorAll(SELECTORS.window)) : [];
  const windows = windowEls.map((el) => ({
    el,
    titleEl: el.querySelector(SELECTORS.windowTitle),
    promptEl: el.querySelector(SELECTORS.windowPrompt),
    quoteEl: el.querySelector(SELECTORS.windowQuote)
  }));

  const floaters = blockRoot.querySelectorAll(SELECTORS.floaters);
  const controlsRoot = blockRoot.querySelector(SELECTORS.controls);
  const toneSelect = controlsRoot ? controlsRoot.querySelector(ACTIONS.setTone) : null;
  const loopToggle = controlsRoot ? controlsRoot.querySelector(ACTIONS.toggleLoop) : null;
  const statusEl = blockRoot.querySelector(SELECTORS.status);

  const state = {
    tone: toneSelect && toneSelect.value ? toneSelect.value : 'dawn',
    lastPreset: null,
    announceFrame: null,
    stream: [],
    loopActive: false,
    loopTimer: null
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

  function renderStream(options = {}) {
    const { animate = false } = options;
    if (!windows.length) return;

    windows.forEach((slot, index) => {
      const preset = state.stream[index];
      const position = preset ? (index < MAX_WINDOWS ? String(index) : 'off') : 'off';
      slot.el.setAttribute('data-position', position);
      slot.el.setAttribute('data-active', index === 0 ? 'true' : 'false');
      if (preset) {
        if (slot.titleEl) slot.titleEl.textContent = preset.title;
        if (slot.promptEl) slot.promptEl.textContent = preset.prompt;
        if (slot.quoteEl) slot.quoteEl.textContent = preset.quote;
        if (index === 0) {
          slot.el.setAttribute('aria-hidden', 'false');
          if (animate) pulseWindow(slot.el);
        } else {
          slot.el.setAttribute('aria-hidden', 'true');
        }
      } else {
        if (slot.titleEl) slot.titleEl.textContent = '';
        if (slot.promptEl) slot.promptEl.textContent = '';
        if (slot.quoteEl) slot.quoteEl.textContent = '';
        slot.el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function pulseWindow(el) {
    el.setAttribute('data-pulse', 'true');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.removeAttribute('data-pulse');
      });
    });
  }

  function seedStreamForTone(toneKey) {
    const cfg = getToneConfig(toneKey);
    const presets = Array.isArray(cfg.presets) ? cfg.presets.slice(0, MAX_WINDOWS) : [];
    state.stream = presets;
    state.lastPreset = presets.length ? presets[0].id : null;
    renderStream({ animate: false });
  }

  function setTone(nextTone, options = {}) {
    const candidate = (nextTone || '').trim();
    const toneKey = hasTone(candidate) ? candidate : 'dawn';
    state.tone = toneKey;
    blockRoot.setAttribute('data-tone', toneKey);
    if (toneSelect && toneSelect.value !== toneKey) toneSelect.value = toneKey;
    const cfg = getToneConfig(toneKey);
    refreshFloaters(cfg);
    state.lastPreset = null;
    if (options.reseed !== false) seedStreamForTone(toneKey);
    if (options.announceTone !== false && cfg.description) announce(cfg.description);
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

  function presentPreset(preset, options = {}) {
    if (!preset) return;
    state.lastPreset = preset.id;
    state.stream = [preset, ...state.stream].slice(0, MAX_WINDOWS);
    renderStream({ animate: options.animate !== false });
    if (options.announce !== false && preset.status) announce(preset.status);
  }

  function shuffleFragment(options = {}) {
    const preset = pickPreset();
    if (preset) {
      presentPreset(preset, options);
      if (state.loopActive) restartLoopTimer();
    }
  }

  function startLoop() {
    if (state.loopActive) return;
    state.loopActive = true;
    updateLoopToggle();
    announce('Loop started: fragments will surface automatically.');
    restartLoopTimer();
  }

  function stopLoop() {
    if (!state.loopActive) return;
    state.loopActive = false;
    if (state.loopTimer) {
      clearTimeout(state.loopTimer);
      state.loopTimer = null;
    }
    updateLoopToggle();
    announce('Loop paused: pull fragments whenever you like.');
  }

  function restartLoopTimer() {
    if (!state.loopActive) return;
    if (state.loopTimer) {
      clearTimeout(state.loopTimer);
      state.loopTimer = null;
    }
    state.loopTimer = setTimeout(() => {
      state.loopTimer = null;
      shuffleFragment({ announce: false });
      restartLoopTimer();
    }, LOOP_INTERVAL);
  }

  function updateLoopToggle() {
    if (!loopToggle) return;
    loopToggle.setAttribute('aria-pressed', state.loopActive ? 'true' : 'false');
    loopToggle.textContent = state.loopActive ? 'Pause loop' : 'Start loop';
  }

  if (controlsRoot) {
    controlsRoot.addEventListener('change', (event) => {
      const select = event.target.closest(ACTIONS.setTone);
      if (!select || !controlsRoot.contains(select)) return;
      setTone(select.value, { announceTone: true, reseed: true });
      if (state.loopActive) restartLoopTimer();
    });

    controlsRoot.addEventListener('click', (event) => {
      const shuffleBtn = event.target.closest(ACTIONS.shuffleSurreal);
      if (shuffleBtn && controlsRoot.contains(shuffleBtn)) {
        event.preventDefault();
        shuffleFragment({ announce: true, animate: true });
        return;
      }

      const loopBtn = event.target.closest(ACTIONS.toggleLoop);
      if (!loopBtn || !controlsRoot.contains(loopBtn)) return;
      event.preventDefault();
      if (state.loopActive) {
        stopLoop();
      } else {
        startLoop();
      }
    });
  }

  setTone(state.tone, { announceTone: false, reseed: true });
  const initialConfig = getToneConfig(state.tone);
  if (initialConfig.description) announce(initialConfig.description);
  renderStream({ animate: false });
}

init();
