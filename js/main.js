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
   Drives both the desktop side rail and the mobile bottom strip,
   plus the mobile strip's scroll-progress hairline.
   ============================================================ */

function initRail() {
  const rails = [document.getElementById('rail'), document.getElementById('mobile-rail')].filter(Boolean);
  if (!rails.length || !('IntersectionObserver' in window)) return;

  const hero = document.getElementById('hero');
  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        rails.forEach((r) => r.classList.toggle('is-visible', !entry.isIntersecting));
      },
      { threshold: 0.15 }
    ).observe(hero);
  }

  // The mobile rail should never cover the colophon — slide away while the
  // footer is on screen.
  const mobileRail = document.getElementById('mobile-rail');
  const footer = document.querySelector('.footer');
  if (mobileRail && footer) {
    new IntersectionObserver(
      ([entry]) => {
        mobileRail.classList.toggle('is-hidden', entry.isIntersecting);
      },
      { threshold: 0.02 }
    ).observe(footer);
  }

  // Scroll progress along the mobile rail's top hairline
  const progress = mobileRail && mobileRail.querySelector('.mobile-rail__progress');
  if (progress) {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      progress.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  const allLinks = [];
  rails.forEach((r) => {
    r.querySelectorAll('a[href^="#"]').forEach((l) => allLinks.push(l));
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        allLinks.forEach((l) => {
          if (l.getAttribute('href') === id) {
            l.setAttribute('aria-current', 'true');
          } else {
            l.removeAttribute('aria-current');
          }
        });
      });
    },
    // A narrow band around the viewport centre decides the active section
    { rootMargin: '-45% 0px -45% 0px' }
  );

  allLinks.forEach((l) => {
    const section = document.getElementById(l.getAttribute('href').slice(1));
    if (section) sectionObserver.observe(section);
  });
}


/* ============================================================
   WRITING — render the latest posts.
   Posts come from writing-data.js (a script tag, so it also works
   when index.html is opened directly from disk); writing.json is a
   fetch fallback for any deployment where the script is missing.
   ============================================================ */

function initWriting() {
  const list = document.getElementById('writing-list');
  if (!list) return;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const formatDate = (raw) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    const iso = d.toISOString().slice(0, 10);
    const pretty = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
    return `<time datetime="${iso}">${pretty}</time>`;
  };

  const render = (posts) => {
    if (!Array.isArray(posts) || !posts.length) return;
    list.innerHTML = posts
      .filter((p) => p && p.title && p.url)
      .map((p) => {
        const excerpt = p.excerpt
          ? `<span class="writing__excerpt">${escapeHtml(p.excerpt)}</span>`
          : '';
        return `
            <li class="writing__item">
              <a class="writing__link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Read: ${escapeHtml(p.title)} (opens in a new tab)">
                ${formatDate(p.date)}
                <span class="writing__title">${escapeHtml(p.title)}</span>
                ${excerpt}
                <span class="writing__arrow" aria-hidden="true">→</span>
              </a>
            </li>
          `;
      })
      .join('');
  };

  if (Array.isArray(window.NEO_WRITING) && window.NEO_WRITING.length) {
    render(window.NEO_WRITING);
    return;
  }

  fetch('writing.json')
    .then((res) => {
      if (!res.ok) throw new Error('writing.json unavailable');
      return res.json();
    })
    .then(render)
    .catch(() => {
      // Feed unavailable — the "Read on Medium" CTA remains as the fallback.
    });
}


/* ============================================================
   COPY EMAIL — the Correspondence email row copies the address
   to the clipboard and confirms quietly. Falls back to the
   mailto: link if the Clipboard API is unavailable.
   ============================================================ */

function initCopyEmail() {
  const link = document.querySelector('.connect__link--copy');
  if (!link) return;

  const email = link.getAttribute('href').replace(/^mailto:/, '');
  const tip = link.querySelector('.connect__copy-tip');
  let timer;

  const copy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(email);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        ta.remove();
      }
    });
  };

  link.addEventListener('click', (event) => {
    event.preventDefault();
    copy()
      .then(() => {
        link.classList.add('is-copied');
        if (tip) {
          tip.textContent = 'Copied';
          tip.classList.add('is-visible');
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          link.classList.remove('is-copied');
          if (tip) {
            tip.classList.remove('is-visible');
          }
        }, 1800);
      })
      .catch(() => {
        // Clipboard unavailable — fall back to opening the mail client
        window.location.href = link.getAttribute('href');
      });
  });
}


/* ============================================================
   INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initScrollAnimations();
  initRail();
  initWriting();
  initCopyEmail();
});
