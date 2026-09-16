"""Automate releases on merged PRs: finalize `[Unreleased]` into a version.

Flow (see `.github/workflows/auto-release.yml`): every PR merged to `main`
infers the bump from the PR title (`feat` → minor, `fix` → patch,
`BREAKING CHANGE`/`!` → major; anything else → patch), consolidates
`[Unreleased]` sections into `## [vX.Y.Z] — date`, syncs version files,
commits, tags and pushes (`--follow-tags`, one command).
The existing `release.yml` (on tag) then creates the GitHub Release — no loop,
because pushes never open PRs. An explicit `--bump` (manual dispatch) always
wins over inference.

Pure functions below are unit-tested without git/network
(`app/tests/unit/test_auto_release.py`); only `main()` touches git.

Usage:
  python scripts/auto_release.py --pr-title "..." [--bump auto|patch|minor|major] [--dry-run] [--date YYYY-MM-DD]
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
_CONVENTIONAL_RE = re.compile(r"^\s*([A-Za-z]+)(?:\([^)]*\))?(!)?:")
_PATCH_TYPES = frozenset({"fix", "perf", "refactor", "docs", "test", "chore", "ci", "build", "style", "revert"})


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


def infer_bump(pr_title: str, pr_body: str = "") -> str:
    """Infer `major|minor|patch` from a Conventional Commits PR title.

    `BREAKING CHANGE` (title or body) or a `!` marker → major; `feat` → minor;
    known fix-class types → patch; anything else (unknown type, no prefix,
    empty) → patch (conservative default: never bump up by accident).
    """
    text = f"{pr_title}\n{pr_body}"
    if "BREAKING CHANGE" in text.upper():
        return "major"
    match = _CONVENTIONAL_RE.match(pr_title or "")
    if not match:
        return "patch"
    kind, bang = match.group(1).lower(), match.group(2)
    if bang:
        return "major"
    if kind == "feat":
        return "minor"
    if kind in _PATCH_TYPES:
        return "patch"
    return "patch"


def resolve_bump(bump_arg: str, pr_title: str, pr_body: str = "") -> str:
    """Resolve the effective bump: explicit `patch|minor|major` always wins;
    `auto` (or anything unknown, defensively) falls back to inference."""
    if bump_arg in ("patch", "minor", "major"):
        return bump_arg
    return infer_bump(pr_title, pr_body)


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


# Paths that never require a changelog entry (docs, metadata, vendored text).
EXEMPT_PREFIXES = ("docs/", "openspec/", ".opencode/", ".lgpd/")
EXEMPT_SUFFIXES = (".md", ".MD")
EXEMPT_FILES = {"LICENSE", ".gitignore", ".gitattributes", ".env.example"}


def files_need_release(files: list[str]) -> bool:
    """True when any changed file affects behavior (i.e. is not docs-only)."""
    for path in files:
        name = path.strip().replace("\\", "/")
        if not name or name in EXEMPT_FILES:
            continue
        if name.startswith(EXEMPT_PREFIXES) or name.endswith(EXEMPT_SUFFIXES):
            continue
        return True
    return False


def has_unreleased_addition(changelog_diff: str) -> bool:
    """True when the diff adds a non-blank, non-header line under `[Unreleased]`."""
    in_unreleased = False
    for raw in changelog_diff.splitlines():
        if raw.startswith(("+++ ", "--- ")):
            continue
        if raw.startswith("@@"):
            in_unreleased = False
            continue
        if not raw or raw[0] not in " +-":
            in_unreleased = False
            continue
        content = raw[1:]
        if content.startswith("## [Unreleased]"):
            in_unreleased = True
            continue
        if content.startswith("## ["):
            in_unreleased = False
            continue
        if in_unreleased and raw[0] == "+" and content.strip():
            return True
    return False


def unreleased_bodies(text: str) -> list[str]:
    """Bodies of every `[Unreleased]` section (shared with finalize_changelog)."""
    bodies: list[str] = []
    for match in _UNRELEASED_RE.finditer(text):
        start = match.end()
        nxt = _SECTION_RE.search(text, start)
        end = nxt.start() if nxt else len(text)
        body = text[start:end].strip("\n").strip()
        if body:
            bodies.append(body)
    return bodies


def check_pr(changed_files: list[str], changelog_diff: str) -> str | None:
    """Return a failure reason, or None when the PR satisfies the release rule."""
    if not files_need_release(changed_files):
        return None
    if has_unreleased_addition(changelog_diff):
        return None
    return "behavior change without a [Unreleased] CHANGELOG entry (add one, or keep the PR docs-only)"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Finalize Unreleased into a versioned release.")
    parser.add_argument("--pr-title", default="", help="Fallback entry when Unreleased is empty")
    parser.add_argument(
        "--bump",
        default="auto",
        choices=["auto", "patch", "minor", "major"],
        help="explicit bump wins; 'auto' infers from --pr-title",
    )
    parser.add_argument("--date", default="")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--root", default=str(REPO_ROOT))
    parser.add_argument("--check", action="store_true", help="read-only PR gate (with --files/--diff-file)")
    parser.add_argument("--files", default="", help="newline-separated changed paths for --check")
    parser.add_argument("--diff-file", default="", help="unified diff of CHANGELOG.md for --check ('-' reads stdin)")
    parser.add_argument(
        "--if-needed",
        action="store_true",
        help="exit 0 doing nothing when the merge carries nothing releasable",
    )
    args = parser.parse_args(argv)

    if args.check:
        if args.diff_file == "-":
            diff_text = sys.stdin.read()
        elif args.diff_file:
            diff_text = Path(args.diff_file).read_text(encoding="utf-8")
        else:
            diff_text = ""
        reason = check_pr([f for f in args.files.splitlines() if f.strip()], diff_text)
        if reason is not None:
            sys.stdout.write(f"release check failed: {reason}\n")
            return 1
        sys.stdout.write("release check: OK\n")
        return 0

    root = Path(args.root)
    date = args.date or datetime.date.today().isoformat()
    changelog = root / "CHANGELOG.md"
    text = changelog.read_text(encoding="utf-8")
    if args.if_needed and not unreleased_bodies(text):
        changed = {f.replace("\\", "/").split("/")[-1] for f in _git("diff", "HEAD~1", "--name-only").split()}
        if "CHANGELOG.md" not in changed:
            sys.stdout.write("nothing to release\n")
            return 0
    tags = _git("tag", "--list").split()
    version = next_version(tags, resolve_bump(args.bump, args.pr_title))
    new_text = finalize_changelog(text, version, date, args.pr_title)
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
