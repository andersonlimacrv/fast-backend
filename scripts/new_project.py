"""Bootstrap a second project from this boilerplate.

Copies the tree minus VCS/venvs/caches/archives, renames the project, validates
the output. Not cookiecutter by design (no templating engine for v1).

Usage: python scripts/new_project.py --name my-saas --dest /path/to/my-saas [--slot 2]

`--slot N` rewrites the app-slot ports in the scaffolded `.env.example`
files (docs/RULES.md §13): front 3000+N, back 8000+N, Postgres 5400+N,
Redis 6400+N. Default keeps the template ports (slot 1).
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from pathlib import Path

EXCLUDE_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    "node_modules",
    "var",
}
EXCLUDE_FILES = {".env"}
EXCLUDE_PREFIXES = ("openspec/changes/",)


def new_project(name: str, dest: Path, *, source: Path) -> Path:
    if not re.fullmatch(r"[a-z][a-z0-9-]*", name):
        raise ValueError(f"invalid project name: {name!r} (use lowercase-kebab)")
    if dest.exists() and any(dest.iterdir()):
        raise ValueError(f"destination not empty: {dest}")
    for root, dirs, files in os.walk(source):
        rel = Path(root).relative_to(source).as_posix()
        if any(rel == prefix.rstrip("/") or rel.startswith(prefix) for prefix in EXCLUDE_PREFIXES):
            dirs[:] = []
            continue
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDE_DIRS)
        for filename in files:
            if filename in EXCLUDE_FILES:
                continue
            if filename == ".git":
                # Worktree checkouts carry `.git` as a *file* (gitdir pointer),
                # which os.walk lists under files — EXCLUDE_DIRS never sees it.
                continue
            src = Path(root) / filename
            if ".venv" in src.parts or "__pycache__" in src.parts:
                continue
            target = dest / rel / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, target)
    _rename(dest, name)
    return dest


def _rename(dest: Path, name: str) -> None:
    pyproject = dest / "pyproject.toml"
    text = pyproject.read_text()
    text = re.sub(r'^name = ".*"', f'name = "{name}"', text, count=1, flags=re.MULTILINE)
    pyproject.write_text(text)
    readme = dest / "README.md"
    if readme.exists():
        text = readme.read_text()
        # Brand header is a banner + tagline H1 (no bare "# name" heading):
        # the fork carries the new name in the banner alt; the H1 tagline
        # stays untouched (must NOT be replaced by the project name).
        text = text.replace('alt="FastBACKEND', f'alt="{name}', 1)
        readme.write_text(text)


def validate(dest: Path) -> list[str]:
    """Return a list of problems (empty = ok)."""
    problems = []
    for required in ("app/__init__.py", "pyproject.toml", "alembic.ini", "Dockerfile"):
        if not (dest / required).exists():
            problems.append(f"missing {required}")
    for banned in (".git", ".venv", "__pycache__", ".pytest_cache", "openspec/changes"):
        if (dest / banned).exists():
            problems.append(f"should not exist: {banned}")
    return problems


def apply_slot(dest: Path, slot: int) -> None:
    """Rewrite app-slot ports in the scaffolded `.env.example` files."""
    if not 1 <= slot <= 99:
        raise ValueError(f"invalid slot: {slot} (use 1..99)")
    web, api, pg, redis = 3000 + slot, 8000 + slot, 5400 + slot, 6400 + slot
    root = dest / ".env.example"
    text = root.read_text(encoding="utf-8")
    for key, port in (("WEB_PORT", web), ("API_PORT", api), ("POSTGRES_PORT", pg), ("REDIS_PORT", redis)):
        text = re.sub(rf"^{key}=\d+$", f"{key}={port}", text, flags=re.MULTILINE)
    text = text.replace("localhost:5401", f"localhost:{pg}")
    text = text.replace("localhost:6401", f"localhost:{redis}")
    text = text.replace("localhost:3001", f"localhost:{web}")
    text = text.replace("127.0.0.1:3001", f"127.0.0.1:{web}")
    root.write_text(text, encoding="utf-8")
    client = dest / "client" / ".env.example"
    if client.is_file():
        ctext = client.read_text(encoding="utf-8")
        ctext = ctext.replace("localhost:8001", f"localhost:{api}")
        client.write_text(ctext, encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Bootstrap a project from fast-backend.")
    parser.add_argument("--name", required=True)
    parser.add_argument("--dest", required=True)
    parser.add_argument("--source", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--slot", type=int, default=None, help="app-slot ports (RULES.md §13); default keeps slot 1")
    args = parser.parse_args(argv)
    try:
        dest = new_project(args.name, Path(args.dest), source=Path(args.source))
        if args.slot is not None:
            apply_slot(dest, args.slot)
        problems = validate(dest)
        if problems:
            print("scaffolded with problems:", file=sys.stderr)
            for problem in problems:
                print(f"  - {problem}", file=sys.stderr)
            return 1
        print(f"scaffolded {args.name} at {dest}")
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
