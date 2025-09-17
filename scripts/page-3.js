(function () {
  const animateTimeline = () => {
    if (!window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray('[data-timeline-item]').forEach((item, index) => {
      window.gsap.fromTo(
        item,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    window.gsap.utils.toArray('[data-sequence-card]').forEach((card) => {
      window.gsap.fromTo(
        card,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  };

  document.addEventListener('DOMContentLoaded', animateTimeline);
})();
