#!/usr/bin/env python3
"""Fetch the latest posts from Neo Malesa's Medium feed into writing.json.

Runs in the GitHub Action (and locally) with no third-party dependencies.
"""

import html
import json
import re
import sys
import urllib.request
from xml.etree import ElementTree as ET

FEED_URL = "https://medium.com/feed/@neomalesa"
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

    payload = json.dumps(posts, ensure_ascii=False, indent=2)

    with open(OUTPUT, "w", encoding="utf-8") as fh:
        fh.write(payload + "\n")

    # Script-tag copy so the page can read the posts without fetch(),
    # which works when index.html is opened directly from disk.
    with open(JS_OUTPUT, "w", encoding="utf-8") as fh:
        fh.write("window.NEO_WRITING = " + payload + ";\n")

    print(f"Wrote {len(posts)} posts to {OUTPUT} and {JS_OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
