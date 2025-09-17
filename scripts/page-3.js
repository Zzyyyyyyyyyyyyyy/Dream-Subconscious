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

  const whisper = blockRoot.querySelector('[data-chaos="whisper"]');
  const log = blockRoot.querySelector('[data-chaos="log"]');
  const fragments = Array.from(blockRoot.querySelectorAll('.chaos__fragment'));
  const echoLines = [
    'The hallway hums before the door appears.',
    'Footsteps arrive ahead of their owners.',
    'Gravity forgets which way is down tonight.',
    'Windows blink like watchful eyes.',
    'Static gathers behind the last whisper.'
  ];
  const echoState = {
    index: 0,
    resetTimer: 0,
    fragmentTimer: 0,
    lastFragment: null
  };

  blockRoot.addEventListener('click', (event) => {
    const enter = event.target.closest(ACTIONS.enter);
    if (enter && blockRoot.contains(enter)) {
      event.preventDefault();
      const toGrid = !hasState(CHAOS_CLASSES.grid);
      setState(CHAOS_CLASSES.drift, !toGrid);
      setState(CHAOS_CLASSES.grid, toGrid);
      enter.setAttribute('aria-pressed', String(toGrid));
      return;
    }

    const echoBtn = event.target.closest(ACTIONS.chaosEcho);
    if (echoBtn && blockRoot.contains(echoBtn)) {
      event.preventDefault();
      triggerEcho(echoBtn);
    }
  });

  let revealPressed = false;
  function startReveal() {
    revealPressed = true;
    setState(CHAOS_CLASSES.reveal, true);
    const btn = blockRoot.querySelector(ACTIONS.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'true');
  }

  function endReveal() {
    if (!revealPressed) return;
    revealPressed = false;
    setState(CHAOS_CLASSES.reveal, false);
    const btn = blockRoot.querySelector(ACTIONS.fearReveal);
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

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

  function triggerEcho(button) {
    window.clearTimeout(echoState.resetTimer);
    if (!echoLines.length) return;

    button.setAttribute('aria-pressed', 'true');

    const line = echoLines[echoState.index];
    echoState.index = (echoState.index + 1) % echoLines.length;

    if (whisper) whisper.textContent = line;
    if (log) {
      const item = document.createElement('li');
      item.className = 'chaos__log-item';
      item.textContent = line;
      log.prepend(item);
      while (log.children.length > 4) {
        log.removeChild(log.lastElementChild);
      }
    }

    highlightFragment();

    echoState.resetTimer = window.setTimeout(() => {
      button.setAttribute('aria-pressed', 'false');
    }, 1200);
  }

  function highlightFragment() {
    if (!fragments.length) {
      if (echoState.lastFragment) {
        echoState.lastFragment.classList.remove('chaos__fragment--pulse');
        echoState.lastFragment = null;
      }
      return;
    }

    if (echoState.lastFragment) {
      echoState.lastFragment.classList.remove('chaos__fragment--pulse');
    }
    const fragment = fragments[Math.floor(Math.random() * fragments.length)];
    fragment.classList.add('chaos__fragment--pulse');
    echoState.lastFragment = fragment;

    window.clearTimeout(echoState.fragmentTimer);
    echoState.fragmentTimer = window.setTimeout(() => {
      if (echoState.lastFragment) {
        echoState.lastFragment.classList.remove('chaos__fragment--pulse');
        echoState.lastFragment = null;
      }
    }, 900);
  }

  function onKey(event) {
    if (event.key && event.key.toLowerCase() === 'p') {
      const on = !hasState(CHAOS_CLASSES.panic);
      setState(CHAOS_CLASSES.panic, on);
    }
  }

  document.addEventListener('keydown', onKey);
}

init();
