"""Postgres backup: pg_dump(plain SQL) → gzip → openssl enc → destination + retention prune.

Plain SQL (not custom format) restores through `psql`, avoiding pg_dump/pg_restore
client/server version skew.

Usage:
    BACKUP_PASSPHRASE=... python scripts/backup.py --database-url ... --dest ./var/backups [--retention 7]
    python scripts/backup.py --restore <artifact> --database-url ...   (needs BACKUP_PASSPHRASE)

Refuses to run without a passphrase. Never logs secrets.
"""

from __future__ import annotations

import argparse
import gzip
import os
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlparse


def _require_bin(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"required binary not found: {name}")
    return path


def _pg_env(database_url: str) -> tuple[dict[str, str], dict[str, str | int | None]]:
    """Split URL into libpq env + connection params for pg_dump/pg_restore."""
    parsed = urlparse(database_url)
    if parsed.scheme not in ("postgresql", "postgres", "postgresql+asyncpg", "postgresql+psycopg2"):
        raise ValueError(f"unsupported scheme: {parsed.scheme}")
    env = dict(os.environ)
    if parsed.password:
        env["PGPASSWORD"] = parsed.password
    params: dict[str, str | int | None] = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "user": parsed.username or "postgres",
        "dbname": parsed.path.lstrip("/") or "postgres",
    }
    return env, params


def artifact_name(prefix: str = "fastbackend", now: datetime | None = None) -> str:
    stamp = (now or datetime.now(UTC)).strftime("%Y%m%dT%H%M%SZ")
    return f"{prefix}-{stamp}.dump.gz.enc"


def prune(dest: Path, *, prefix: str = "fastbackend", retention: int = 7) -> list[Path]:
    """Delete oldest artifacts beyond retention. Returns deleted paths."""
    artifacts = sorted(dest.glob(f"{prefix}-*.dump.gz.enc"))
    doomed = artifacts[: max(0, len(artifacts) - retention)]
    for path in doomed:
        path.unlink()
    return doomed


def backup_postgres(database_url: str, dest: Path, passphrase: str, *, retention: int = 7, prefix: str = "fastbackend") -> Path:
    if not passphrase:
        raise ValueError("refusing backup without BACKUP_PASSPHRASE")
    pg_dump = _require_bin("pg_dump")
    openssl = _require_bin("openssl")
    dest.mkdir(parents=True, exist_ok=True)
    env, params = _pg_env(database_url)
    dump = subprocess.run(
        [
            pg_dump,
            "-h",
            str(params["host"]),
            "-p",
            str(params["port"]),
            "-U",
            str(params["user"]),
            "-d",
            str(params["dbname"]),
        ],
        env=env,
        check=True,
        capture_output=True,
    )
    if dump.returncode != 0:
        raise RuntimeError("pg_dump failed")
    compressed = gzip.compress(dump.stdout, compresslevel=6)
    enc = subprocess.run(
        [openssl, "enc", "-aes-256-cbc", "-pbkdf2", "-pass", "env:BACKUP_PASSPHRASE"],
        input=compressed,
        env={**env, "BACKUP_PASSPHRASE": passphrase},
        check=True,
        capture_output=True,
    )
    artifact = dest / artifact_name(prefix)
    artifact.write_bytes(enc.stdout)
    prune(dest, prefix=prefix, retention=retention)
    return artifact


def restore_postgres(database_url: str, artifact: Path, passphrase: str) -> None:
    if not passphrase:
        raise ValueError("refusing restore without BACKUP_PASSPHRASE")
    psql = _require_bin("psql")
    openssl = _require_bin("openssl")
    env, params = _pg_env(database_url)
    data = artifact.read_bytes()
    dec = subprocess.run(
        [openssl, "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-pass", "env:BACKUP_PASSPHRASE"],
        input=data,
        env={**env, "BACKUP_PASSPHRASE": passphrase},
        check=True,
        capture_output=True,
    )
    plain = gzip.decompress(dec.stdout)
    # pg_dump ≥17 emits `SET transaction_timeout` for its own session; servers
    # older than v17 reject it. It only governed the dump session, so dropping
    # the line is safe (documented version-skew shim).
    sql = "\n".join(line for line in plain.decode().splitlines() if "transaction_timeout" not in line).encode()
    proc = subprocess.run(
        [
            psql,
            "-h",
            str(params["host"]),
            "-p",
            str(params["port"]),
            "-U",
            str(params["user"]),
            "-d",
            str(params["dbname"]),
            "-v",
            "ON_ERROR_STOP=1",
            "-q",
            "-f",
            "-",
        ],
        input=sql,
        env=env,
        capture_output=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"psql restore failed: {proc.stderr.decode()[-2000:]}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Encrypted Postgres backup/restore.")
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL", ""))
    parser.add_argument("--dest", default="./var/backups")
    parser.add_argument("--retention", type=int, default=7)
    parser.add_argument("--restore", default="", help="Artifact path to restore (instead of backup)")
    args = parser.parse_args(argv)
    passphrase = os.environ.get("BACKUP_PASSPHRASE", "")
    try:
        if args.restore:
            restore_postgres(args.database_url, Path(args.restore), passphrase)
            print(f"restored {args.restore}")
        else:
            artifact = backup_postgres(args.database_url, Path(args.dest), passphrase, retention=args.retention)
            print(f"backup {artifact}")
    except (ValueError, RuntimeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
