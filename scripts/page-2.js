(function () {
  const throttle = (fn, wait = 160) => {
    let timeoutId = null;
    let lastCall = 0;
    return function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - lastCall);
      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        lastCall = now;
        fn.apply(this, args);
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          timeoutId = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  };

  const parseTimeToSeconds = (value) => {
    if (!value) return Number.MAX_SAFE_INTEGER;
    const normalized = String(value).trim();
    if (!normalized) return Number.MAX_SAFE_INTEGER;
    const cleaned = normalized.replace(/[^0-9:]/g, '');
    const parts = cleaned.split(':').map((part) => parseInt(part, 10));
    if (parts.some((part) => Number.isNaN(part))) {
      const numeric = parseInt(cleaned, 10);
      return Number.isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
    }

    return parts.reduce((total, part) => total * 60 + part, 0);
  };

  const audioSources = {
    'dream-chime':
      'data:audio/wav;base64,UklGRpwFAABXQVZFZm10IBAAAAABAAEAoA8AAKAPAAABAAgAZGF0YXgFAAA/XG9wX0IkEA0dOVdscWRJKhMMGDJRaXJoTzAXDBQsS2Vya1U2Gw0RJ0VhcW5aPCAODyE+XG9wX0MlEQ0cOFZscWRJKxMMGDJRaXJoTzEXDBQsSmVxbFU3Gw0RJkRgcG5bPSAODyE+W25wYEMlEQ0cN1ZscWVKLBQMFzFQaHJoUDEXDBQrSmRxbFY3HA0RJUNgcG5bPiEPDiA9W25wYEQmEQ0bN1VscWVKLBQMFzFPaHJpUTIYDBMrSWRxbFY4HA0RJUNfcG9cPiEPDiA8Wm5xYUUnEQ0bNlVrcmVLLBQMFzBPaHJpUTIYDBMqSWRxbFc5HQ0QJEJfcG9cPyIPDh88Wm5xYUUnEg0aNVRrcmZMLRUMFi9OZ3JqUjMZDBMpSGNxbVc5HQ0QJEJecG9dQCIPDh87WW1xYkYoEg0aNVNrcmZMLRUMFi9NZ3JqUjQZDRIpR2NxbVg6Hg4QI0FecG9dQCMQDh47WW1xYkcoEg0aNFNqcmdNLhYMFi5NZ3JqUzQaDRIoR2JxbVk7Hg4QI0Bdb3BeQSMQDh46WG1xY0cpEg0ZNFJqcmdNLxYMFS1MZnJrUzUaDRIoRmJxbVk7Hw4PIkBdb3BeQiQQDR05V21xY0gpEwwZM1JqcmdOLxYMFS1MZnJrVDUaDRInRWFxblo8Hw4PIj9cb3BfQiQQDR05V2xxZEkqEwwYMlFpcmhPMBcMFCxLZXJrVTYbDREnRWFxblo8IA4PIT5cb3BfQyURDRw4VmxxZEkrEwwYMlFpcmhPMRcMFCxKZXFsVTcbDREmRGBwbls9IA4PIT5bbnBgQyURDRw3VmxxZEorFAwXMVBocmhQMRcMFCtKZHFsVjccDRElQ2Bwbls+IQ8OID1bbnBgRCYRDRs3VWxxZUosFAwXMU9ocmlRMhgMEytJZHFsVjgcDRElQ19wb1w+IQ8OIDxabnFhRScRDRs2VWtyZUssFAwXME9ocmlRMhgMEypJZHFsVzkdDRAkQl9wb1w/Ig8OHzxabnFhRScSDRo1VGtyZkwtFQwWL05ncmpSMxkMEylIY3FtVzkdDRAkQl5wb11AIg8OHztZbXFiRigSDRo1U2tyZkwtFQwWL01ncmpSNBkNEilHY3FtWDoeDhAjQV5wb11AIxAOHjtZbXFiRygSDRo0U2pyZ00uFgwWLk1ncmpTNBoNEihHYnFtWTseDhAjQF1vcF5BIxAOHjpYbXFjRykSDRk0UmpyZ00vFgwVLUxmcmtTNRoNEihGYnFtWTsfDg8iQF1vcF5CJBANHTlXbXFjSCkTDBkzUmpyZ04vFgwVLUxmcmtUNRoNEidFYXFuWjwfDg8iP1xvcF9CJBANHTlXbHFkSSoTDBgyUWlyaE8wFwwULEtlcmtVNhsNESdFYXFuWjwgDg8hPlxvcF9DJRENHDhWbHFkSSsTDBgyUWlyaE8xFwwULEplcWxVNxsNESZEYHBuWz0gDg8hPltucGBDJRENHDdWbHFkSisUDBcxUGhyaFAxFwwUK0pkcWxWNxwNESVDYHBuWz4hDw4gPVtucGBEJhENGzdVbHFlSiwUDBcxT2hyaVEyGAwTK0lkcWxWOBwNESVDX3BvXD4hDw4gPFpucWFFJxENGzZVa3JlSywUDBcwT2hyaVEyGAwTKklkcWxXOR0NECRCX3BvXD8iDw4fPFpucWFFJxINGjVUa3JmTC0VDBYvTmdyalIzGQwTKUhjcW1XOR0NECRCXnBvXUAiDw4fO1ltcWJGKBINGjVTa3JmTC0VDBYvTWdyalI0GQ0SKUdjcW1YOh4OECNBXnBvXUAjEA4eO1ltcWJHKBINGjRTanJnTS4WDBYuTWdyalM0Gg0SKEdicW1ZOx4OECNAXQ==',
    'dream-ember':
      'data:audio/wav;base64,UklGRsQFAABXQVZFZm10IBAAAAABAAEAoA8AAKAPAAABAAgAZGF0YaAFAAA/aXhjOBEHIU1wdVcqCwwuWnVuSR4IFDxldmU8FQkfSW10WS4ODStWcm5MIgoUOGF0Zj8YCh1GanNbMhENKVJvbk8mDRM1XXJnQhwMHEJmcV01FA4nT21uUSoPEzNacGdFHw4bP2NwXjkYDyVLaW1ULRITMFZtZ0gjEBo8X25fPBsQI0hmbFUxFRQuU2tnSiYSGjlcbGA/HhIiRWNrVzQYFSxPaGdNKhQaN1lqYUIhFCFCYGpYNxsWK0xlZk8tFxo1VWhhRCUWIT9daFk6HhcpSWNlUDAaGzNSZmFGKBghPVpmWj0hGChGYGRSMxwbMU9jYEgrGiA6V2RaPyQaJ0RdY1M2HxwvTGFgSi4cIThUYlpBJxwnQVpiVDgiHS5KXl9MMB8hN1FgWkMqHic/V2BUOyQfLUdcXk0zISI1Tl5aRSwgJz1VXlQ9JyAtRVldTjYjIzRMXFlGLyInO1JcVD8qIixDVltOOCYkM0lZWUgxJCc6T1pUQSwkLEFUWk86KCUyR1dYSTQmKDlNWFRCLyUsP1FYTzwrJzJFVVZJNigpOEtWU0MxJy0+T1ZPPi0oMUNSVUo4Kyo3SFRSRDMpLTxNVU8/LyoxQlBUSjotKzZHUlFFNSwuO0tTTkAyLDJATlJKOy8tNkVQUEY3Li86SVFNQTQtMj9MUEo9MS42Q05PRjkwMDpHT01CNi8zPkpOSj4zMDZCTE1GOjIxOkVNS0M3MTQ9SE1JPzUyN0FKTEY8NDM6REtKQzkzNT1GS0hANzM3QEhKRj02NDpCSUlDOzU2PERJR0A5NTg/RkhFPjg2OkFHR0M8Nzc8Q0dGQTo3OT9ER0Q/OTg7QEVGQj05OT1CRURBPDk6PkNFQz87OjxAQ0RCPjs6PUFDQ0A9Ozw+QUNCPz07PT9CQkE+PDw+QEFBQD49PT5AQUE/Pj0+P0BAQD8+Pj4/QEA/Pz4/Pz8/Pz8/cHFBDww7bnJEEQs4a3NIFAo1aXRLFwoxZnROGQkuY3VRHAkrYHVUHwkoXXVXIgolWnRaJQojV3RdKQsgVHNfLAweUXJhLw0cTXFjMg4aSm9lNg8YR25nOREXRGxoPBMVQWppPxUUPWhqQhcTOmZrRRkSN2RsSBsSNWJtSx4RMl9tTSARL11tUCMRLVptUyURKldsVSgSKFVsVysSJlJrWS0TJE9rWzAUIkxqXTMVIEpoXjYWH0dnYDgYHkRmYTsZHEJkYj4bGz9iY0AcGzxhZEMeGjpfZEUgGThdZUgiGTVbZUokGTNZZUwmGTFWZU4pGS9UZVArGS1SZFItGitQZFQvGypNY1UyGyhLYlc0HCdJYVg2HSVHYFk4HiREX1o7ICNCXls9ISNAXFw/IiI+W1xBJCE8WV1DJSE6WF1FJyE4Vl1HKSE2VF1JKyE1U11KLCEzUV1MLiExT11NMCIwTVxPMiIvS1xQNCMuSVtRNiQtSFpSNyQsRllTOSUrRFhUOyYqQldUPScqQVZVPikpP1VVQCopPVRVQSsoPFJWQywoO1FWRC4oOVBWRS8oOE5VRzEpN01VSDIpNktVSTMpNUpUSjUqNElUSzYqM0dTTDgrMkZTTDksMkRSTTosMUNRTTstMUJQTj0uMEFPTj4vMEBOTj8wMD5NTkAxMD1MTkEyMDxLTkIzMDxKTkM0MDtJTkQ1MDpITkQ2MTlHTUU3MTlGTUY4MjhFTEY5MjhETEY6MzdES0c7MzdDS0c8NDdCSkc9NDdBSUc9NTdASUc+NjdASEc/Nzc/R0c/Nzc+RkdAODc+RkdAOTc9RUdBOTg9REZBOjg9REZBOzg9Q0VCOzk8QkVCPDk8QkVCPDo8QURCPTo8QURCPTs8QENCPjs8QENCPjw9QEJBPjw9P0JBPz09P0FBPz09P0FAPz4+P0BAPz4+P0BAPz8/Pz8/Pz8=',
  };

  const initThread = (cards) => {
    const thread = document.querySelector('[data-dream-thread]');
    if (!thread) {
      return {
        add() {},
        clear() {},
      };
    }

    const slots = Array.from(thread.querySelectorAll('[data-thread-slot]'));
    const placeholders = slots.map((slot, index) => slot.dataset.placeholder || `槽位${index + 1}`);
    const sentence = thread.querySelector('[data-thread-sentence]');
    const defaultSentence = sentence ? sentence.textContent.trim() : '';
    const clearButton = thread.querySelector('[data-thread-clear]');
    const queue = [];

    const updateActiveState = () => {
      const activeCards = new Set(queue.map((entry) => entry.card));
      cards.forEach((card) => {
        card.classList.toggle('dream-card--linked', activeCards.has(card));
      });
    };

    const updateSlots = () => {
      const ordered = [...queue].sort((a, b) => a.timeValue - b.timeValue);
      slots.forEach((slot, index) => {
        const item = ordered[index];
        if (item) {
          slot.textContent = item.frag;
          slot.classList.add('dream-thread__slot--filled');
          slot.setAttribute('data-time', item.timeString);
        } else {
          slot.textContent = placeholders[index] || '';
          slot.classList.remove('dream-thread__slot--filled');
          slot.removeAttribute('data-time');
        }
      });

      if (sentence) {
        if (ordered.length) {
          sentence.textContent = `${ordered.map((entry) => entry.frag).join('，')}。`;
        } else {
          sentence.textContent = defaultSentence;
        }
      }

      updateActiveState();
    };

    const add = (card) => {
      if (!card) return;
      const frag = card.dataset.frag ? card.dataset.frag.trim() : '';
      const timeString = card.dataset.time ? card.dataset.time.trim() : '';
      if (!frag || !timeString) return;

      const timeValue = parseTimeToSeconds(timeString);
      const existingIndex = queue.findIndex((entry) => entry.card === card);
      if (existingIndex !== -1) {
        queue.splice(existingIndex, 1);
      }
      queue.push({ card, frag, timeString, timeValue });
      if (queue.length > 3) {
        queue.shift();
      }
      updateSlots();
    };

    const clear = () => {
      if (!queue.length) return;
      queue.splice(0, queue.length);
      updateSlots();
    };

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        clear();
      });
    }
    updateSlots();

    return { add, clear };
  };

  const initScratchCards = (cards) => {
    const states = new WeakMap();

    const createState = (card) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'dream-card__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      card.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const state = {
        card,
        canvas,
        ctx,
        drawing: false,
        lastPoint: null,
        radius: 28,
        dimensions: { width: 0, height: 0 },
      };

      const refreshGradient = () => {
        const rect = card.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        const dpr = window.devicePixelRatio || 1;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(33, 14, 66, 0.88)');
        gradient.addColorStop(1, 'rgba(90, 34, 153, 0.72)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

        state.radius = Math.max(18, Math.min(48, width * 0.08));
        state.dimensions = { width, height };
        state.lastPoint = null;
        state.drawing = false;
      };

      const eraseCircle = (x, y, radius = state.radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      const eraseStroke = (fromPoint, toPoint) => {
        if (!fromPoint) return;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = state.radius * 2.4;
        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
        ctx.restore();
      };

      const getPointFromEvent = (event) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      };

      const handlePointerDown = (event) => {
        event.preventDefault();
        canvas.setPointerCapture(event.pointerId);
        state.drawing = true;
        const point = getPointFromEvent(event);
        eraseCircle(point.x, point.y);
        state.lastPoint = point;
      };

      const handlePointerMove = (event) => {
        if (!state.drawing) return;
        event.preventDefault();
        const point = getPointFromEvent(event);
        eraseStroke(state.lastPoint, point);
        eraseCircle(point.x, point.y);
        state.lastPoint = point;
      };

      const handlePointerUp = () => {
        state.drawing = false;
        state.lastPoint = null;
      };

      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);

      const pulse = () => {
        const { width, height } = state.dimensions;
        if (!width || !height) return;
        const centerX = width / 2;
        const centerY = height / 2;
        const points = 6;
        for (let index = 0; index < points; index += 1) {
          const angle = (Math.PI * 2 * index) / points;
          const spread = Math.min(width, height) * 0.25;
          const x = centerX + Math.cos(angle) * spread;
          const y = centerY + Math.sin(angle) * spread;
          eraseCircle(x, y, state.radius * 1.2);
        }
        eraseCircle(centerX, centerY, state.radius * 1.6);
      };

      const reset = () => {
        refreshGradient();
      };

      refreshGradient();

      states.set(card, {
        reset,
        pulse,
        refresh: refreshGradient,
        canvas,
      });
    };

    cards.forEach(createState);

    const resizeAll = throttle(() => {
      cards.forEach((card) => {
        const state = states.get(card);
        if (state) {
          state.refresh();
        }
      });
    }, 200);

    window.addEventListener('resize', resizeAll);
    window.addEventListener('orientationchange', resizeAll);

    return {
      reset(card) {
        const state = states.get(card);
        if (state) {
          state.reset();
        }
      },
      pulse(card) {
        const state = states.get(card);
        if (state) {
          state.pulse();
        }
      },
    };
  };

  const initTitleFragments = (cards) => {
    const prepared = new WeakSet();
    const glyphCache = new WeakMap();

    const prepare = (card) => {
      if (prepared.has(card)) return;
      const title = card.querySelector('.card__title');
      if (!title) return;
      const text = title.textContent || '';
      const fragment = document.createDocumentFragment();
      Array.from(text).forEach((char) => {
        const span = document.createElement('span');
        span.className = 'dream-card__glyph';
        span.textContent = char === ' ' ? '\u00A0' : char;
        fragment.appendChild(span);
      });
      title.textContent = '';
      title.appendChild(fragment);
      glyphCache.set(card, title.querySelectorAll('.dream-card__glyph'));
      prepared.add(card);
    };

    const activate = (card) => {
      prepare(card);
      const glyphs = glyphCache.get(card);
      if (!glyphs) return;
      glyphs.forEach((glyph) => {
        const translateX = (Math.random() - 0.5) * 6;
        const translateY = (Math.random() - 0.5) * 8;
        const rotate = (Math.random() - 0.5) * 10;
        const opacity = 0.75 + Math.random() * 0.2;
        glyph.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`;
        glyph.style.opacity = opacity.toFixed(2);
      });
    };

    const reset = (card) => {
      const glyphs = glyphCache.get(card);
      if (!glyphs) return;
      glyphs.forEach((glyph) => {
        glyph.style.transform = '';
        glyph.style.opacity = '';
      });
    };

    return { prepare, activate, reset };
  };

  const initAudioControls = () => {
    const cache = new Map();
    let activeAudio = null;
    let activeCard = null;

    const resolveSource = (card) => {
      const key = card.dataset.audio;
      if (!key) return null;
      return audioSources[key] || key;
    };

    const stopCurrent = () => {
      if (activeAudio) {
        activeAudio.pause();
        try {
          activeAudio.currentTime = 0;
        } catch (error) {
          /* noop */
        }
      }
      if (activeCard) {
        activeCard.classList.remove('dream-card--playing');
      }
      activeAudio = null;
      activeCard = null;
    };

    const play = (card) => {
      const source = resolveSource(card);
      if (!source) return;

      let audio = cache.get(source);
      if (!audio) {
        audio = new Audio(source);
        audio.preload = 'auto';
        audio.addEventListener('ended', () => {
          if (audio === activeAudio) {
            stopCurrent();
          }
        });
        cache.set(source, audio);
      }

      if (activeAudio && activeAudio !== audio) {
        stopCurrent();
      } else if (activeAudio === audio) {
        stopCurrent();
      }

      try {
        audio.currentTime = 0;
      } catch (error) {
        /* noop */
      }

      activeAudio = audio;
      activeCard = card;
      card.classList.add('dream-card--playing');

      const playback = audio.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(() => {
          stopCurrent();
        });
      }
    };

    const halt = (card) => {
      if (!card || card === activeCard) {
        stopCurrent();
      }
    };

    return { play, halt };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.querySelector('[data-dream-cards]');
    if (!cardsContainer) return;

    const cards = Array.from(cardsContainer.querySelectorAll('[data-frag][data-time]'));
    if (!cards.length) return;

    const scratchTools = initScratchCards(cards);
    const titleTools = initTitleFragments(cards);
    const threadTools = initThread(cards);
    const audioTools = initAudioControls();

    cardsContainer.addEventListener('click', (event) => {
      const resetButton = event.target.closest('[data-card-reset]');
      if (resetButton) {
        const card = resetButton.closest('[data-frag][data-time]');
        if (card) {
          scratchTools.reset(card);
          titleTools.reset(card);
          audioTools.halt(card);
        }
        return;
      }

      const card = event.target.closest('[data-frag][data-time]');
      if (!card || !cardsContainer.contains(card)) return;

      threadTools.add(card);
      audioTools.play(card);
    });

    cards.forEach((card) => {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      card.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.key === ' ') {
          event.preventDefault();
          scratchTools.pulse(card);
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          threadTools.add(card);
          audioTools.play(card);
        }
      });

      card.addEventListener('pointerenter', () => {
        titleTools.activate(card);
      });

      card.addEventListener('pointerleave', () => {
        titleTools.reset(card);
      });

      card.addEventListener('focus', () => {
        titleTools.prepare(card);
      });
    });
  });
})();
