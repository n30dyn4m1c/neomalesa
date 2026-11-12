/* ============================================================
   SHARED HELPERS
   ============================================================ */

const EMAIL = 'neomalesa@protonmail.com';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A mouse or trackpad — tilt and magnetic pull are wasted on touch
const hasFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const hasGsap = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Clipboard with a textarea fallback for older browsers and insecure contexts
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
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
}


/* ============================================================
   FOOTER YEAR — keep the copyright current
   ============================================================ */

function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


/* ============================================================
   STAGGERED HERO ENTRANCE ANIMATIONS
   Each [data-reveal="N"] element gets .is-visible with a delay
   proportional to N. The CSS animation does the rest.
   ============================================================ */

function initReveal() {
  const reduced = prefersReducedMotion();

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const index = parseInt(el.getAttribute('data-reveal'), 10) || 0;
    const delay = reduced ? 0 : 220 + index * 150;

    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);
  });
}


/* ============================================================
   GSAP SCROLL ANIMATIONS
   Gated behind prefers-reduced-motion and GSAP availability.
   Single blocks rise on their own trigger; grouped children
   ([data-gsap-stagger]) rise one after another; the ghost
   numerals and portrait drift for quiet depth.
   ============================================================ */

function initScrollAnimations() {
  const hidden = '[data-gsap-reveal], [data-gsap-stagger] > *, .connect__link';

  // If motion is off or GSAP failed to load, unhide everything immediately
  if (prefersReducedMotion() || !hasGsap()) {
    document.querySelectorAll(hidden).forEach((el) => {
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
        // Leave no inline transform behind — hover and fullscreen rely on it
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      }
    );
  });

  // Groups — cards, figures, chips — arrive in sequence
  document.querySelectorAll('[data-gsap-stagger]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.09,
        clearProps: 'transform',
        scrollTrigger: { trigger: group, start: 'top 88%' },
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

  // Record — the brass spine draws downward as the posts scroll past
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    gsap.fromTo(
      timeline,
      { '--spine': 0 },
      {
        '--spine': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.6,
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
        clearProps: 'transform',
        scrollTrigger: { trigger: connectList, start: 'top 86%' },
      }
    );
  }
}


/* ============================================================
   THESIS — the conviction takes ink word by word as it crosses
   the viewport. Without GSAP or with motion off, every word
   stays fully lit.
   ============================================================ */

function initThesis() {
  const el = document.querySelector('[data-scrub]');
  if (!el || prefersReducedMotion() || !hasGsap()) return;

  gsap.registerPlugin(ScrollTrigger);

  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  const spans = words.map((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    span.style.setProperty('--lit', '0.16');
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return span;
  });

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    end: 'bottom 45%',
    onUpdate: (self) => {
      // A soft front six words deep sweeps across the sentence
      const front = self.progress * (spans.length + 6);
      spans.forEach((span, i) => {
        span.style.setProperty('--lit', clamp(0.16 + (front - i) / 6, 0.16, 1).toFixed(2));
      });
    },
  });
}


/* ============================================================
   FIGURES — count up once, the first time they are seen
   ============================================================ */

function initCounters() {
  const figures = document.querySelectorAll('[data-count]');
  if (!figures.length) return;

  figures.forEach((el) => {
    // "Years of published writing" stays true without an edit each January
    const since = parseInt(el.dataset.countSince, 10);
    if (since) el.dataset.count = String(new Date().getFullYear() - since);
    el.textContent = el.dataset.count;
  });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10);
    // A year reads better counting through recent decades than up from zero
    const from = 'countPlain' in el.dataset ? target - 36 : 0;
    const duration = 1600;
    const started = performance.now();

    const tick = (now) => {
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  figures.forEach((el) => observer.observe(el));
}


/* ============================================================
   TOP BAR
   Clear over the hero, a blurred slate once the page moves.
   Slides away on the way down and returns on the way up, carries
   the scroll-progress hairline, and opens as a sheet on small
   screens.
   ============================================================ */

function initTopbar() {
  const bar = document.getElementById('topbar');
  if (!bar) return;

  const toggle = bar.querySelector('.topbar__toggle');
  const nav = bar.querySelector('.topbar__nav');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;

    bar.style.setProperty('--progress', total > 0 ? (y / total).toFixed(4) : '0');
    bar.classList.toggle('is-scrolled', y > 24);

    // Hide only on a deliberate move down the page, never near the top
    if (Math.abs(y - lastY) > 6) {
      bar.classList.toggle('is-hidden', y > lastY && y > 480);
      lastY = y;
    }
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  window.addEventListener('resize', update);

  // Keyboard users always get the bar back when focus enters it
  bar.addEventListener('focusin', () => bar.classList.remove('is-hidden'));

  if (!toggle || !nav) return;

  const setOpen = (open) => {
    bar.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!bar.classList.contains('is-open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && bar.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}


/* ============================================================
   SECTION WAYFINDING
   The roman-numeral rail fades in once the hero scrolls out of
   view. The link for the section nearest the viewport centre
   carries aria-current — in the rail and in the top bar alike.
   ============================================================ */

function initRail() {
  if (!('IntersectionObserver' in window)) return;

  const rail = document.getElementById('rail');
  const hero = document.getElementById('hero');

  if (rail && hero) {
    new IntersectionObserver(
      ([entry]) => {
        rail.classList.toggle('is-visible', !entry.isIntersecting);
      },
      { threshold: 0.15 }
    ).observe(hero);
  }

  const links = Array.from(
    document.querySelectorAll('.rail__link[href^="#"], .topbar__nav a[href^="#"]')
  );
  if (!links.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach((l) => {
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

  new Set(links.map((l) => l.getAttribute('href').slice(1))).forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}


/* ============================================================
   LOCAL TIME — the hour in Port Moresby, kept current.
   A small proof that there is a person at the other end.
   ============================================================ */

function initClock() {
  const short = document.querySelectorAll('[data-clock]');
  const long = document.querySelectorAll('[data-clock-long]');
  if (!short.length && !long.length) return;

  let format;
  try {
    format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Pacific/Port_Moresby',
    });
  } catch (err) {
    return; // Time zone data unavailable — the place line stands on its own
  }

  const update = () => {
    const time = format.format(new Date());
    short.forEach((el) => {
      el.textContent = time + ' local time';
      el.hidden = false;
    });
    long.forEach((el) => {
      el.textContent = 'It is ' + time + ' in Port Moresby · UTC+10';
      el.hidden = false;
    });
  };

  update();
  setInterval(update, 20000);
}


/* ============================================================
   HERO SWELL — a slow sea drawn in brass hairlines along the
   foot of the hero. The lines lift toward the pointer. Paused
   off screen; a single still frame when motion is reduced.
   ============================================================ */

function initSwell() {
  const canvas = document.getElementById('hero-swell');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const LINES = 11;
  let width = 0;
  let height = 0;
  let visible = true;
  let frame = 0;
  // Pointer position in canvas pixels; strength eases in and out
  const pointer = { x: -9999, y: 0, strength: 0, target: 0 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    const t = time / 1000;
    ctx.clearRect(0, 0, width, height);
    pointer.strength += (pointer.target - pointer.strength) * 0.06;

    for (let i = 0; i < LINES; i++) {
      const depth = i / (LINES - 1);
      const base = height * (0.2 + depth * 0.78);
      const amp = 4 + depth * 12;
      const lift = pointer.strength * (26 + depth * 22) * Math.exp(-Math.pow((base - pointer.y) / 120, 2));

      ctx.beginPath();
      for (let x = -8; x <= width + 8; x += 8) {
        const y =
          base +
          amp * Math.sin(x * 0.011 + t * 0.55 + i * 0.7) +
          amp * 0.45 * Math.sin(x * 0.027 - t * 0.38 + i * 1.3) -
          lift * Math.exp(-Math.pow((x - pointer.x) / 150, 2));
        if (x === -8) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(197, 168, 128, ' + (0.07 + depth * 0.2).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const loop = (time) => {
    frame = 0;
    if (!visible) return;
    draw(time);
    frame = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (prefersReducedMotion()) draw(0);
  });

  if (prefersReducedMotion()) {
    draw(0);
    return;
  }

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.target = 1;
  });
  host.addEventListener('pointerleave', () => {
    pointer.target = 0;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(loop);
    }).observe(canvas);
  }
  frame = requestAnimationFrame(loop);
}


/* ============================================================
   START HERE — three readers, three answers.
   A standard tablist: click or arrow between tabs. The chosen
   path also presets the composer in Correspondence.
   ============================================================ */

function initPaths() {
  const tabs = Array.from(document.querySelectorAll('.paths__tab'));
  if (!tabs.length) return;

  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const active = t === tab;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      if (panel) {
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      }
    });
    if (focus) tab.focus();
    setIntent(tab.dataset.path);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      let next;
      if (step) next = tabs[(i + step + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      select(next, true);
    });
  });
}


/* ============================================================
   WORK FILTER — narrows the section to one subsection
   ============================================================ */

function initFilter() {
  const buttons = Array.from(document.querySelectorAll('.filter__btn'));
  const groups = Array.from(document.querySelectorAll('#work .subsection[data-kind]'));
  if (!buttons.length || !groups.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      groups.forEach((group) => {
        const show = kind === 'all' || group.dataset.kind === kind;
        if (show && group.hidden && hasGsap() && !prefersReducedMotion()) {
          gsap.fromTo(group, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' });
        }
        group.hidden = !show;
      });

      // The page just changed height — scroll triggers below must re-measure
      if (hasGsap()) ScrollTrigger.refresh();
    });
  });
}


/* ============================================================
   TILT + MAGNETIC PULL — pointer-led depth, mouse only.
   Cards lean toward the pointer with a brass light beneath it;
   primary buttons drift a few pixels toward it.
   ============================================================ */

function initPointerEffects() {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  document.querySelectorAll('.card__link').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  document.querySelectorAll('[data-magnetic]').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      button.style.setProperty('--bx', (dx * 0.22).toFixed(1) + 'px');
      button.style.setProperty('--by', (dy * 0.3).toFixed(1) + 'px');
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--bx', '0px');
      button.style.setProperty('--by', '0px');
    });
  });
}


/* ============================================================
   WRITING — render the latest posts.
   Posts come from writing-data.js (a script tag, so it also works
   when index.html is opened directly from disk); writing.json is a
   fetch fallback for any deployment where the script is missing.
   The home page shows only the newest few (data-limit on the list);
   the Writing page lists every post. data-src points the fallback
   fetch at writing.json from pages one folder down.
   ============================================================ */

function initWriting() {
  const list = document.getElementById('writing-list');
  if (!list) return;

  const limit = parseInt(list.dataset.limit, 10) || Infinity;
  const src = list.dataset.src || 'writing.json';

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
    return `<time class="writing__date" datetime="${iso}">${pretty}</time>`;
  };

  const render = (posts) => {
    if (!Array.isArray(posts) || !posts.length) return;
    list.innerHTML = posts
      .filter((p) => p && p.title && p.url)
      .slice(0, limit)
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

  fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error('writing.json unavailable');
      return res.json();
    })
    .then(render)
    .catch(() => {
      // Feed unavailable — the archive link below the list remains as the fallback.
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

  const tip = link.querySelector('.connect__copy-tip');
  let timer;

  link.addEventListener('click', (event) => {
    event.preventDefault();
    copyText(EMAIL)
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
   COMPOSER — a message drafted on the page, sent from the
   reader's own email. Nothing is transmitted or stored here:
   the form only assembles a mailto: link.

   Any link carrying data-intent presets the subject before the
   page scrolls to the form.
   ============================================================ */

const INTENTS = {
  role: { subject: 'A role', placeholder: 'The role, the organisation, and where it is based.' },
  project: { subject: 'A project', placeholder: 'What should exist that does not — and who it is for.' },
  advice: { subject: 'Advice or training', placeholder: 'The team, the subject, and the timing.' },
  question: { subject: 'A question', placeholder: 'Ask it plainly.' },
  other: { subject: 'Something else', placeholder: 'Say what it is.' },
};

// Set by the Interlude when all six beacons are lit — noted in the message
let crossingTime = '';

function setIntent(intent) {
  const form = document.getElementById('brief');
  if (!form || !INTENTS[intent]) return;
  const radio = form.querySelector('input[name="intent"][value="' + intent + '"]');
  if (!radio) return;
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
}

function initBrief() {
  const form = document.getElementById('brief');
  if (!form) return;

  const message = form.elements.message;
  const preview = document.getElementById('brief-preview');
  const subjectEl = document.getElementById('brief-subject');
  const bodyEl = document.getElementById('brief-body');
  const status = document.getElementById('brief-status');
  const copyButton = document.getElementById('brief-copy');
  let statusTimer;

  const say = (text) => {
    status.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = '';
    }, 2600);
  };

  const compose = () => {
    const intent = INTENTS[form.elements.intent.value] || INTENTS.other;
    const name = form.elements.name.value.trim();
    const org = form.elements.organisation.value.trim();
    const text = message.value.trim();

    const subject = intent.subject + (org ? ' — ' + org : name ? ' — ' + name : '');
    const signature = [name, org].filter(Boolean).join(', ');
    const body = [
      text,
      signature ? '— ' + signature : '',
      crossingTime ? '(All six beacons lit in ' + crossingTime + '.)' : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return { subject, body, empty: !text };
  };

  const update = () => {
    const intent = INTENTS[form.elements.intent.value] || INTENTS.other;
    message.placeholder = intent.placeholder;

    const { subject, body } = compose();
    const started = Boolean(message.value.trim() || form.elements.name.value.trim());
    preview.hidden = !started;
    subjectEl.textContent = 'Subject: ' + subject;
    bodyEl.textContent = body;
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { subject, body, empty } = compose();
    if (empty) {
      say('A line or two first');
      message.focus();
      return;
    }
    window.location.href =
      'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    say('Opening email');
  });

  copyButton.addEventListener('click', () => {
    const { subject, body, empty } = compose();
    if (empty) {
      say('A line or two first');
      message.focus();
      return;
    }
    copyText('To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body)
      .then(() => say('Copied'))
      .catch(() => say('Copy unavailable'));
  });

  // Calls to action elsewhere on the page preset the subject, then the
  // anchor scrolls here; focus follows once the scroll has settled
  document.querySelectorAll('[data-intent]').forEach((link) => {
    link.addEventListener('click', () => {
      setIntent(link.dataset.intent);
      setTimeout(() => message.focus({ preventScroll: true }), 1100);
    });
  });

  // Arriving from an index page: index.html?about=role#connect
  const about = new URLSearchParams(window.location.search).get('about');
  if (INTENTS[about]) setIntent(about);

  document.addEventListener('crossing:complete', (event) => {
    crossingTime = (event.detail && event.detail.time) || '';
    update();
  });
}


/* ============================================================
   INTERLUDE — Light the Islands.
   The game and its 3D library are fetched only when the reader
   chooses to play, so the page itself stays light.
   ============================================================ */

function initGame() {
  const root = document.getElementById('game');
  const start = document.getElementById('game-start');
  if (!root || !start) return;

  const status = document.getElementById('game-status');
  let game = null;

  const fail = (text) => {
    root.dataset.state = 'idle';
    start.disabled = false;
    status.textContent = text;
  };

  start.addEventListener('click', () => {
    if (game) {
      game.start();
      return;
    }

    root.dataset.state = 'loading';
    start.disabled = true;
    status.textContent = 'Raising the sail…';

    import('./game.js')
      .then((mod) => {
        game = mod.createGame(root);
        start.disabled = false;
        status.textContent = '';
        game.start();
      })
      .catch((err) => {
        console.error('Interlude failed to start:', err);
        fail(
          location.protocol === 'file:'
            ? 'The crossing needs the site served over HTTP — it cannot sail from a file on disk.'
            : 'This device cannot make the crossing — 3D graphics are unavailable. The rest of the page stands.'
        );
      });
  });
}


/* ============================================================
   ARRIVING AT A SECTION — index.html#connect from another page.
   The scroll-trigger library re-measures the page as it loads,
   which cancels the browser's own smooth jump to the anchor, so
   the landing is made here once loading has settled. It stands
   down the moment the reader scrolls for themselves.
   ============================================================ */

function initHashArrival() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;

  let readerMoved = false;
  const stop = () => {
    readerMoved = true;
  };
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) => {
    window.addEventListener(type, stop, { once: true, passive: true });
  });

  const land = () => {
    if (readerMoved) return;
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  const settle = () => [80, 450, 1000].forEach((delay) => setTimeout(land, delay));
  if (document.readyState === 'complete') settle();
  else window.addEventListener('load', settle);
}


/* ============================================================
   INIT
   ============================================================ */

// Each section is independent — one failing (an unsupported API on an old
// browser, say) should not take the rest of the page down with it.
document.addEventListener('DOMContentLoaded', () => {
  [
    initYear,
    initReveal,
    initThesis,
    initScrollAnimations,
    initCounters,
    initTopbar,
    initRail,
    initClock,
    initSwell,
    initPaths,
    initFilter,
    initPointerEffects,
    initWriting,
    initCopyEmail,
    initBrief,
    initGame,
    initHashArrival,
  ].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(init.name + ' failed:', err);
    }
  });
});
