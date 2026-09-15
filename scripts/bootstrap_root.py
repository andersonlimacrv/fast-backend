"""One-shot root bootstrap (CLI only, change A).

Creates the single `users.is_superuser=true` from `BOOTSTRAP_KEY`.
Fail-closed: wrong key OR existing root → generic message + exit 1
(never reveals which condition failed).

Usage:
    BOOTSTRAP_KEY=... uv run python scripts/bootstrap_root.py --email root@example.com
    make admin-bootstrap
"""

from __future__ import annotations

import argparse
import asyncio
import getpass
import hmac
import logging
import os

from app.core.settings import Settings
from app.infrastructure.auth.hashing import PwdlibHasher
from app.infrastructure.auth.refresh_tokens import RefreshTokenRepository
from app.infrastructure.auth.throttling import LoginThrottler
from app.infrastructure.db.session import create_session_factory
from app.modules.audit.service import AuditService
from app.modules.identity.service import AuthenticationService

logger = logging.getLogger(__name__)

GENERIC_FAILURE = "bootstrap failed"


async def bootstrap(*, settings: Settings, email: str, password: str, key: str):
    """Create the root. Raises on wrong key or existing root (caller maps to exit 1)."""
    if not settings.bootstrap_key or not key or not hmac.compare_digest(key, settings.bootstrap_key):
        raise ValueError(GENERIC_FAILURE)
    session_factory = create_session_factory(settings)
    hasher = PwdlibHasher(settings)
    refresh_repo = RefreshTokenRepository(settings)
    throttler = LoginThrottler(settings)
    try:
        auth = AuthenticationService(
            settings=settings,
            session_factory=session_factory,
            hasher=hasher,
            refresh_repo=refresh_repo,
            throttler=throttler,
        )
        user = await auth.create_superuser(email=email, password=password)
        audit = AuditService(session_factory=session_factory)
        await audit.record(
            tenant_id=None,
            actor_user_id=user.id,
            action="root.bootstrap",
            resource_type="user",
            resource_id=user.id,
            metadata={"success": True},
            ip="local",
        )
        return user
    finally:
        await throttler.aclose()
        await session_factory.kw["bind"].dispose()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create the one-shot root user.")
    parser.add_argument("--email", default=os.environ.get("ROOT_EMAIL", ""), help="root email (or ROOT_EMAIL)")
    parser.add_argument("--key", default=os.environ.get("BOOTSTRAP_KEY", ""), help="bootstrap key (or BOOTSTRAP_KEY)")
    return parser.parse_args(argv)


async def amain(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    email = args.email.strip()
    if not email:
        print(GENERIC_FAILURE)
        return 1
    password = getpass.getpass("root password (min 8 chars): ")
    if len(password) < 8:
        print(GENERIC_FAILURE)
        return 1
    try:
        settings = Settings()
        user = await bootstrap(settings=settings, email=email, password=password, key=args.key)
    except Exception:  # noqa: BLE001 (fail-closed by design: never reveal key vs exists)
        logger.warning("root bootstrap refused")
        print(GENERIC_FAILURE)
        return 1
    print(f"root created: {user.email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(amain()))
