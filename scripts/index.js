(function () {
  const initFlipCards = (root) => {
    const cards = root.querySelectorAll('[data-hero-card]');
    if (!cards.length) return;

    const toggleCard = (card) => {
      card.classList.toggle('is-flipped');
    };

    const onCardClick = (event) => {
      const card = event.currentTarget;
      if (event.target.closest('[data-copy-button]')) return;
      toggleCard(card);
    };

    const onCardKey = (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleCard(event.currentTarget);
    };

    cards.forEach((card) => {
      card.addEventListener('click', onCardClick);
      card.addEventListener('keydown', onCardKey);
      card.addEventListener('blur', () => card.classList.remove('is-flipped'));
    });
  };

  const initCopyButtons = (root) => {
    const buttons = root.querySelectorAll('[data-copy-button]');
    if (!buttons.length) return;

    buttons.forEach((button) => {
      const defaultLabel = button.textContent;
      const promptNode = button.closest('.flip-card__face')?.querySelector('[data-prompt]');
      if (!promptNode) return;

      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const text = promptNode.textContent?.trim();
        if (!text) return;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const temp = document.createElement('textarea');
            temp.value = text;
            temp.setAttribute('readonly', '');
            temp.style.position = 'absolute';
            temp.style.left = '-9999px';
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
          }
          button.classList.add('is-copied');
          button.textContent = 'Copied!';
        } catch (error) {
          button.textContent = 'Copy failed';
        }

        setTimeout(() => {
          button.classList.remove('is-copied');
          button.textContent = defaultLabel;
        }, 1600);
      });
    });
  };

  const initHeroEffects = () => {
    const hero = document.querySelector('.hero[data-effects]');
    if (!hero) return;

    initFlipCards(hero);
    initCopyButtons(hero);

    const canvasHost = hero.querySelector('[data-hero-canvas]');

    const prefersReducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const getState = () => (hero.getAttribute('data-effects') === 'off' ? 'off' : 'on');

    if (prefersReducedMotion && prefersReducedMotion.matches && getState() !== 'off') {
      hero.setAttribute('data-effects', 'off');
    }

    if (!canvasHost || !window.DreamHero?.init) return;

    window.DreamHero.init(canvasHost, {
      host: hero,
      state: getState(),
    });

    const observer = new MutationObserver(() => {
      window.DreamHero.setEffectsState?.(getState());
    });

    observer.observe(hero, { attributes: true, attributeFilter: ['data-effects'] });

    if (prefersReducedMotion) {
      const mqHandler = (event) => {
        hero.setAttribute('data-effects', event.matches ? 'off' : 'on');
      };
      if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', mqHandler);
      } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(mqHandler);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', initHeroEffects);
})();
