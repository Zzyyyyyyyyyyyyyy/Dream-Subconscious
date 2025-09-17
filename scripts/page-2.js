// scripts/page-2.js
// Module for the Human Dream Fragments page.

import { initReveals, initGsap } from './common.js';
import { formatDate } from './utils.js';

const ROOT_SELECTOR = '#main';
const BLOCKS = {
  fragments: '[data-block="fragments"]',
  notes: '[data-block="notes"]',
  thread: '[data-block="thread"]'
};
const ACTIONS = {
  selectCard: '[data-action="select-card"]',
  saveNote: '[data-action="save-note"]'
};
const LAYERS = {
  scratch: '[data-layer="scratch"]'
};
const TARGETS = {
  notesList: '[data-role="notes-list"]',
  notesHint: '[data-role="notes-hint"]'
};

function init() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;

  const threadRoot = root.querySelector(BLOCKS.thread);
  const fragmentsRoot = root.querySelector(BLOCKS.fragments);
  const notesRoot = root.querySelector(BLOCKS.notes);

  if (fragmentsRoot) initFragments(fragmentsRoot, threadRoot);
  if (notesRoot) initNotes(notesRoot, threadRoot);

  initReveals(document);
  initGsap(document);
}

function initFragments(blockRoot, threadRoot) {
  const state = {
    selected: [],
    scratch: new WeakMap(),
    audio: null
  };

  const titles = blockRoot.querySelectorAll('[data-role="title"]');
  titles.forEach(wrapTitleChars);

  const cards = blockRoot.querySelectorAll('[data-card="item"]');
  cards.forEach(setupScratchForCard);

  blockRoot.addEventListener('click', onClick);
  blockRoot.addEventListener('pointerdown', onPointerDown);
  blockRoot.addEventListener('pointermove', onPointerMove);
  blockRoot.addEventListener('pointerup', onPointerUp);
  blockRoot.addEventListener('pointercancel', onPointerUp);

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const card = entry.target.closest('[data-card="item"]');
      if (card) resizeCanvas(card);
    }
  });
  cards.forEach((card) => ro.observe(card));

  updateThread();

  function onClick(event) {
    const selectBtn = event.target.closest(ACTIONS.selectCard);
    if (selectBtn && blockRoot.contains(selectBtn)) {
      event.preventDefault();
      const card = selectBtn.closest('[data-card="item"]');
      if (!card) return;
      toggleSelect(card, selectBtn);
      updateThread();
      playAmbientSlice();
    }
  }

  function onPointerDown(event) {
    const canvas = event.target.closest(LAYERS.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    event.preventDefault();
    const card = canvas.closest('[data-card="item"]');
    const s = ensureScratch(card);
    s.drawing = true;
    canvas.setPointerCapture(event.pointerId);
    scratchAt(s, event);
  }

  function onPointerMove(event) {
    const canvas = event.target.closest(LAYERS.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    const card = canvas.closest('[data-card="item"]');
    const s = state.scratch.get(card);
    if (!s || !s.drawing) return;
    scratchAt(s, event);
  }

  function onPointerUp(event) {
    const canvas = event.target.closest(LAYERS.scratch);
    if (!canvas || !blockRoot.contains(canvas)) return;
    const card = canvas.closest('[data-card="item"]');
    const s = state.scratch.get(card);
    if (s) s.drawing = false;
  }

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
    const canvas = card.querySelector(LAYERS.scratch);
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
    const titles = getSelectedTitles();
    const text = titles.length === 3 ? composeSentence(titles) : '';

    if (threadRoot) {
      const dots = threadRoot.querySelectorAll('.thread__dot');
      dots.forEach((dot, index) => {
        if (index < state.selected.length) {
          dot.setAttribute('data-active', 'true');
        } else {
          dot.removeAttribute('data-active');
        }
      });

      const sentenceEl = threadRoot.querySelector('[data-thread="sentence"]');
      if (sentenceEl) sentenceEl.textContent = text;
    }

    broadcastSelectionChange(text, titles);
  }

  function getSelectedTitles() {
    return state.selected
      .map((id) => {
        const selector = `[data-card="item"][data-id="${id}"] [data-role="title"]`;
        const el = blockRoot.querySelector(selector);
        return el ? el.textContent.trim() : '';
      })
      .filter(Boolean);
  }

  function composeSentence(titles) {
    const templates = [
      ([a, b, c]) => `"${a}", "${b}", and "${c}" stitch the night back together.`,
      ([a, b, c]) => `Between ${a} and ${b} lies the echo of ${c}.`,
      ([a, b, c]) => `${a} drifts toward ${b}, while ${c} keeps the secret.`,
      ([a, b, c]) => `Trace ${a}, collect ${b}, and let ${c} hum quietly.`
    ];
    const seed = titles.join('').length;
    const tpl = templates[seed % templates.length];
    return tpl(titles);
  }

  function broadcastSelectionChange(sentence, titles) {
    const detail = {
      selectedIds: state.selected.slice(),
      titles: Array.isArray(titles) ? titles.slice() : [],
      sentence: sentence || ''
    };
    document.dispatchEvent(new CustomEvent('fragments:selection-change', { detail }));
  }

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
      // WebAudio optional; ignore failures.
    }
  }
}

function initNotes(blockRoot, threadRoot) {
  const saveButton = blockRoot.querySelector(ACTIONS.saveNote);
  const list = blockRoot.querySelector(TARGETS.notesList);
  const hint = blockRoot.querySelector(TARGETS.notesHint);

  if (!saveButton || !list) return;

  const state = {
    entries: [],
    sentence: '',
    titles: []
  };

  const abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
  if (abort) {
    document.addEventListener('fragments:selection-change', onSelectionChange, { signal: abort.signal });
  } else {
    document.addEventListener('fragments:selection-change', onSelectionChange);
  }

  blockRoot.addEventListener('click', onClick);

  function onClick(event) {
    const control = event.target.closest(ACTIONS.saveNote);
    if (!control || !blockRoot.contains(control)) return;
    event.preventDefault();
    if (control.disabled) return;
    archiveSentence();
  }

  function onSelectionChange(event) {
    const detail = event && event.detail ? event.detail : {};
    state.sentence = detail.sentence || '';
    state.titles = Array.isArray(detail.titles) ? detail.titles : [];
    const ready = Boolean(state.sentence) && state.titles.length === 3;

    saveButton.disabled = !ready;
    if (hint) {
      hint.textContent = ready
        ? 'Archive the thread to remember this alignment.'
        : 'Select three fragments to archive their whisper.';
    }
  }

  function archiveSentence() {
    if (!state.sentence) return;

    const recent = state.entries[0];
    if (recent && recent.sentence === state.sentence) {
      if (hint) hint.textContent = 'This alignment is already archived.';
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      date: formatDate(new Date()),
      sentence: state.sentence
    };
    state.entries.unshift(entry);
    if (state.entries.length > 5) state.entries.pop();
    renderList();

    saveButton.disabled = true;
    if (hint) hint.textContent = 'Thread archived. Collect another alignment?';
  }

  function renderList() {
    list.textContent = '';
    state.entries.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'notes__item';

      const meta = document.createElement('span');
      meta.className = 'notes__meta';
      meta.textContent = item.date;

      const text = document.createElement('span');
      text.className = 'notes__text';
      text.textContent = item.sentence;

      li.appendChild(meta);
      li.appendChild(text);
      list.appendChild(li);
    });

    if (!state.entries.length && hint) {
      hint.textContent = 'Select three fragments to archive their whisper.';
    }
  }

  blockRoot.addEventListener('notes:teardown', () => {
    if (abort) {
      abort.abort();
    } else {
      document.removeEventListener('fragments:selection-change', onSelectionChange);
    }
  }, { once: true });
}

init();
