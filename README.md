# Neo Malesa — Personal Site

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Site](https://img.shields.io/badge/Site-neomalesa.com-222222)](https://neomalesa.com)

**Personal website and portfolio of Neo Malesa — vanilla HTML, CSS, and JavaScript. No framework, no build step.**

Portfolio with a dark editorial design, built to start conversations — a home page that answers to who is reading it, a message composer, an interactive 3D interlude, index pages for each section, self-hosted fonts and GSAP animations, a “Now” page, and a Medium writing feed and Now page refreshed weekly by GitHub Actions.

**Live site:** [https://neomalesa.com](https://neomalesa.com)

## Features

- Home page in seven numbered sections with indexed subsections: **Start Here**, **Work** (data stories, systems, tools), **Engagements**, **Writing**, **Background**, **Interlude**, **Correspondence**
- **Start Here** — three tabs (hiring, a project, curious), each with its own case and call to act
- **Composer** — pick a topic, add an optional note, and one click opens a ready-to-send email in the reader's own app; nothing is sent or stored by the site. Any link with `data-intent`, or `index.html?about=role#connect` from another page, presets the subject
- **Light the Islands** — a 3D sailing game (three.js) that tells the record through play; fetched only when the reader starts it
- Top bar with a standing call to contact on every page; each index page closes with its own call
- Motion: pointer-reactive swell lines in the hero, ticker, scroll-lit conviction, counting figures, tilting work cards, live Port Moresby time
- Index pages: **Writing**, **Data Visualisations**, **Resources**, **Experience** (with capabilities and education), **Engagements**
- **Now** page for current focus, updated in place
- Self-hosted Cormorant Garamond + Spectral (no Google Fonts request)
- GSAP 3 + ScrollTrigger scroll animations (self-hosted, no CDN; loaded only on the pages that use them)
- All motion respects `prefers-reduced-motion`; the page reads in full with JavaScript off
- Medium writing feed via scheduled GitHub Action (no runtime third-party calls)
- Open Graph / Twitter cards, canonical URL, JSON-LD `Person` schema
- View Transitions API cross-document fades
- Branded 404 page for GitHub Pages

## Run locally

```bash
# Open directly in a browser
open index.html

# Or serve over HTTP (recommended — the 3D interlude needs HTTP to load)
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy on GitHub Pages

### This repository (project site)

1. Go to **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**, branch `main`, folder `/` (root).
3. Save. The site is also available at `https://n30dyn4m1c.github.io/neomalesa/`.

### Custom domain (`neomalesa.com`)

The `CNAME` file is already set to `neomalesa.com`. At your DNS provider:

| Type  | Name | Value                 |
|-------|------|-----------------------|
| A     | @    | 185.199.108.153       |
| A     | @    | 185.199.109.153       |
| A     | @    | 185.199.110.153       |
| A     | @    | 185.199.111.153       |
| CNAME | www  | n30dyn4m1c.github.io. |

In **Settings → Pages → Custom domain**, enter `neomalesa.com`, save, wait for DNS, then enable **Enforce HTTPS**.

## Structure

```text
index.html               home page — seven numbered sections, each linking to its index page
writing/index.html       Writing index — every post in the feed
dataviz/index.html       Data Visualisations index (+ one folder per static graphic)
resources/index.html     Resources index — all free public tools
experience/index.html    Experience index — roles, capabilities, education
engagements/index.html   Engagements index — areas of engagement in full
now.html                 "Now" page — what's current, updated in place
404.html                 branded not-found page (served by GitHub Pages)
css/style.css            design tokens and all styles (single dark scheme)
js/main.js               top bar, hero reveals and swell, scroll animations, tabs, work filter, composer, writing feed
js/game.js               Light the Islands — the 3D interlude (ES module, loaded on demand by main.js)
writing-data.js          latest Medium posts as a script (Writing section)
writing.json             same posts as plain JSON, refreshed by GitHub Action
writing-pinned.json      hand-listed posts merged into the Writing section (sorted by date)
.github/workflows/       update-writing.yml, update-now.yml — weekly refreshes (Mondays), also runnable by hand
.github/scripts/         update_writing.py, update_now.py — the fetchers (no dependencies)
assets/fonts/            self-hosted woff2 fonts (Cormorant Garamond, Spectral)
assets/vendor/           self-hosted GSAP + ScrollTrigger, and three.js (fetched only when the game starts)
assets/images/           photography — neo_profilepic.jpg is the hero portrait; work/ holds card thumbnails
assets/og-image.png      1200×630 social link-preview card
CNAME                    custom domain (neomalesa.com)
```

### Now page

The Exploring and Recently explored lists on `now.html` come from the GitHub profile README ([n30dyn4m1c/n30dyn4m1c](https://github.com/n30dyn4m1c/n30dyn4m1c)): its `<!--row:exploring-->` and `<!--row:explored-->` rows. `.github/scripts/update_now.py` rewrites the block between the `NOW-EXPLORING` markers (latest 10 explored items) and moves the "Updated" date only when the list changes. `update-now.yml` runs it weekly on Mondays, after the writing feed. Building and Writing on that page are still edited by hand. To refresh manually, run the workflow from the Actions tab, or:

```bash
python3 .github/scripts/update_now.py
```

### Writing feed

The home Writing section (newest three, set by `data-limit` on the list) and the Writing page (every post) both render from `writing-data.js`, a script-tag copy of the latest Medium posts (so it also works when `index.html` is opened from disk). Both files are generated by `.github/scripts/update_writing.py` from the Medium RSS feed; a scheduled GitHub Action refreshes them weekly (Mondays) and commits them. To refresh manually:

```bash
python3 .github/scripts/update_writing.py
```

**Adding a post by hand.** The Medium profile feed does not return every post, and the fetcher overwrites `writing.json` and `writing-data.js` on each run, so posts added straight to those files are lost at the next refresh. Add them to `writing-pinned.json` instead — it is merged in with the feed on every run, and the list is sorted newest first by date:

```json
[
  {
    "title": "Post title",
    "url": "https://medium.com/@neomalesa/slug-hash",
    "date": "Tue, 15 Sep 2026 08:00:00 GMT",
    "excerpt": "One or two sentences."
  }
]
```

`date` and `excerpt` may be left as `""`. A pinned post keeps its own wording and fills a blank `date` or `excerpt` from the feed if the feed later carries it; the duplicate feed entry is dropped. An entry with no date renders without one — the title and excerpt stay aligned.

### Editing the home page

- **Work cards** — each `<li class="card">` in `index.html` sits in a `.subsection` with a `data-kind` (`data`, `systems`, `tools`) that the filter buttons use. Card art is either an inline SVG motif or a 720×450 thumbnail in `assets/images/work/`.
- **Start Here** — the three `.paths__panel` articles hold the case made to each reader.
- **Game** — the six beacons, their names, and the line each one shows are the `BEACONS` list at the top of `js/game.js`.
- **Figures** — the four numbers under the conviction are `data-count` values; "years of published writing" is computed from `data-count-since`.

To change the hero portrait, replace `assets/images/neo_profilepic.jpg` (square works best) and update the `width`/`height` on `.hero__portrait-img` in `index.html`. Regenerate `assets/og-image.png` if the photo changes.

Canonical and Open Graph URLs in `index.html` point to `https://neomalesa.com/`.

## Stack

- **Fonts** — Cormorant Garamond (display), Spectral (body); self-hosted woff2
- **Animation** — GSAP 3 + ScrollTrigger (self-hosted)
- **3D** — three.js r170 (self-hosted, MIT; loaded on demand for the interlude only)
- **Writing feed** — Medium RSS → `writing.json` via scheduled GitHub Action
- **SEO** — Open Graph + Twitter cards, canonical URL, JSON-LD `Person` schema
- **View transitions** — cross-document fades via the View Transitions API
- No build tools, no `node_modules`

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Neo Malesa**  
Software Developer · UPNG · AbideTech · $N30 · n30dyn4m1c  
[neomalesa.com](https://neomalesa.com) · [GitHub](https://github.com/n30dyn4m1c)
