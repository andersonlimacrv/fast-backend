"""Opaque refresh tokens in Postgres: rotation, family revocation, atomic consume.

Security contract (v2 §3.3–3.4):
- Tokens are random strings, stored ONLY as SHA-256 hash (fast lookup hash,
  not a password KDF — brute force is infeasible on 256-bit entropy).
- Rotation is a single transaction: lock row (`SELECT FOR UPDATE`), validate,
  mark `used_at`, create successor, link `replaced_by`.
- Presenting a consumed token = REUSE → revoke the whole family, then 401.
  No grace window: any second use of the same token kills the session chain.
  Concurrent double-submit therefore logs the session out (secure default).
"""

from __future__ import annotations

import hashlib
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import DateTime, ForeignKey, String, Text, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core.settings import Settings
from app.infrastructure.db.base import Base


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _uuid() -> str:
    import uuid

    return uuid.uuid4().hex


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    family_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    replaced_by: Mapped[str | None] = mapped_column(String(32), ForeignKey("refresh_tokens.id"), nullable=True)
    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)


@dataclass(frozen=True)
class RotationResult:
    """Outcome of `rotate`. Never raises: the caller commits first (so a reuse
    revocation is persisted) and only then translates non-ok outcomes to errors."""

    status: str  # "ok" | "invalid" | "reuse"
    successor: RefreshToken | None = None
    new_token: str = ""
    user_id: str = ""


class RefreshTokenRepository:
    """All operations assume the caller manages the transaction boundary via
    `async with session.begin()` (service layer)."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def mint(
        self,
        session: AsyncSession,
        *,
        user_id: str,
        family_id: str,
        now: datetime,
        ip: str | None = None,
        user_agent: str | None = None,
    ) -> tuple[RefreshToken, str]:
        token = new_refresh_token()
        row = RefreshToken(
            user_id=user_id,
            token_hash=hash_refresh_token(token),
            family_id=family_id,
            expires_at=now + timedelta(days=self._settings.refresh_token_ttl_days),
            ip=ip,
            user_agent=user_agent,
        )
        session.add(row)
        await session.flush()
        return row, token

    async def rotate(
        self,
        session: AsyncSession,
        *,
        presented_token: str,
        now: datetime,
        ip: str | None = None,
        user_agent: str | None = None,
    ) -> RotationResult:
        """Atomically consume `presented_token` (row lock, single transaction).

        Returns a `RotationResult`; stages the family revocation for reuse but
        never raises, so the caller can COMMIT before surfacing the error.
        """
        token_hash = hash_refresh_token(presented_token)
        result = await session.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash).with_for_update())
        row = result.scalar_one_or_none()
        if row is None or row.revoked_at is not None or row.expires_at <= now:
            return RotationResult(status="invalid")
        if row.used_at is not None:
            await session.execute(
                update(RefreshToken)
                .where(RefreshToken.family_id == row.family_id, RefreshToken.revoked_at.is_(None))
                .values(revoked_at=now)
            )
            await session.flush()
            return RotationResult(status="reuse")
        row.used_at = now
        successor, new_token = await self.mint(
            session, user_id=row.user_id, family_id=row.family_id, now=now, ip=ip, user_agent=user_agent
        )
        row.replaced_by = successor.id
        return RotationResult(status="ok", successor=successor, new_token=new_token, user_id=row.user_id)

    async def revoke_token(self, session: AsyncSession, *, token_hash: str, now: datetime) -> None:
        await session.execute(update(RefreshToken).where(RefreshToken.token_hash == token_hash).values(revoked_at=now))

    async def revoke_family(self, session: AsyncSession, *, family_id: str, now: datetime) -> None:
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )

    async def revoke_all_for_user(self, session: AsyncSession, *, user_id: str, now: datetime) -> None:
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
