"""Extract release notes for a version from CHANGELOG.md.

The CHANGELOG is the source of truth (git-workflow-and-versioning skill):
a tag without a matching `## [version]` section fails loudly instead of
publishing an empty release.

Usage: python scripts/release_notes.py --version v1.1.0 [--changelog CHANGELOG.md]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def extract_notes(changelog: Path, version: str) -> str:
    """Return the markdown body of the `## [version]` section (without header)."""
    text = changelog.read_text(encoding="utf-8")
    header = re.compile(rf"^## \[{re.escape(version)}\].*$", re.MULTILINE)
    match = header.search(text)
    if not match:
        raise ValueError(f"no CHANGELOG section for [{version}] in {changelog}")
    rest = text[match.end() :]
    nxt = re.search(r"^## \[.+\].*$", rest, re.MULTILINE)
    body = rest[: nxt.start()] if nxt else rest
    body = body.strip("\n")
    if not body.strip():
        raise ValueError(f"empty CHANGELOG section for [{version}]")
    return body + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Extract CHANGELOG release notes.")
    parser.add_argument("--version", required=True, help="e.g. v1.1.0")
    parser.add_argument("--changelog", default="CHANGELOG.md")
    args = parser.parse_args(argv)
    try:
        sys.stdout.write(extract_notes(Path(args.changelog), args.version))
    except (ValueError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
