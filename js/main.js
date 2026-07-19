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
   they scroll into view; drifts the ghost numerals and portrait
   for quiet depth.
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

  // Ghost numerals — slow counter-drift against the scroll.
  // The numeral is the heading's ::before, so the heading itself is
  // the proxy target: a custom property drives the pseudo-element.
  document.querySelectorAll('.section__heading[data-ghost]').forEach((el) => {
    const section = el.closest('.section');
    gsap.fromTo(
      el,
      { '--ghost-y': '70px' },
      {
        '--ghost-y': '-70px',
        ease: 'none',
        scrollTrigger: {
          trigger: section || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );
  });

  // Hero portrait — gentle parallax on the wrapper so the CSS
  // scale-settle on the <img> is left untouched
  const portraitFrame = document.querySelector('.hero__portrait picture');
  if (portraitFrame && window.matchMedia('(min-width: 900px)').matches) {
    gsap.fromTo(
      portraitFrame,
      { yPercent: 0 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
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
   SECTION RAIL
   Fades in once the hero scrolls out of view; the numeral for
   the section nearest the viewport centre carries aria-current.
   ============================================================ */

function initRail() {
  const rail = document.getElementById('rail');
  if (!rail || !('IntersectionObserver' in window)) return;

  const hero = document.getElementById('hero');
  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        rail.classList.toggle('is-visible', !entry.isIntersecting);
      },
      { threshold: 0.15 }
    ).observe(hero);
  }

  const links = new Map();
  rail.querySelectorAll('.rail__link').forEach((link) => {
    links.set(link.getAttribute('href').slice(1), link);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = links.get(entry.target.id);
        if (!link) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'true');
      });
    },
    // A narrow band around the viewport centre decides the active section
    { rootMargin: '-45% 0px -45% 0px' }
  );

  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}


/* ============================================================
   INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initScrollAnimations();
  initRail();
});
