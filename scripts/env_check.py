"""Report `.env` drift vs `.env.example` as a table (keys, never secrets).

Read-only: prints a report, exits 0 (clean), 1 (drift/invalid), 2 (file
missing). Secrets are always masked (length only, including code defaults
like DATABASE_URL); URLs are redacted to scheme://host (no credentials).
Value rules intentionally mirror `app/core/settings.py` validators (kept in
sync by `app/tests/unit/test_env_check.py`); Settings stays the runtime
authority.

Usage: python scripts/env_check.py [--env-file .env] [--example .env.example]
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable
from pathlib import Path

Check = Callable[[str], str | None]


def parse_env(path: Path) -> tuple[dict[str, str], int]:
    """Parse `KEY=value` lines; return (mapping, skipped-line count)."""
    found: dict[str, str] = {}
    skipped = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            skipped += 1
            continue
        key, _, value = stripped.partition("=")
        key = key.strip()
        if not key or not key.replace("_", "").isalnum() or not key[0].isalpha():
            skipped += 1
            continue
        found[key] = value.strip().strip("\"'")
    return found, skipped


def _non_empty(value: str) -> str | None:
    return None if value.strip() else "empty value"


def _min_len(n: int) -> Check:
    def check(value: str) -> str | None:
        return None if len(value) >= n else f"too short (<{n} chars)"

    return check


def _one_of(*opts: str) -> Check:
    def check(value: str) -> str | None:
        return None if value.strip() in opts else f"expected one of {', '.join(opts)}"

    return check


def _bool_flag(value: str) -> str | None:
    """Pydantic-settings bool shapes (case-insensitive)."""
    return None if value.strip().lower() in ("true", "false", "1", "0", "yes", "no", "on", "off") else "expected a boolean"


def _int_in(lo: int, hi: int) -> Check:
    def check(value: str) -> str | None:
        try:
            number = int(value.strip())
        except ValueError:
            return "not an integer"
        return None if lo <= number <= hi else f"out of range {lo}..{hi}"

    return check


def _int_min(lo: int) -> Check:
    """Lower bound only — mirrors Settings validators without an upper cap."""

    def check(value: str) -> str | None:
        try:
            number = int(value.strip())
        except ValueError:
            return "not an integer"
        return None if number >= lo else f"out of range {lo}.."

    return check


def _one_of_ci(*opts: str) -> Check:
    """Case-insensitive `_one_of` — mirrors Settings validators using `.lower()`."""

    def check(value: str) -> str | None:
        return None if value.strip().lower() in [o.lower() for o in opts] else f"expected one of {', '.join(opts)}"

    return check


def _starts_with(*prefixes: str) -> Check:
    def check(value: str) -> str | None:
        return None if value.strip().startswith(prefixes) else f"must start with {prefixes[0]}"

    return check


DEV_DEFAULT_SECRET = "change-me-in-production-min-32-chars"  # noqa: S105 (dev default from settings; compared, never printed)

# Tooling defaults for app-slot ports (RULES.md §13). Not Settings fields:
# shown as code defaults so the table stays quiet, and used as the expected
# values in the pairing section.
TOOL_DEFAULTS: dict[str, str] = {
    "WEB_PORT": "3001",
    "API_PORT": "8001",
    "POSTGRES_PORT": "5401",
    "REDIS_PORT": "6401",
}


def _secret_key(value: str) -> str | None:
    if value == DEV_DEFAULT_SECRET:
        return "still the dev default"
    return _min_len(32)(value)


def _bootstrap_key(value: str) -> str | None:
    if not value.strip():
        return None
    return _min_len(32)(value)


# Key -> shape checks (names only in output; values never leave this process
# except into the checks themselves). Mirrors Settings validators.
# Port vars are tooling keys (not Settings fields): validated + cross-checked
# in the pairing section below (RULES.md §13 — the pair must stay linked).
RULES: dict[str, Check] = {
    "APP_VERSION": _non_empty,
    "WEB_PORT": _int_in(1, 65535),
    "API_PORT": _int_in(1, 65535),
    "POSTGRES_PORT": _int_in(1, 65535),
    "REDIS_PORT": _int_in(1, 65535),
    "SECRET_KEY": _secret_key,
    "JWT_ISSUER": _non_empty,
    "JWT_AUDIENCE": _non_empty,
    "ACCESS_TOKEN_TTL_MINUTES": _int_in(1, 1440),
    "REFRESH_TOKEN_TTL_DAYS": _int_in(1, 365),
    "DATABASE_URL": _starts_with("postgresql"),
    "DB_POOL_SIZE": _int_in(1, 100),
    "DB_MAX_OVERFLOW": _int_in(0, 100),
    "REDIS_URL": _starts_with("redis://"),
    "LOGIN_MAX_ATTEMPTS": _int_in(1, 10000),
    "LOGIN_WINDOW_SECONDS": _int_in(1, 3600),
    "REGISTER_MAX_ATTEMPTS": _int_in(1, 10000),
    "REGISTER_WINDOW_SECONDS": _int_in(1, 86400),
    "RATE_LIMIT_GLOBAL_MAX_ATTEMPTS": _int_in(1, 100000),
    "RATE_LIMIT_GLOBAL_WINDOW_SECONDS": _int_in(1, 86400),
    "TENANCY_MODE": _one_of("single", "row"),
    "TRUSTED_PROXY_HOPS": _int_min(0),
    "AUTH_COOKIE_ENABLED": _bool_flag,
    "AUTH_COOKIE_SECURE": _bool_flag,
    # NOTE: AUTH_COOKIE_DOMAIN is intentionally unvalidated (free-form; empty = host-only).
    "AUTH_COOKIE_SAMESITE": _one_of_ci("lax", "strict"),
    "CSRF_ENABLED": _bool_flag,
    "BOOTSTRAP_KEY": _bootstrap_key,
    "EMAIL_BACKEND": _one_of("log", "smtp"),
    "SMTP_PORT": _int_in(1, 65535),
    "SMTP_FROM": _non_empty,
    "STORAGE_BACKEND": _one_of("local", "s3"),
    "STORAGE_MAX_BYTES": _int_in(1, 10**12),
    "TASK_BROKER_URL": _starts_with("redis://"),
    "OUTBOX_MAX_ATTEMPTS": _int_in(1, 100),
    "PASSWORD_RESET_TTL_MINUTES": _int_in(5, 1440),
    "FRONTEND_URL": _starts_with("http://", "https://"),
    "ARGON2_TIME_COST": _int_in(1, 32),
    "ARGON2_MEMORY_COST": _int_in(1024, 10**7),
    "ARGON2_PARALLELISM": _int_in(1, 64),
}


def _url_port(value: str) -> int | None:
    """Port of a URL string; scheme default when absent; None when unparseable."""
    from urllib.parse import urlsplit

    try:
        parts = urlsplit(value.strip())
        if parts.port:
            return parts.port
    except ValueError:
        return None
    return {"http": 80, "https": 443, "redis": 6379, "postgresql": 5432, "postgres": 5432}.get(parts.scheme)


def _cors_origins(value: str) -> list[str]:
    """CORS_ORIGINS as a list (JSON array like Settings, or comma-separated)."""
    import json

    text = value.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [str(item).strip().strip("\"'") for item in parsed]
    except ValueError:
        pass
    return [item.strip().strip("\"'") for item in text.split(",") if item.strip().strip("\"'")]


def _pair_lines(env: dict[str, str]) -> tuple[list[str], bool]:
    """Port pairing (RULES.md §13): every URL/CORS origin must use the app's
    ports. Returns (lines, failed). Keys with unparseable ports are skipped
    here (their shape rule already fails)."""
    from urllib.parse import urlsplit

    lines = ["Port pairing (RULES.md §13):"]
    failed = False

    def want_int(key: str) -> int | None:
        try:
            return int(env[key].strip())
        except (KeyError, ValueError):
            return None

    web_port = want_int("WEB_PORT")
    api_port = want_int("API_PORT")
    pg_port = want_int("POSTGRES_PORT")
    redis_port = want_int("REDIS_PORT")

    def check_url(key: str, expected: int | None, what: str) -> None:
        nonlocal failed
        if key not in env or expected is None:
            return
        got = _url_port(env[key])
        if got is None:
            failed = True
            lines.append(f"  pair {key}: unparseable url — MISMATCH (fix or check manually)")
        elif got != expected:
            failed = True
            lines.append(f"  pair {key}:{got} != {what}:{expected} — MISMATCH")
        else:
            lines.append(f"  pair {key}:{got} == {what}:{expected} ok")

    check_url("DATABASE_URL", pg_port, "POSTGRES_PORT")
    check_url("REDIS_URL", redis_port, "REDIS_PORT")
    check_url("TASK_BROKER_URL", redis_port, "REDIS_PORT")
    check_url("FRONTEND_URL", web_port, "WEB_PORT")

    if "CORS_ORIGINS" in env and web_port is not None:
        checked_any = False
        cors_bad = False
        for origin in _cors_origins(env["CORS_ORIGINS"]):
            try:
                host = (urlsplit(origin).hostname or "").lower()
            except ValueError:
                failed = True
                cors_bad = True
                lines.append("  pair CORS_ORIGINS: unparseable origin — MISMATCH")
                continue
            if host in ("localhost", "127.0.0.1", "::1"):
                checked_any = True
                got = _url_port(origin)
                if got != web_port:
                    failed = True
                    cors_bad = True
                    lines.append(f"  pair CORS_ORIGINS local origin port {got} != WEB_PORT:{web_port} — MISMATCH")
        if checked_any and not cors_bad:
            lines.append("  pair CORS_ORIGINS local origins == WEB_PORT ok")

    client_env = Path("client/.env")
    if client_env.is_file():
        client, _ = parse_env(client_env)
        if "VITE_API_URL" in client and api_port is not None:
            got = _url_port(client["VITE_API_URL"])
            if got != api_port:
                failed = True
                lines.append(f"  pair client/.env VITE_API_URL port {got} != API_PORT:{api_port} — MISMATCH")
            else:
                lines.append(f"  pair client/.env VITE_API_URL:{got} == API_PORT:{api_port} ok")
    else:
        lines.append("  pair client/.env: skipped (absent)")
    return lines, failed


def check_env(env_path: Path, example_path: Path) -> tuple[int, str]:
    """Return (exit code, report). Exit: 0 clean, 1 drift/invalid, 2 missing file."""
    if not env_path.is_file():
        return 2, f"[missing] {env_path} not found — run 'make env-template'\n"
    if not example_path.is_file():
        return 2, f"[missing] {example_path} not found\n"
    env, _ = parse_env(env_path)
    example, _ = parse_env(example_path)
    defaults = _code_defaults()

    keys = sorted(set(example) | set(env))
    header = f"{'KEY':<26} {_col('DEFAULT (code)', 26)} {_col('.ENV', 32)} {_col('APPLIED', 34)} STATUS"
    lines = [f".env check ({env_path} vs {example_path})", header, "-" * len(header)]
    failed = False
    for key in keys:
        in_env = key in env
        in_example = key in example
        default = defaults.get(key)
        if not in_example:
            status = "extra (unknown key?)"
        elif not in_env:
            failed = True
            status = "missing"
        else:
            reason = RULES[key](env[key]) if key in RULES else None
            if reason is None:
                status = "ok"
            else:
                failed = True
                status = f"invalid: {reason}"
        applied = env[key] if in_env else default
        source = "env" if in_env else "code"
        lines.append(
            f"{key:<26} {_col(_show_default(key, default), 26)} "
            f"{_col(_show_env(key, env.get(key)), 32)} "
            f"{_col(f'{_show_env(key, applied)} [{source}]', 34)} {status}"
        )

    pair_lines, pair_failed = _pair_lines(env)
    lines.extend(pair_lines)
    failed = failed or pair_failed

    lines.append(f"Result: {'DRIFT' if failed else 'OK'}")
    return (1 if failed else 0), "\n".join(lines) + "\n"


def _col(text: str, width: int) -> str:
    """Fixed-width cell with graceful truncation."""
    text = str(text)
    if len(text) > width:
        return text[: max(0, width - 1)] + "…"
    return text.ljust(width)


# Suffixes marking a key whose value must never be printed (length only).
# Suffix (not substring) on purpose: *_TTL_MINUTES/*_TTL_DAYS must stay
# readable, while *_KEY/*_SECRET/*_PASSWORD/*_TOKEN stay masked.
_SECRET_SUFFIXES = ("_SECRET", "_PASSWORD", "_KEY", "_TOKEN")


def _is_secret_key(key: str) -> bool:
    return key.upper().endswith(_SECRET_SUFFIXES)


def _redact_url(value: str) -> str:
    """Keep scheme://host[:port][/db], drop userinfo/query/fragment."""
    from urllib.parse import urlsplit, urlunsplit

    try:
        parts = urlsplit(value.strip())
    except ValueError:
        return "(unparseable url)"
    if not parts.scheme:
        return "(not a url)"
    host = parts.hostname or ""
    if parts.port:
        host = f"{host}:{parts.port}"
    path = parts.path or ""
    return urlunsplit((parts.scheme, host, path, "", ""))


def _looks_like_url(value: str) -> bool:
    import re

    return re.match(r"^[A-Za-z][A-Za-z0-9+.\-]*://", value.strip()) is not None


def _show_env(key: str, value: str | None) -> str:
    """Render a value read from `.env` (or the applied one): masked by policy."""
    if value is None or value == "":
        return "—"
    if _is_secret_key(key):
        return f"set ({len(value)} chars)"
    if _looks_like_url(value):
        return _redact_url(value)
    return value


def _show_default(key: str, default: str | None) -> str:
    """Render a code default under the SAME masking policy (defaults can also
    carry dev credentials, e.g. DATABASE_URL)."""
    if default is None:
        return "—"
    return _show_env(key, default)


def _code_defaults() -> dict[str, str]:
    """Code defaults from `Settings` fields (KEY upper) + tooling port
    defaults. `{}` entries only when Settings is unimportable (tool defaults
    always apply)."""
    out: dict[str, str] = dict(TOOL_DEFAULTS)
    try:
        from app.core.settings import Settings
    except Exception:
        return out
    for name, field in Settings.model_fields.items():
        if field.is_required():
            continue
        default = field.default
        if default is None:
            rendered = "—"
        elif isinstance(default, bool):
            rendered = "true" if default else "false"
        else:
            rendered = str(default)
        out[name.upper()] = rendered
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Report .env drift vs .env.example as a table (secrets masked).")
    parser.add_argument("--env-file", default=".env")
    parser.add_argument("--example", default=".env.example")
    args = parser.parse_args(argv)
    code, report = check_env(Path(args.env_file), Path(args.example))
    sys.stdout.write(report)
    return code


if __name__ == "__main__":
    raise SystemExit(main())
