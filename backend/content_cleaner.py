"""Clean raw extracted web content for display.

Tavily's Extract returns faithful page markdown, which for press releases and
news pages carries a lot of noise that reads poorly in the UI: tracking-redirect
links, image markdown (tracking pixels, social icons, logos), and trailing
boilerplate (newsletter sign-ups, "Follow Us" social bars, cookie notices).

`clean_extracted_content` strips these common patterns so the modal shows the
article body, not the scaffolding.
"""

import re

# Trailing sections that mark the start of page boilerplate. Once we hit one of
# these headings, everything after it is dropped.
_BOILERPLATE_HEADING = re.compile(
    r"^\s*(?:#{1,6}\s*|\*{1,2})?\s*(?:"
    r"follow us|newsroom alerts?|email alert sign[\s-]?up(?:\s+confirmation)?|"
    r"share this|connect with us|related (?:news|articles|stories|links)|"
    r"more (?:from|stories)|sign up for|subscribe|cookie (?:policy|settings|preferences)|"
    r"multimedia files?|about cookies"
    r")\b.*$",
    re.IGNORECASE,
)

# A markdown table separator or empty-cell row, e.g. "| --- |" or "|  |".
_TABLE_SCAFFOLD = re.compile(r"^\s*\|[\s|:\-]*\|\s*$")

# Markdown image: ![alt](url)
_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")

# Markdown link: [text](url) — keep the anchor text, drop the (usually tracking) URL.
_LINK = re.compile(r"\[([^\]]+)\]\((?:[^)]*)\)")

# 3+ consecutive newlines.
_EXTRA_BLANK_LINES = re.compile(r"\n{3,}")


def clean_extracted_content(text: str) -> str:
    """Strip common scraping noise from extracted markdown for clean display."""
    if not text:
        return text

    # Drop images (tracking pixels, social icons, logos, thumbnails).
    text = _IMAGE.sub("", text)

    # Unwrap links to their anchor text; the raw URLs are usually tracking
    # redirects and the canonical source URL is shown separately in the UI.
    text = _LINK.sub(r"\1", text)

    # Truncate at the first trailing-boilerplate heading and drop table scaffold.
    kept: list[str] = []
    for line in text.split("\n"):
        if _BOILERPLATE_HEADING.match(line):
            break
        if _TABLE_SCAFFOLD.match(line):
            continue
        kept.append(line.rstrip())
    text = "\n".join(kept)

    # Collapse runs of blank lines and trim.
    text = _EXTRA_BLANK_LINES.sub("\n\n", text)
    return text.strip()
