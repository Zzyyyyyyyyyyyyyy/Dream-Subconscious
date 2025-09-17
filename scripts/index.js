(function () {
  const animateCounters = () => {
    const counterNodes = document.querySelectorAll('[data-counter]');
    if (!counterNodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target;
          const target = Number(node.getAttribute('data-target'));
          const duration = 1200;
          const start = performance.now();

          const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const nextValue = Math.floor(progress * target);
            node.textContent = `${nextValue}`;
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
          observer.unobserve(node);
        });
      },
      { threshold: 0.4 }
    );

    counterNodes.forEach((node) => observer.observe(node));
  };

  document.addEventListener('DOMContentLoaded', animateCounters);
})();
