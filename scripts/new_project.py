"""Bootstrap a second project from this boilerplate.

Copies the tree minus VCS/venvs/caches/archives, renames the project, validates
the output. Not cookiecutter by design (no templating engine for v1).

Usage: python scripts/new_project.py --name my-saas --dest /path/to/my-saas
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
        text = re.sub(r"^# .*", f"# {name}", text, count=1, flags=re.MULTILINE)
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Bootstrap a project from fast-backend.")
    parser.add_argument("--name", required=True)
    parser.add_argument("--dest", required=True)
    parser.add_argument("--source", default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args(argv)
    try:
        dest = new_project(args.name, Path(args.dest), source=Path(args.source))
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
