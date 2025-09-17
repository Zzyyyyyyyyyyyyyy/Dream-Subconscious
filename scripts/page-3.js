// scripts/page-3.js
// Module for the Nightmares & Chaos page.

import { initReveals, initGsap } from './common.js';

const ROOT_SELECTOR = '#main';
const BLOCK_SELECTOR = '[data-block="chaos"]';
const ACTIONS = {
  enter: '[data-action="enter-chaos"]',
  fearReveal: '[data-action="fear-reveal"]',
  chaosEcho: '[data-action="chaos-echo"]'
};
const CHAOS_CLASSES = {
  drift: 'chaos--drift',
  grid: 'chaos--grid',
  reveal: 'chaos--reveal',
  panic: 'chaos--panic'
};
const DATA_SELECTORS = {
  whisper: '[data-chaos="whisper"]',
  voidEcho: '[data-chaos="void-echo"]',
  fragment: '[data-chaos="fragment"]',
  ringSlot: '[data-chaos="ring-slot"]'
};
const ORBIT_RADIUS = 36;
const ORBIT_SPEED = {
  base: 0.00012,
  panic: 0.00022
};
const RING_ACTIVE_DURATION = 2600;

function init() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;

  const chaosRoot = root.querySelector(BLOCK_SELECTOR);
  if (!chaosRoot) return;

  initChaos(chaosRoot);
  initReveals(document);
  initGsap(document);
}

function initChaos(blockRoot) {
  const setState = (cls, on) => blockRoot.classList.toggle(cls, on);
  const hasState = (cls) => blockRoot.classList.contains(cls);

  setState(CHAOS_CLASSES.drift, true);

  // Query phase
  const whisper = blockRoot.querySelector(DATA_SELECTORS.whisper);
  const voidEcho = blockRoot.querySelector(DATA_SELECTORS.voidEcho);
  const ringSlots = Array.from(blockRoot.querySelectorAll(DATA_SELECTORS.ringSlot));
  const fragments = Array.from(blockRoot.querySelectorAll(DATA_SELECTORS.fragment));

  const echoLines = [
    'The hallway hums before the door appears.',
    'Footsteps arrive ahead of their owners.',
    'Gravity forgets which way is down tonight.',
    'Windows blink like watchful eyes.',
    'Static gathers behind the last whisper.'
  ];

  const ringTimers = new WeakMap();
  const state = {
    echoIndex: 0,
    fragmentIndex: 0,
    ringIndex: 0,
    buttonTimer: 0,
    spotlight: null,
    orbit: {
      angle: 0,
      last: 0,
      rafId: 0,
      wasGrid: false
    }
  };
  let revealPressed = false;

  if (fragments.length) {
    updateFragments(state.orbit.angle);
  }
  startOrbit();

  // Bind events phase
  blockRoot.addEventListener('click', (event) => {
    const enter = event.target.closest(ACTIONS.enter);
    if (enter && blockRoot.contains(enter)) {
      event.preventDefault();
      const toGrid = !hasState(CHAOS_CLASSES.grid);
      setState(CHAOS_CLASSES.drift, !toGrid);
      setState(CHAOS_CLASSES.grid, toGrid);
      enter.setAttribute('aria-pressed', String(toGrid));
      syncOrbitState();
      return;
    }

    const echoBtn = event.target.closest(ACTIONS.chaosEcho);
    if (echoBtn && blockRoot.contains(echoBtn)) {
      event.preventDefault();
      triggerEcho(echoBtn);
    }
  });

  blockRoot.addEventListener('pointerdown', (event) => {
    const btn = event.target.closest(ACTIONS.fearReveal);
    if (btn && blockRoot.contains(btn)) {
      event.preventDefault();
      startReveal();
    }
  });
  blockRoot.addEventListener('pointerup', endReveal);
  blockRoot.addEventListener('pointercancel', endReveal);
  blockRoot.addEventListener('pointerleave', endReveal);

  document.addEventListener('keydown', onKey);

  // Update DOM helpers
  function triggerEcho(button) {
    window.clearTimeout(state.buttonTimer);
    if (!echoLines.length) return;

    button.setAttribute('aria-pressed', 'true');

    const line = echoLines[state.echoIndex];
    state.echoIndex = (state.echoIndex + 1) % echoLines.length;

    const fragment = fragments.length
      ? fragments[state.fragmentIndex % fragments.length]
      : null;
    if (fragments.length) {
      state.fragmentIndex = (state.fragmentIndex + 1) % fragments.length;
    }

    updateVoices(line);
    updateRing(line);
    updateSpotlight(fragment);

    state.buttonTimer = window.setTimeout(() => {
      button.setAttribute('aria-pressed', 'false');
    }, 1200);
  }

  function updateVoices(line) {
    if (whisper) whisper.textContent = line;
    if (voidEcho) voidEcho.textContent = line;
  }

  function updateRing(line) {
    if (!ringSlots.length) return;

    const slot = ringSlots[state.ringIndex % ringSlots.length];
    state.ringIndex = (state.ringIndex + 1) % ringSlots.length;

    const timerId = ringTimers.get(slot);
    if (timerId) {
      window.clearTimeout(timerId);
    }

    slot.textContent = '\u2022';
    slot.setAttribute('title', line);
    slot.classList.add('chaos__ring-item--active');

    const nextTimer = window.setTimeout(() => {
      slot.classList.remove('chaos__ring-item--active');
      ringTimers.delete(slot);
    }, RING_ACTIVE_DURATION);

    ringTimers.set(slot, nextTimer);
  }

  function updateSpotlight(fragment) {
    if (state.spotlight && state.spotlight !== fragment) {
      state.spotlight.classList.remove('chaos__fragment--spotlight');
    }
    if (!fragment) return;
    fragment.classList.add('chaos__fragment--spotlight');
    state.spotlight = fragment;
  }

  function startReveal() {
    revealPressed = true;
    setState(CHAOS_CLASSES.reveal, true);
    const btn = blockRoot.querySelector(ACTIONS.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'true');
    if (!hasState(CHAOS_CLASSES.grid)) {
      updateFragments(state.orbit.angle);
    }
  }

  function endReveal() {
    if (!revealPressed) return;
    revealPressed = false;
    setState(CHAOS_CLASSES.reveal, false);
    const btn = blockRoot.querySelector(ACTIONS.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  function syncOrbitState() {
    if (hasState(CHAOS_CLASSES.grid)) {
      resetFragmentPositions();
    } else {
      updateFragments(state.orbit.angle);
    }
  }

  function updateFragments(angle) {
    if (!fragments.length || hasState(CHAOS_CLASSES.grid)) return;
    const step = (Math.PI * 2) / fragments.length;
    fragments.forEach((fragment, index) => {
      const theta = angle + step * index;
      const x = Math.cos(theta) * ORBIT_RADIUS;
      const y = Math.sin(theta) * ORBIT_RADIUS;
      fragment.style.setProperty('--chaos-x', `${x.toFixed(2)}%`);
      fragment.style.setProperty('--chaos-y', `${y.toFixed(2)}%`);
    });
  }

  function resetFragmentPositions() {
    fragments.forEach((fragment) => {
      fragment.style.removeProperty('--chaos-x');
      fragment.style.removeProperty('--chaos-y');
    });
  }

  function startOrbit() {
    if (state.orbit.rafId) {
      window.cancelAnimationFrame(state.orbit.rafId);
    }
    state.orbit.last = 0;
    state.orbit.rafId = window.requestAnimationFrame(stepOrbit);
  }

  function stepOrbit(timestamp) {
    if (!state.orbit.rafId) return;
    if (!state.orbit.last) {
      state.orbit.last = timestamp;
    }
    const delta = timestamp - state.orbit.last;
    state.orbit.last = timestamp;

    const isGrid = hasState(CHAOS_CLASSES.grid);

    if (isGrid) {
      if (!state.orbit.wasGrid) {
        state.orbit.wasGrid = true;
        resetFragmentPositions();
      }
    } else {
      state.orbit.wasGrid = false;
      if (!revealPressed && fragments.length) {
        const speed = hasState(CHAOS_CLASSES.panic) ? ORBIT_SPEED.panic : ORBIT_SPEED.base;
        state.orbit.angle += delta * speed;
        updateFragments(state.orbit.angle);
      }
    }

    state.orbit.rafId = window.requestAnimationFrame(stepOrbit);
  }

  function onKey(event) {
    if (event.key && event.key.toLowerCase() === 'p') {
      const on = !hasState(CHAOS_CLASSES.panic);
      setState(CHAOS_CLASSES.panic, on);
      if (!hasState(CHAOS_CLASSES.grid)) {
        updateFragments(state.orbit.angle);
      }
    }
  }
}

init();
