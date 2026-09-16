"""Automate releases on merged PRs: finalize `[Unreleased]` into a version.

Flow (see `.github/workflows/auto-release.yml`): every PR merged to `main`
bumps patch, consolidates `[Unreleased]` sections into `## [vX.Y.Z] — date`,
syncs version files, commits, tags and pushes (`--follow-tags`, one command).
The existing `release.yml` (on tag) then creates the GitHub Release — no loop,
because pushes never open PRs.

Pure functions below are unit-tested without git/network
(`app/tests/unit/test_auto_release.py`); only `main()` touches git.

Usage:
  python scripts/auto_release.py --pr-title "..." [--bump patch|minor|major] [--dry-run] [--date YYYY-MM-DD]
"""

from __future__ import annotations

import argparse
import datetime
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

_VERSION_RE = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")
_UNRELEASED_RE = re.compile(r"^## \[Unreleased\].*$", re.MULTILINE)
_SECTION_RE = re.compile(r"^## \[.+\].*$", re.MULTILINE)


def parse_version(tag: str) -> tuple[int, int, int] | None:
    """Parse `v1.2.3` or `1.2.3`; None for anything else."""
    match = _VERSION_RE.match(tag.strip())
    if not match:
        return None
    return (int(match.group(1)), int(match.group(2)), int(match.group(3)))


def next_version(tags: list[str], bump: str = "patch") -> str:
    """Next `X.Y.Z` (no `v` prefix) from the highest semver tag; base `0.1.0`."""
    base = max((v for t in tags if (v := parse_version(t)) is not None), default=(0, 1, 0))
    major, minor, patch = base
    if bump == "major":
        return f"{major + 1}.0.0"
    if bump == "minor":
        return f"{major}.{minor + 1}.0"
    if bump != "patch":
        raise ValueError(f"unknown bump: {bump!r}")
    return f"{major}.{minor}.{patch + 1}"


def finalize_changelog(text: str, version: str, date: str, fallback_title: str) -> str:
    """Consolidate every `[Unreleased]` body into `## [v{version}] — {date}`.

    Leaves a single empty `[Unreleased]` stub where the first one was. When no
    Unreleased body exists, the entry falls back to the PR title so the release
    never ships empty. Historical sections are never rewritten.
    """
    bodies: list[str] = []
    spans: list[tuple[int, int]] = []
    for match in _UNRELEASED_RE.finditer(text):
        start = match.end()
        nxt = _SECTION_RE.search(text, start)
        end = nxt.start() if nxt else len(text)
        spans.append((match.start(), end))
        body = text[start:end].strip("\n").strip()
        if body:
            bodies.append(body)
    if not bodies:
        bodies = [f"- {fallback_title.strip() or 'Maintenance release.'}"]
    section = f"## [v{version}] — {date}\n\n" + "\n\n".join(bodies) + "\n"
    stub = "## [Unreleased]\n"
    if not spans:
        anchor = _SECTION_RE.search(text)
        at = anchor.start() if anchor else len(text)
        return text[:at].rstrip("\n") + "\n\n" + section + "\n" + stub + "\n" + text[at:].lstrip("\n")
    out = text[: spans[0][0]].rstrip("\n") + "\n\n" + section + "\n" + stub
    tail = text[spans[-1][1] :].lstrip("\n")
    return out + ("\n" + tail if tail else "\n")


def _replace_first(path: Path, pattern: str, replacement: str) -> None:
    text = path.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise ValueError(f"pattern not found once in {path}: {pattern}")
    path.write_text(updated, encoding="utf-8")


def sync_files(root: Path, version: str) -> list[str]:
    """Sync `X.Y.Z` (no `v`) into pyproject/settings/.env.example. Returns touched files."""
    touched = []
    pyproject = root / "pyproject.toml"
    _replace_first(pyproject, r'^version = "[^"]+"$', f'version = "{version}"')
    touched.append(str(pyproject))
    settings = root / "app" / "core" / "settings.py"
    _replace_first(settings, r'^    app_version: str = "[^"]+"$', f'    app_version: str = "{version}"')
    touched.append(str(settings))
    example = root / ".env.example"
    _replace_first(example, r"^APP_VERSION=.*$", f"APP_VERSION={version}")
    touched.append(str(example))
    return touched


def _git(*args: str) -> str:
    git = shutil.which("git")
    if not git:
        raise RuntimeError("required binary not found: git")
    result = subprocess.run([git, *args], capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Finalize Unreleased into a versioned release.")
    parser.add_argument("--pr-title", default="", help="Fallback entry when Unreleased is empty")
    parser.add_argument("--bump", default="patch", choices=["patch", "minor", "major"])
    parser.add_argument("--date", default="")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--root", default=str(REPO_ROOT))
    args = parser.parse_args(argv)

    root = Path(args.root)
    date = args.date or datetime.date.today().isoformat()
    tags = _git("tag", "--list").split()
    version = next_version(tags, args.bump)
    changelog = root / "CHANGELOG.md"
    new_text = finalize_changelog(changelog.read_text(encoding="utf-8"), version, date, args.pr_title)
    if args.dry_run:
        sys.stdout.write(f"would release v{version} on {date}\n")
        return 0
    changelog.write_text(new_text, encoding="utf-8")
    touched = sync_files(root, version)
    _git("add", "CHANGELOG.md", *[str(Path(t).relative_to(root)) for t in touched])
    _git("commit", "-m", f"chore(release): v{version}")
    _git("tag", "-a", f"v{version}", "-m", f"v{version}")
    sys.stdout.write(f"released v{version} (commit + tag, push with --follow-tags)\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
