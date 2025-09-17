(function () {
  const DreamHero = (() => {
    let sketchInstance = null;
    let canvasHost = null;
    let heroElement = null;
    let resizeObserver = null;
    let initialized = false;
    let activeState = 'on';

    const pointer = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      intensity: 0,
      hasPointer: false,
    };

    let particles = [];

    const clamp01 = (value) => Math.min(1, Math.max(0, value));

    const createParticles = (width, height) => {
      const area = width * height;
      const baseCount = Math.min(160, Math.max(60, Math.floor(area / 16000)));
      particles = Array.from({ length: baseCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 2.5,
        drift: 0.25 + Math.random() * 0.55,
        offset: Math.random() * Math.PI * 2,
      }));
    };

    const updatePointerFromEvent = (event) => {
      if (!heroElement) return;
      const rect = heroElement.getBoundingClientRect();
      let clientX = event.clientX;
      let clientY = event.clientY;

      if (event.touches && event.touches.length) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      pointer.targetX = clamp01((clientX - rect.left) / rect.width);
      pointer.targetY = clamp01((clientY - rect.top) / rect.height);
      pointer.hasPointer = true;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0.5;
      pointer.targetY = 0.5;
      pointer.hasPointer = false;
    };

    const attachPointerListeners = () => {
      if (!heroElement) return;
      heroElement.addEventListener('pointermove', updatePointerFromEvent);
      heroElement.addEventListener('pointerleave', handlePointerLeave);
      heroElement.addEventListener('touchmove', updatePointerFromEvent, { passive: true });
      heroElement.addEventListener('touchend', handlePointerLeave, { passive: true });
      heroElement.addEventListener('touchcancel', handlePointerLeave, { passive: true });
    };

    const detachPointerListeners = () => {
      if (!heroElement) return;
      heroElement.removeEventListener('pointermove', updatePointerFromEvent);
      heroElement.removeEventListener('pointerleave', handlePointerLeave);
      heroElement.removeEventListener('touchmove', updatePointerFromEvent);
      heroElement.removeEventListener('touchend', handlePointerLeave);
      heroElement.removeEventListener('touchcancel', handlePointerLeave);
    };

    const ensureCanvasSize = (p) => {
      if (!canvasHost) return;
      const width = Math.max(canvasHost.clientWidth, 320);
      const height = Math.max(canvasHost.clientHeight, 320);

      if (width !== p.width || height !== p.height) {
        p.resizeCanvas(width, height);
        createParticles(width, height);
      }
    };

    const registerResizeObserver = (p) => {
      if (typeof ResizeObserver !== 'function' || !heroElement) return;

      resizeObserver = new ResizeObserver(() => {
        ensureCanvasSize(p);
      });
      resizeObserver.observe(heroElement);
    };

    const teardownResizeObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };

    const sketchFactory = (p) => {
      p.setup = () => {
        const density = Math.min(window.devicePixelRatio || 1, 1.5);
        p.pixelDensity(density);
        const canvas = p.createCanvas(
          Math.max(canvasHost?.clientWidth || 0, 320),
          Math.max(canvasHost?.clientHeight || 0, 320)
        );
        if (canvasHost) {
          canvas.parent(canvasHost);
        }
        p.clear();
        p.noStroke();
        createParticles(p.width, p.height);
        registerResizeObserver(p);
      };

      p.draw = () => {
        if (activeState === 'off') {
          p.clear();
          return;
        }

        ensureCanvasSize(p);
        pointer.x += (pointer.targetX - pointer.x) * 0.08;
        pointer.y += (pointer.targetY - pointer.y) * 0.08;
        pointer.intensity += ((pointer.hasPointer ? 1 : 0) - pointer.intensity) * 0.05;

        const width = p.width;
        const height = p.height;
        const ctx = p.drawingContext;
        const elapsed = p.millis() * 0.001;

        p.clear(0, 0, 0, 0);

        const tiltX = (pointer.y - 0.5) * 0.8;
        const tiltY = (pointer.x - 0.5) * 0.8;

        ctx.save();
        p.push();
        p.translate(width / 2, height / 2);
        p.rotate(tiltY * 0.12);
        p.scale(1.08 + tiltX * 0.05, 1.08 - tiltY * 0.05);
        const baseGradient = ctx.createLinearGradient(-width * 0.6, -height * 0.6, width * 0.6, height * 0.6);
        baseGradient.addColorStop(0, 'rgba(76, 29, 149, 0.42)');
        baseGradient.addColorStop(0.5, 'rgba(17, 24, 39, 0.0)');
        baseGradient.addColorStop(1, 'rgba(129, 140, 248, 0.38)');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(-width, -height, width * 2, height * 2);
        p.pop();
        ctx.restore();

        const fissureHeight = height * 0.7;
        const fissureWidth = Math.min(width * 0.65, 960);
        const breathing = 0.18 + 0.06 * Math.sin(elapsed * 1.6);
        const amplitude = (Math.max(height, width) * 0.08 + 24) * (0.6 + breathing);
        ctx.save();
        p.push();
        p.translate(width / 2, height / 2);
        p.rotate(tiltY * 0.05 - tiltX * 0.03);
        const fissureGradient = ctx.createLinearGradient(0, -fissureHeight / 2, 0, fissureHeight / 2);
        fissureGradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
        fissureGradient.addColorStop(0.5, `rgba(224, 231, 255, ${0.52 + pointer.intensity * 0.28})`);
        fissureGradient.addColorStop(1, 'rgba(165, 180, 252, 0)');
        ctx.fillStyle = fissureGradient;
        ctx.beginPath();
        const segments = 42;
        for (let i = 0; i <= segments; i += 1) {
          const t = i / segments;
          const wave = Math.sin(elapsed * 1.9 + t * 7.5);
          const spread = Math.sin(elapsed * 0.7 + t * 3.2) * 0.28 + 0.72;
          const x = (t - 0.5) * fissureWidth * spread;
          const y = -fissureHeight / 2 + t * fissureHeight;
          const offset = wave * amplitude * (0.3 + t * 0.5);
          ctx.lineTo(x - offset, y);
        }
        for (let i = segments; i >= 0; i -= 1) {
          const t = i / segments;
          const wave = Math.sin(elapsed * 1.9 + t * 7.5);
          const spread = Math.sin(elapsed * 0.7 + t * 3.2) * 0.28 + 0.72;
          const x = (t - 0.5) * fissureWidth * spread;
          const y = -fissureHeight / 2 + t * fissureHeight;
          const offset = wave * amplitude * (0.3 + t * 0.5);
          ctx.lineTo(x + offset, y);
        }
        ctx.closePath();
        ctx.shadowColor = `rgba(196, 181, 253, ${0.3 + pointer.intensity * 0.25})`;
        ctx.shadowBlur = 42;
        ctx.fill();
        p.pop();
        ctx.restore();

        p.push();
        p.noStroke();
        const wind = (pointer.x - 0.5) * 1.2 + Math.sin(elapsed * 0.6) * 0.4;
        particles.forEach((particle) => {
          particle.x += wind * 0.8 + Math.sin(elapsed * 1.4 + particle.offset) * 0.3;
          particle.y += Math.cos(elapsed * 1.1 + particle.offset) * 0.35 + particle.drift * 0.18;

          if (particle.x < -60) particle.x = width + 60;
          if (particle.x > width + 60) particle.x = -60;
          if (particle.y < -60) particle.y = height + 60;
          if (particle.y > height + 60) particle.y = -60;

          const alpha = 110 + Math.sin(elapsed * 2 + particle.offset) * 60;
          p.fill(180, 205, 255, Math.max(0, Math.min(255, alpha)) * (0.35 + pointer.intensity * 0.3));
          p.circle(particle.x, particle.y, particle.size * (1 + pointer.intensity * 0.35));
        });
        p.pop();

        const highlightX = pointer.x * width;
        const highlightY = pointer.y * height;
        const auraRadius = Math.max(width, height) * (0.3 + pointer.intensity * 0.25);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const lightGradient = ctx.createRadialGradient(
          highlightX,
          highlightY,
          Math.max(10, auraRadius * 0.12),
          highlightX,
          highlightY,
          auraRadius
        );
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.18 + pointer.intensity * 0.26})`);
        lightGradient.addColorStop(1, 'rgba(22, 20, 48, 0)');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(highlightX - auraRadius, highlightY - auraRadius, auraRadius * 2, auraRadius * 2);
        ctx.restore();
      };

      p.remove = () => {
        teardownResizeObserver();
        detachPointerListeners();
      };
    };

    const init = (host, { host: hero, state } = {}) => {
      if (!host || initialized) return;
      canvasHost = host;
      heroElement = hero || canvasHost.closest('.hero');
      activeState = state === 'off' ? 'off' : 'on';
      pointer.x = 0.5;
      pointer.y = 0.5;
      pointer.targetX = 0.5;
      pointer.targetY = 0.5;
      pointer.intensity = 0;
      pointer.hasPointer = false;

      attachPointerListeners();

      sketchInstance = new p5(sketchFactory, canvasHost);

      if (activeState === 'off') {
        sketchInstance.noLoop();
        sketchInstance.clear();
      }

      initialized = true;
    };

    const setEffectsState = (state) => {
      if (!sketchInstance) return;
      const nextState = state === 'off' ? 'off' : 'on';
      if (nextState === activeState) return;

      activeState = nextState;
      if (activeState === 'off') {
        pointer.hasPointer = false;
        pointer.targetX = 0.5;
        pointer.targetY = 0.5;
        sketchInstance.clear();
        sketchInstance.noLoop();
      } else {
        sketchInstance.loop();
      }
    };

    return { init, setEffectsState };
  })();

  window.DreamHero = DreamHero;
})();
