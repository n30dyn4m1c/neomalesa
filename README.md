# Neo Malesa — Personal Site

Single-page portfolio. Vanilla HTML, CSS, and JavaScript. No framework, no build step.

## Run locally

```bash
# Open directly in a browser
open index.html

# Or serve over HTTP to avoid browser security restrictions on local files
python -m http.server 8000
# → http://localhost:8000
```

## Deploy on GitHub Pages

### Root site (user/org page)
1. Create a repository named `n30dyn4m1c.github.io`.
2. Push these files to the `main` branch.
3. GitHub Pages is automatically enabled — no extra settings required.

### Any other repository
1. Go to **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**, branch `main`, folder `/` (root).
3. Save. The site will be live at `https://n30dyn4m1c.github.io/<repo-name>/`.

### Custom domain

Once the domain is purchased:

1. Add the domain to the `CNAME` file — one line, no `https://`, e.g.:
   ```
   neomalesa.com
   ```
2. At your DNS provider, create these records:

   | Type  | Name | Value               |
   |-------|------|---------------------|
   | A     | @    | 185.199.108.153     |
   | A     | @    | 185.199.109.153     |
   | A     | @    | 185.199.110.153     |
   | A     | @    | 185.199.111.153     |
   | CNAME | www  | n30dyn4m1c.github.io. |

3. In the GitHub repository go to **Settings → Pages → Custom domain**, enter the domain, and click **Save**.
4. After DNS propagates (up to 24 h), tick **Enforce HTTPS**.

## Structure

```
index.html               entry point — all sections on a single page
404.html                 branded not-found page (served by GitHub Pages)
css/style.css            design tokens and all styles (single light scheme)
js/main.js               horizon canvas, hero reveals, GSAP scroll animations, footer year
assets/images/           photography — neo_profilepic.jpg is the hero portrait
assets/og-image.png      1200×630 social link-preview card
CNAME                    custom domain — leave empty until domain is ready
```

To change the hero portrait, replace `assets/images/neo_profilepic.jpg` (a
square image works best) and update the `width`/`height` on the `.hero__portrait-img`
in `index.html`. Regenerate `assets/og-image.png` if the photo changes.

The canonical URL and the Open Graph / Twitter image URLs in `index.html` point to
`https://neomalesa.com/`. Update them if the site is hosted elsewhere.

## Stack

- **Fonts** — Cormorant Garamond (display), Spectral (body) via Google Fonts
- **Animation** — GSAP 3 + ScrollTrigger (CDN, the only external dependency)
- **SEO** — Open Graph + Twitter cards, canonical URL, JSON-LD `Person` schema
- No build tools, no `node_modules`
