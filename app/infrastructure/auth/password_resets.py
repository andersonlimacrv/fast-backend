"""Opaque password-reset tokens in Postgres: single-use, expiring, revokable.

Security contract (change B, mirrors refresh_tokens.py v2 §3.3–3.4):
- Tokens are random strings, stored ONLY as SHA-256 hash.
- Consume is a single transaction: lock row (`SELECT FOR UPDATE`), validate,
  mark `used_at`, rotate credential, revoke sessions, invalidate siblings.
- Reuse/expired/unknown all surface the same generic error (anti-enumeration
  at the service layer; routers never branch on the reason).
"""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta

from sqlalchemy import DateTime, ForeignKey, String, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core.settings import Settings
from app.infrastructure.db.base import Base


def new_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _uuid() -> str:
    import uuid

    return uuid.uuid4().hex


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)


class PasswordResetRepository:
    """Row-level operations; the service owns transaction boundaries."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def create(
        self, session: AsyncSession, *, user_id: str, now: datetime, ip: str | None = None
    ) -> tuple[PasswordReset, str]:
        token = new_reset_token()
        row = PasswordReset(
            user_id=user_id,
            token_hash=hash_reset_token(token),
            expires_at=now + timedelta(minutes=self._settings.password_reset_ttl_minutes),
            ip=ip,
        )
        session.add(row)
        await session.flush()
        return row, token

    async def consume(self, session: AsyncSession, *, presented_token: str, now: datetime) -> PasswordReset | None:
        """Lock the row and return it iff valid (single-use + not expired)."""
        row = (
            await session.execute(
                select(PasswordReset).where(PasswordReset.token_hash == hash_reset_token(presented_token)).with_for_update()
            )
        ).scalar_one_or_none()
        if row is None or row.used_at is not None or row.expires_at <= now:
            return None
        return row

    async def invalidate_pending(self, session: AsyncSession, *, user_id: str, now: datetime) -> None:
        await session.execute(
            update(PasswordReset).where(PasswordReset.user_id == user_id, PasswordReset.used_at.is_(None)).values(used_at=now)
        )

    async def purge_expired(self, session: AsyncSession, *, now: datetime, limit: int = 1000) -> int:
        """Delete expired-or-used rows; returns deleted count (maintenance job)."""
        from sqlalchemy import delete

        ids = (
            await session.execute(
                select(PasswordReset.id)
                .where((PasswordReset.expires_at <= now) | (PasswordReset.used_at.is_not(None)))
                .limit(limit)
            )
        ).scalars()
        doomed = list(ids.all())
        if not doomed:
            return 0
        await session.execute(delete(PasswordReset).where(PasswordReset.id.in_(doomed)))
        return len(doomed)
