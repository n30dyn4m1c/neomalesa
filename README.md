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
index.html        entry point — all sections on a single page
css/style.css     design tokens, all styles, both themes
js/main.js        theme toggle, wave animation, hero reveals, GSAP scroll animations
assets/           images (lazy-loaded when added)
CNAME             custom domain — leave empty until domain is ready
```

## Stack

- **Fonts** — Barlow Condensed (display), Space Grotesk (body) via Google Fonts
- **Animation** — GSAP 3 + ScrollTrigger (CDN, the only external dependency)
- No build tools, no `node_modules`
