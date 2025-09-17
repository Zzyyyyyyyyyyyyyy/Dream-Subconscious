(function () {
  const highlightActiveLink = () => {
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const current = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
      const target = link.getAttribute('href');
      if ((current === '' && target === 'index.html') || current === target) {
        link.classList.add('navigation__link--active');
      }
    });
  };

  const setupScrollBehavior = () => {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > 120) {
        header.classList.add('layout__nav--hidden');
      } else {
        header.classList.remove('layout__nav--hidden');
      }
      lastScroll = currentScroll;
    });
  };

  const initAOS = () => {
    if (window.AOS) {
      window.AOS.init({
        duration: 650,
        easing: 'ease-out-quart',
        once: true,
        offset: 120,
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    setupScrollBehavior();
    initAOS();
  });
})();
