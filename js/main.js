/* ============================================================
   THEME TOGGLE
   ============================================================ */

const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

// Sync aria-label with whatever the inline script already set
applyTheme(html.getAttribute('data-theme') || 'light');

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  // Re-read accent RGB for wave on theme change
  if (wave) wave.refreshColor();
});


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
    const delay = prefersReduced ? 0 : 180 + index * 130;

    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);
  });
}


/* ============================================================
   GSAP SCROLL ANIMATIONS
   Gated behind prefers-reduced-motion and GSAP availability.
   Reveals section headings, body blocks, project cards, and
   connect links as they scroll into view.
   ============================================================ */

function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If motion is off or GSAP failed to load, unhide everything immediately
  if (prefersReduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.querySelectorAll('[data-gsap-reveal], .project-card, .connect__link').forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Section headings and body blocks — individual triggers
  document.querySelectorAll('[data-gsap-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        },
      }
    );
  });

  // Project cards — staggered from the grid trigger
  const projectsGrid = document.querySelector('.projects__grid');
  if (projectsGrid) {
    gsap.fromTo(
      '.project-card',
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: projectsGrid,
          start: 'top 84%',
        },
      }
    );
  }

  // Connect links — staggered slide-in from left
  const connectList = document.querySelector('.connect__list');
  if (connectList) {
    gsap.fromTo(
      '.connect__link',
      { opacity: 0, x: -28 },
      {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: connectList,
          start: 'top 86%',
        },
      }
    );
  }
}


/* ============================================================
   RESONATING WAVE CANVAS ANIMATION
   Multiple layered sine waves rendered in the gold accent.
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
    this.rgb = this._readAccentRgb();

    this.layers = [
      { amp: 30,  freq: 0.0070, phase: 0.0,  speed: 0.013, opacity: 0.38, width: 1.8 },
      { amp: 18,  freq: 0.0115, phase: 2.1,  speed: 0.020, opacity: 0.22, width: 1.2 },
      { amp: 46,  freq: 0.0038, phase: 4.6,  speed: 0.008, opacity: 0.12, width: 2.8 },
      { amp: 11,  freq: 0.0190, phase: 1.3,  speed: 0.028, opacity: 0.16, width: 0.9 },
    ];

    this._resize();
    this._bindEvents();
  }

  _readAccentRgb() {
    const val = getComputedStyle(html)
      .getPropertyValue('--color-accent-rgb')
      .trim();
    return val || '166, 124, 34';
  }

  refreshColor() {
    this.rgb = this._readAccentRgb();
  }

  _resize() {
    const { canvas } = this;
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  }

  _draw() {
    const { ctx, canvas, layers, tick, rgb } = this;
    const { width, height } = canvas;

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

  // Wave — only if motion is acceptable
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReduced.matches) {
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
      wave = new ResonatingWave(canvas);
      wave.start();
    }
  }
});
