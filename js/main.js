/* ============================================================
   FOOTER YEAR — keep the copyright current
   ============================================================ */

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* ============================================================
   STAGGERED HERO ENTRANCE ANIMATIONS
   Each [data-reveal="N"] element gets .is-visible with a delay
   proportional to N. The CSS animation does the rest.
   ============================================================ */

function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  elements.forEach((el) => {
    const index = parseInt(el.getAttribute('data-reveal'), 10) || 0;
    const delay = prefersReduced ? 0 : 220 + index * 180;

    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);
  });
}


/* ============================================================
   GSAP SCROLL ANIMATIONS
   Gated behind prefers-reduced-motion and GSAP availability.
   Reveals section headings, body blocks, and connect links as
   they scroll into view.
   ============================================================ */

function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If motion is off or GSAP failed to load, unhide everything immediately
  if (prefersReduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.querySelectorAll('[data-gsap-reveal], .connect__link').forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Section headings and body blocks — individual triggers
  document.querySelectorAll('[data-gsap-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        },
      }
    );
  });

  // Connect links — staggered slide-in from left
  const connectList = document.querySelector('.connect__list');
  if (connectList) {
    gsap.fromTo(
      '.connect__link',
      { opacity: 0, x: -28 },
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: connectList,
          start: 'top 86%',
        },
      }
    );
  }
}


/* ============================================================
   SLOW HORIZON CANVAS ANIMATION
   A few low, slow sine lines in the gold accent — a quiet,
   solemn undertone behind the hero rather than a lively wave.
   Positioned behind the hero text. Pauses when tab is hidden.
   Gated behind prefers-reduced-motion in init.
   ============================================================ */

let wave = null;

class ResonatingWave {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tick = 0;
    this.animId = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.rgb = this._readAccentRgb();

    // Lower amplitudes, slower speeds, restrained opacity — measured, not animated.
    this.layers = [
      { amp: 22,  freq: 0.0060, phase: 0.0,  speed: 0.0050, opacity: 0.16, width: 1.4 },
      { amp: 13,  freq: 0.0100, phase: 2.1,  speed: 0.0075, opacity: 0.09, width: 1.0 },
      { amp: 40,  freq: 0.0032, phase: 4.6,  speed: 0.0032, opacity: 0.06, width: 2.2 },
    ];

    this._resize();
    this._bindEvents();
  }

  _readAccentRgb() {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent-rgb')
      .trim();
    return val || '138, 106, 31';
  }

  _resize() {
    const { canvas, ctx, dpr } = this;
    const w = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    const h = canvas.offsetHeight || canvas.parentElement.offsetHeight;

    // Back the canvas at device resolution so lines stay crisp on HiDPI screens
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    // Draw in CSS pixels; the transform maps them to device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cssWidth  = w;
    this.cssHeight = h;
  }

  _draw() {
    const { ctx, layers, tick, rgb, cssWidth: width, cssHeight: height } = this;

    ctx.clearRect(0, 0, width, height);

    const centerY = height * 0.58;

    layers.forEach((layer) => {
      ctx.beginPath();

      for (let x = 0; x <= width; x += 2) {
        const y =
          centerY +
          Math.sin(x * layer.freq + tick * layer.speed + layer.phase) * layer.amp;

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${rgb}, ${layer.opacity})`;
      ctx.lineWidth   = layer.width;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.stroke();
    });

    this.tick++;
  }

  _animate() {
    this._draw();
    this.animId = requestAnimationFrame(() => this._animate());
  }

  start() {
    if (this.animId) return;
    this._animate();
  }

  stop() {
    cancelAnimationFrame(this.animId);
    this.animId = null;
  }

  _bindEvents() {
    const ro = new ResizeObserver(() => {
      this._resize();
    });
    ro.observe(this.canvas.parentElement);

    document.addEventListener('visibilitychange', () => {
      document.hidden ? this.stop() : this.start();
    });
  }
}


/* ============================================================
   INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initScrollAnimations();

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.getElementById('heroCanvas');

  function startWave() {
    if (wave || !canvas) return;
    wave = new ResonatingWave(canvas);
    wave.start();
  }

  // Wave — only if motion is acceptable
  if (!motionQuery.matches) {
    startWave();
  }

  // Respond if the user changes their motion preference mid-session
  motionQuery.addEventListener('change', (e) => {
    if (e.matches) {
      if (wave) wave.stop();
    } else {
      wave ? wave.start() : startWave();
    }
  });
});
