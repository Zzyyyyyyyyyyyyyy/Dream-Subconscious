(function () {
  const root = document.querySelector('[data-chaos]');
  if (!root) return;

  const fragments = Array.from(root.querySelectorAll('[data-fragment]'));
  const toggleButton = root.querySelector('[data-chaos-toggle]');
  const shuffleButton = root.querySelector('[data-chaos-shuffle]');
  const stage = root.querySelector('[data-chaos-stage]');

  if (!fragments.length || !toggleButton || !shuffleButton || !stage) {
    return;
  }

  let chaosActive = false;
  let panicActive = false;
  let fearRevealTimer = null;

  const driftData = new Map();

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const assignDriftProperties = (fragment) => {
    const settings = {
      x: randomBetween(8, 92),
      y: randomBetween(12, 88),
      floatX: randomBetween(-36, 36),
      floatY: randomBetween(-28, 28),
      rotate: randomBetween(-16, 18),
      scale: randomBetween(0.78, 1.22),
      floatDuration: randomBetween(7.5, 13.5),
      floatDelay: randomBetween(-6, 6),
    };

    driftData.set(fragment, settings);

    fragment.style.setProperty('--x', `${settings.x}%`);
    fragment.style.setProperty('--y', `${settings.y}%`);
    fragment.style.setProperty('--float-x', `${settings.floatX}px`);
    fragment.style.setProperty('--float-y', `${settings.floatY}px`);
    fragment.style.setProperty('--rotate', `${settings.rotate}deg`);
    fragment.style.setProperty('--scale', settings.scale.toFixed(2));
    fragment.style.setProperty('--float-duration', `${settings.floatDuration.toFixed(2)}s`);
    fragment.style.setProperty('--float-delay', `${settings.floatDelay.toFixed(2)}s`);
  };

  const assignGridTargets = () => {
    const baseColumns = Math.round(Math.sqrt(fragments.length));
    const columns = Math.min(4, Math.max(2, baseColumns || 2));
    const rows = Math.ceil(fragments.length / columns);

    fragments.forEach((fragment, index) => {
      const columnIndex = index % columns;
      const rowIndex = Math.floor(index / columns);
      const columnRatio = columns > 1 ? columnIndex / (columns - 1) : 0.5;
      const rowRatio = rows > 1 ? rowIndex / (rows - 1) : 0.5;

      const baseX = 18 + columnRatio * 64;
      const baseY = 18 + rowRatio * 64;

      const jitterX = randomBetween(-7, 7);
      const jitterY = randomBetween(-6, 6);

      fragment.style.setProperty('--grid-x', `${(baseX + jitterX).toFixed(2)}%`);
      fragment.style.setProperty('--grid-y', `${(baseY + jitterY).toFixed(2)}%`);
      fragment.style.setProperty('--grid-rotate', `${randomBetween(-5, 5).toFixed(2)}deg`);
      fragment.style.setProperty('--grid-scale', randomBetween(0.88, 1.12).toFixed(2));
    });
  };

  const shuffleFragments = () => {
    fragments.forEach((fragment) => assignDriftProperties(fragment));
    assignGridTargets();
  };

  const toggleChaosMode = () => {
    chaosActive = !chaosActive;
    root.classList.toggle('is-chaos', chaosActive);
    toggleButton.textContent = chaosActive ? 'Return to Drift' : 'Enter Chaos';
    toggleButton.setAttribute('aria-pressed', String(chaosActive));

    if (chaosActive) {
      assignGridTargets();
    }
  };

  const togglePanicMode = () => {
    panicActive = !panicActive;
    root.classList.toggle('is-panic', panicActive);
  };

  const beginFearReveal = () => {
    window.clearTimeout(fearRevealTimer);
    fearRevealTimer = window.setTimeout(() => {
      root.classList.add('is-fear');
    }, 220);
  };

  const endFearReveal = () => {
    window.clearTimeout(fearRevealTimer);
    root.classList.remove('is-fear');
  };

  shuffleFragments();
  toggleButton.setAttribute('aria-pressed', 'false');

  toggleButton.addEventListener('click', toggleChaosMode);

  shuffleButton.addEventListener('click', () => {
    shuffleFragments();

    if (chaosActive) {
      root.classList.remove('is-chaos');
      window.requestAnimationFrame(() => {
        root.classList.add('is-chaos');
      });
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'p' || event.key === 'P') && !event.repeat) {
      togglePanicMode();
    }
  });

  stage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    beginFearReveal();
  });

  stage.addEventListener('pointerup', endFearReveal);
  stage.addEventListener('pointerleave', endFearReveal);
  stage.addEventListener('pointercancel', endFearReveal);
  root.addEventListener('touchend', endFearReveal);
  root.addEventListener('touchcancel', endFearReveal);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      panicActive = false;
      root.classList.remove('is-panic');
      endFearReveal();
    }
  });
})();
