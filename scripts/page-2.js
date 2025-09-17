(function () {
  const duplicateStream = () => {
    const stream = document.querySelector('[data-stream]');
    if (!stream) return;

    const slides = Array.from(stream.children);
    slides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      stream.appendChild(clone);
    });
  };

  document.addEventListener('DOMContentLoaded', duplicateStream);
})();
