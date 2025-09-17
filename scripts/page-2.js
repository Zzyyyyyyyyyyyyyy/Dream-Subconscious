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
const TARGETS = {
  notesList: '[data-role="notes-list"]',
  notesHint: '[data-role="notes-hint"]',
  threadSentence: '[data-thread="sentence"]',
  threadActiveTitle: '[data-thread="active-title"]',
  threadActiveWhisper: '[data-thread="active-whisper"]',
  threadSelected: '[data-thread="selected-chips"]'
};

const FRAGMENT_META = {
  f1: {
    whisper: 'Warm asphalt hums with names carried by the bridge breeze.'
  },
  f2: {
    whisper: 'Lamp halos blur into a single thought behind closed eyes.'
  },
  f3: {
    whisper: 'Paper moons sway as if tides still reach this quiet room.'
  },
  f4: {
    whisper: 'Thresholds multiply until the right doorway finally exhales.'
  },
  f5: {
    whisper: 'Platform echoes measure the distance between intent and arrival.'
  },
  f6: {
    whisper: 'Footprints dissolve yet the fog keeps the cadence memorised.'
  }
};

const AUTO_CYCLE_DELAY = 7000;


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
  const cards = Array.from(blockRoot.querySelectorAll('[data-card="item"]'));
  if (!cards.length) return;

  const state = {
    selected: [],
    activeId: null,
    cycleIndex: 0,
    timer: null,
    lastInteraction: Date.now(),
    audio: null
  };

  const titles = blockRoot.querySelectorAll('[data-role="title"]');
  titles.forEach(wrapTitleChars);

  cards.forEach((card) => {
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    });
  });

  blockRoot.addEventListener('click', onClick);
  blockRoot.addEventListener('pointerover', onPointerOver);
  blockRoot.addEventListener('pointermove', onPointerMove);
  blockRoot.addEventListener('focusin', onFocusIn);

  const firstCard = cards[0];
  if (firstCard) setActiveCard(firstCard);

  updateThread();
  startCycle();

  function onClick(event) {
    const selectBtn = event.target.closest(ACTIONS.selectCard);
    if (!selectBtn || !blockRoot.contains(selectBtn)) return;
    event.preventDefault();

    const card = selectBtn.closest('[data-card="item"]');
    if (!card) return;

    markInteraction();
    toggleSelect(card, selectBtn);
    setActiveCard(card);
    updateThread();
    playAmbientSlice(state);
  }

  function onPointerOver(event) {
    const card = event.target.closest('[data-card="item"]');
    if (!card || !blockRoot.contains(card)) return;
    markInteraction();
    setActiveCard(card);
  }

  function onPointerMove(event) {
    const card = event.target.closest('[data-card="item"]');
    if (!card || !blockRoot.contains(card)) return;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    card.style.setProperty('--pointer-x', (x * 100).toFixed(2) + '%');
    card.style.setProperty('--pointer-y', (y * 100).toFixed(2) + '%');
  }

  function onFocusIn(event) {
    const card = event.target.closest('[data-card="item"]');
    if (!card || !blockRoot.contains(card)) return;
    markInteraction();
    setActiveCard(card);
  }

  function markInteraction() {
    state.lastInteraction = Date.now();
  }

  function startCycle() {
    stopCycle();
    state.timer = window.setInterval(() => {
      if (!cards.length) return;
      const idleDuration = Date.now() - state.lastInteraction;
      if (idleDuration < AUTO_CYCLE_DELAY) return;
      state.cycleIndex = (state.cycleIndex + 1) % cards.length;
      const next = cards[state.cycleIndex];
      setActiveCard(next);
    }, AUTO_CYCLE_DELAY);
  }

  function stopCycle() {
    if (!state.timer) return;
    window.clearInterval(state.timer);
    state.timer = null;
  }

  function setActiveCard(card) {
    if (!card) return;
    const id = card.getAttribute('data-id');
    if (!id || state.activeId === id) return;

    state.activeId = id;
    state.cycleIndex = cards.indexOf(card);

    cards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle('fragments__card--active', isActive);
      if (!isActive) {
        item.style.removeProperty('--pointer-x');
        item.style.removeProperty('--pointer-y');
      }
    });

    updateActivePanel(id, card);
  }

  function updateActivePanel(id, card) {
    if (!threadRoot) return;
    const titleSource = card.querySelector('[data-role="title"]');
    const activeTitle = threadRoot.querySelector(TARGETS.threadActiveTitle);
    const activeWhisper = threadRoot.querySelector(TARGETS.threadActiveWhisper);
    const meta = FRAGMENT_META[id] || {};

    if (activeTitle) {
      activeTitle.textContent = titleSource ? titleSource.textContent.trim() : '';
    }
    if (activeWhisper) {
      activeWhisper.textContent = meta.whisper || 'This fragment is waiting to be heard.';
    }
  }

  function toggleSelect(card, button) {
    const id = card.getAttribute('data-id');
    if (!id) return;

    const index = state.selected.indexOf(id);
    if (index >= 0) {
      state.selected.splice(index, 1);
      card.classList.remove('fragments__card--selected');
      button.setAttribute('aria-pressed', 'false');
      return;
    }

    if (state.selected.length >= 3) {
      const removedId = state.selected.shift();
      if (removedId) {
        const removedCard = blockRoot.querySelector('[data-card="item"][data-id="' + removedId + '"]');
        const removedButton = removedCard ? removedCard.querySelector(ACTIONS.selectCard) : null;
        if (removedCard) removedCard.classList.remove('fragments__card--selected');
        if (removedButton) removedButton.setAttribute('aria-pressed', 'false');
      }
    }

    state.selected.push(id);
    card.classList.add('fragments__card--selected');
    button.setAttribute('aria-pressed', 'true');
  }

  function updateThread() {
    updateDots();
    renderSelectedChips();

    const titles = getSelectedTitles();
    const sentence = titles.length === 3 ? composeSentence(titles) : '';
    if (threadRoot) {
      const sentenceEl = threadRoot.querySelector(TARGETS.threadSentence);
      if (sentenceEl) sentenceEl.textContent = sentence;
    }

    broadcastSelectionChange(state.selected, sentence, titles);
  }

  function updateDots() {
    if (!threadRoot) return;
    const dots = threadRoot.querySelectorAll('.thread__dot');
    dots.forEach((dot, index) => {
      if (index < state.selected.length) {
        dot.setAttribute('data-active', 'true');
      } else {
        dot.removeAttribute('data-active');
      }
    });
  }

  function renderSelectedChips() {
    if (!threadRoot) return;
    const list = threadRoot.querySelector(TARGETS.threadSelected);
    if (!list) return;

    list.textContent = '';
    state.selected.forEach((id, idx) => {
      const card = blockRoot.querySelector('[data-card="item"][data-id="' + id + '"]');
      if (!card) return;
      const titleEl = card.querySelector('[data-role="title"]');

      const li = document.createElement('li');
      li.className = 'thread__chip';
      li.textContent = (idx + 1) + '. ' + (titleEl ? titleEl.textContent.trim() : id);
      list.appendChild(li);
    });
  }

  function getSelectedTitles() {
    return state.selected
      .map((id) => {
        const selector = '[data-card="item"][data-id="' + id + '"] [data-role="title"]';
        const el = blockRoot.querySelector(selector);
        return el ? el.textContent.trim() : '';
      })
      .filter(Boolean);
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

function composeSentence(titles) {
  const templates = [
    function (parts) { return '"' + parts[0] + '", "' + parts[1] + '", and "' + parts[2] + '" stitch the night back together.'; },
    function (parts) { return 'Between ' + parts[0] + ' and ' + parts[1] + ' lies the echo of ' + parts[2] + '.'; },
    function (parts) { return parts[0] + ' drifts toward ' + parts[1] + ', while ' + parts[2] + ' keeps the secret.'; },
    function (parts) { return 'Trace ' + parts[0] + ', collect ' + parts[1] + ', and let ' + parts[2] + ' hum quietly.'; }
  ];
  const seed = titles.join('').length;
  const tpl = templates[seed % templates.length];
  return tpl(titles);
}

function broadcastSelectionChange(selectedIds, sentence, titles) {
  const detail = {
    selectedIds: Array.isArray(selectedIds) ? selectedIds.slice() : [],
    titles: Array.isArray(titles) ? titles.slice() : [],
    sentence: sentence || ''
  };
  document.dispatchEvent(new CustomEvent('fragments:selection-change', { detail }));
}

function playAmbientSlice(state) {
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
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.07;
    }
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

init();
