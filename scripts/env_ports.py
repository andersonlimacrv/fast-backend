"""Print this app's port assignments for the Makefile (`--make`) or humans.

Sources (first wins): process env > `--env-file` (.env) > `--example`
(.env.example) > baked slot-1 defaults. Keys already present in the process
environment are skipped in `--make` output so CLI/env overrides keep
precedence under Make `?=` defaults.

Usage:
    python scripts/env_ports.py [--env-file .env] [--example .env.example]
    python scripts/env_ports.py --make   # KEY=VALUE lines for $(eval)
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.env_check import parse_env  # noqa: E402

PORTS: tuple[tuple[str, int], ...] = (
    ("WEB_PORT", 3001),
    ("API_PORT", 8001),
    ("POSTGRES_PORT", 5401),
    ("REDIS_PORT", 6401),
)


def _read_int(mapping: dict[str, str], key: str) -> int | None:
    raw = mapping.get(key, "").strip()
    if not raw:
        return None
    try:
        number = int(raw)
    except ValueError:
        return None
    return number if 1 <= number <= 65535 else None


def resolve(env_path: Path, example_path: Path) -> dict[str, int]:
    """Resolve each port; raise SystemExit(2) on an invalid explicit value."""
    env: dict[str, str] = {}
    if env_path.is_file():
        env, _ = parse_env(env_path)
    example: dict[str, str] = {}
    if example_path.is_file():
        example, _ = parse_env(example_path)
    resolved: dict[str, int] = {}
    for key, default in PORTS:
        for mapping in (env, example):
            if key in mapping:
                number = _read_int(mapping, key)
                if number is None:
                    raise SystemExit(f"env_ports: {key} must be an integer 1..65535")
                resolved[key] = number
                break
        else:
            resolved[key] = default
    return resolved


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Print app port assignments.")
    parser.add_argument("--env-file", default=".env")
    parser.add_argument("--example", default=".env.example")
    parser.add_argument("--make", action="store_true", help="print KEY=VALUE lines for Make $(eval)")
    args = parser.parse_args(argv)
    try:
        resolved = resolve(Path(args.env_file), Path(args.example))
    except SystemExit as exc:
        sys.stderr.write(f"{exc}\n")
        return 2
    if args.make:
        for key, _ in PORTS:
            if key in os.environ:
                continue  # CLI/env override wins; Make ?= keeps it
            sys.stdout.write(f"{key}={resolved[key]}\n")
    else:
        for key, _ in PORTS:
            sys.stdout.write(f"{key}={resolved[key]}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
