#!/usr/bin/env python3
"""Fill the Exploring rows on now.html from the GitHub profile README.

The profile README (n30dyn4m1c/n30dyn4m1c) keeps a "currently exploring"
row and an "old exploring" row, marked <!--row:exploring--> and
<!--row:explored-->. This script reads both and rewrites the block between
the NOW-EXPLORING markers in now.html. The "Updated" date changes only when
the list does.

Runs in the GitHub Action (and locally) with no third-party dependencies.
"""

import html
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

README_URL = "https://raw.githubusercontent.com/n30dyn4m1c/n30dyn4m1c/main/README.md"
PAGE = "now.html"
MAX_EXPLORED = 10
PNG_TZ = timezone(timedelta(hours=10))  # Port Moresby, UTC+10

BLOCK_RE = re.compile(r"(<!-- NOW-EXPLORING:START[^>]*-->\n)(.*?)(\n[ \t]*<!-- NOW-EXPLORING:END -->)", re.S)
UPDATED_RE = re.compile(r"(<!-- NOW-UPDATED:START -->)(.*?)(<!-- NOW-UPDATED:END -->)", re.S)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "neomalesa-site-update"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def row_cell(readme, name):
    """Return the inner HTML of the second <td> in a marked README row."""
    m = re.search(r"<!--row:%s-->\s*<tr>(.*?)</tr>" % re.escape(name), readme, re.S)
    if not m:
        return None
    cells = re.findall(r"<td[^>]*>(.*?)</td>", m.group(1), re.S)
    return cells[1] if len(cells) > 1 else None


def text(fragment):
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    return " ".join(html.unescape(fragment).split())


def parse_items(cell):
    """Split a '·'-separated cell into (name, when) pairs."""
    items = []
    if not cell:
        return items
    for part in re.split(r"&middot;|·", cell):
        m = re.match(r"\s*(.*?)\s*<sub>(.*?)</sub>\s*$", part, re.S)
        name, when = (m.group(1), m.group(2)) if m else (part, "")
        name, when = text(name), text(when)
        if name:
            items.append((name, when))
    return items


def render_group(label, items, indent="          "):
    lines = [
        f'{indent}<li class="now__item">',
        f'{indent}  <p class="now__label">{label}</p>',
        f'{indent}  <ul class="now__sub-list" role="list">',
    ]
    for name, when in items:
        li = html.escape(name, quote=False)
        if when:
            li += f' <span class="now__when">{html.escape(when, quote=False)}</span>'
        lines.append(f"{indent}    <li>{li}</li>")
    lines += [f"{indent}  </ul>", f"{indent}</li>"]
    return "\n".join(lines)


def main():
    try:
        readme = fetch(README_URL)
    except Exception as exc:  # network failure: leave the page as it is
        print(f"could not fetch README: {exc}", file=sys.stderr)
        return 1

    exploring = parse_items(row_cell(readme, "exploring"))
    explored = parse_items(row_cell(readme, "explored"))[:MAX_EXPLORED]
    if not exploring and not explored:
        print("no exploring rows found in README — page left unchanged", file=sys.stderr)
        return 1

    groups = []
    if exploring:
        groups.append(render_group("Exploring", exploring))
    if explored:
        groups.append(render_group("Recently explored", explored))
    block = "\n".join(groups)

    with open(PAGE, encoding="utf-8") as fh:
        page = fh.read()
    if not BLOCK_RE.search(page):
        print("NOW-EXPLORING markers missing from now.html", file=sys.stderr)
        return 1

    new_page = BLOCK_RE.sub(lambda m: m.group(1) + block + m.group(3), page, count=1)
    if new_page == page:
        print("now.html unchanged")
        return 0

    today = datetime.now(PNG_TZ)
    stamp = f"Updated {today.day} {today:%B %Y}"
    new_page = UPDATED_RE.sub(lambda m: m.group(1) + stamp + m.group(3), new_page, count=1)
    with open(PAGE, "w", encoding="utf-8") as fh:
        fh.write(new_page)
    print(f"now.html updated: {len(exploring)} exploring, {len(explored)} explored")
    return 0


if __name__ == "__main__":
    sys.exit(main())
