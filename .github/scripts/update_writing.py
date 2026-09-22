#!/usr/bin/env python3
"""Fetch the latest posts from Neo Malesa's Medium feed into writing.json.

Posts listed in writing-pinned.json are merged in ahead of the feed, so
articles the Medium profile feed leaves out still appear in the Writing
section and survive the scheduled refresh.

Runs in the GitHub Action (and locally) with no third-party dependencies.
"""

import html
import json
import re
import sys
import urllib.request
from xml.etree import ElementTree as ET

FEED_URL = "https://medium.com/feed/@neomalesa"
PINNED_INPUT = "writing-pinned.json"
OUTPUT = "writing.json"
JS_OUTPUT = "writing-data.js"
MAX_POSTS = 5
EXCERPT_MAX = 220
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"


def strip_html(text):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return " ".join(text.split())


def load_pinned():
    """Read the hand-curated entries that are always listed first.

    Medium's profile feed does not return every post, so those are kept in
    writing-pinned.json and merged in on each run.
    """
    try:
        with open(PINNED_INPUT, encoding="utf-8") as fh:
            entries = json.load(fh)
    except FileNotFoundError:
        return []

    pinned = []
    for entry in entries:
        title = " ".join((entry.get("title") or "").split())
        link = (entry.get("url") or "").strip().split("?", 1)[0]
        if not title or not link:
            continue
        pinned.append(
            {
                "title": title,
                "url": link,
                "date": (entry.get("date") or "").strip(),
                "excerpt": (entry.get("excerpt") or "").strip(),
            }
        )
    return pinned


def main():
    req = urllib.request.Request(
        FEED_URL,
        headers={"User-Agent": "neomalesa.com/1.0 (+https://neomalesa.com)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        root = ET.fromstring(resp.read())

    posts = []
    for item in root.iter("item"):
        title = " ".join((item.findtext("title") or "").split())
        link = (item.findtext("link") or "").strip()
        if not title or not link:
            continue
        # Drop Medium's RSS tracking params (e.g. ?source=rss-...)
        link = link.split("?", 1)[0]
        content = item.findtext(CONTENT_NS + "encoded")
        excerpt = strip_html(content) if content else ""
        if len(excerpt) > EXCERPT_MAX:
            cut = excerpt[:EXCERPT_MAX]
            excerpt = cut.rsplit(" ", 1)[0].rstrip() + "\u2026"
        posts.append(
            {
                "title": title,
                "url": link,
                "date": (item.findtext("pubDate") or "").strip(),
                "excerpt": excerpt,
            }
        )
        if len(posts) >= MAX_POSTS:
            break

    if not posts:
        print("No posts found in feed; leaving writing files untouched.", file=sys.stderr)
        return 1

    pinned = load_pinned()
    by_url = {entry["url"]: entry for entry in pinned}

    # A pinned post that also reaches the feed keeps its curated wording and
    # picks up the date or excerpt from the feed wherever it was left blank.
    for post in posts:
        curated = by_url.get(post["url"])
        if curated is None:
            continue
        for field in ("date", "excerpt"):
            if not curated[field]:
                curated[field] = post[field]

    posts = pinned + [post for post in posts if post["url"] not in by_url]

    payload = json.dumps(posts, ensure_ascii=False, indent=2)

    with open(OUTPUT, "w", encoding="utf-8") as fh:
        fh.write(payload + "\n")

    # Script-tag copy so the page can read the posts without fetch(),
    # which works when index.html is opened directly from disk.
    with open(JS_OUTPUT, "w", encoding="utf-8") as fh:
        fh.write("window.NEO_WRITING = " + payload + ";\n")

    print(
        f"Wrote {len(posts)} posts ({len(pinned)} pinned) "
        f"to {OUTPUT} and {JS_OUTPUT}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
