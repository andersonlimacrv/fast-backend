"""AuthenticationService: register/login/refresh/logout. Never raises HTTPException."""

from __future__ import annotations

import secrets
import uuid
from dataclasses import dataclass, replace
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.errors import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    LastRootProtectedError,
    PasswordResetError,
    RefreshTokenInvalidError,
    RefreshTokenReuseError,
)
from app.core.settings import Settings
from app.infrastructure.auth.hashing import PwdlibHasher
from app.infrastructure.auth.jwt import mint_access_token
from app.infrastructure.auth.password_resets import PasswordResetRepository
from app.infrastructure.auth.refresh_tokens import RefreshTokenRepository, hash_refresh_token
from app.infrastructure.auth.throttling import LoginThrottler
from app.modules.identity.models import Credential, User


@dataclass(frozen=True)
class AuthResult:
    user: User
    access_token: str
    refresh_token: str


def canonical_email(email: str) -> str:
    return email.strip().lower()


class AuthenticationService:
    def __init__(
        self,
        settings: Settings,
        session_factory: async_sessionmaker[AsyncSession],
        hasher: PwdlibHasher,
        refresh_repo: RefreshTokenRepository,
        throttler: LoginThrottler,
        reset_repo: PasswordResetRepository | None = None,
        outbox=None,
    ) -> None:
        self._settings = settings
        self._sessions = session_factory
        self._hasher = hasher
        self._refresh = refresh_repo
        self._throttler = throttler
        self._resets = reset_repo or PasswordResetRepository(settings)
        self._outbox = outbox
        # Anti-enumeration: spent on unknown-email logins so their Argon2 cost
        # matches the real path (see `login`). Lazy: no startup cost for CLI.
        self._dummy_hash: str | None = None

    def _dummy_password_hash(self) -> str:
        if self._dummy_hash is None:
            self._dummy_hash = self._hasher.hash(secrets.token_hex(32))
        return self._dummy_hash

    async def register(self, *, email: str, password: str, ip: str) -> User:
        """Create an account. Throttled per IP *before* the Argon2 cost.

        The scope check runs first so throttled callers get the same generic
        429 for new and existing emails (no enumeration oracle). Only the
        duplicate (409) path consumes the budget — 201 never does (a NAT with
        many legitimate signups must not lock out; mass creation with fresh
        emails is covered by the global per-IP ceiling instead).
        """
        email = canonical_email(email)
        await self._throttler.check_register(ip)
        async with self._sessions() as session:
            async with session.begin():
                exists = await session.scalar(select(User.id).where(User.email == email))
                if exists is not None:
                    # Redis write, rolled-back PG read-tx is harmless (same as login).
                    await self._throttler.record_register_failure(ip)
                    raise EmailAlreadyRegisteredError("email already registered")
                user = User(email=email)
                session.add(user)
                await session.flush()
                session.add(Credential(user_id=user.id, password_hash=self._hasher.hash(password)))
            await session.refresh(user)
            return user

    async def _load_for_login(self, session: AsyncSession, email: str) -> tuple[User, Credential] | None:
        user = await session.scalar(select(User).where(User.email == email))
        if user is None:
            return None
        cred = await session.scalar(select(Credential).where(Credential.user_id == user.id))
        if cred is None:
            return None
        return user, cred

    async def login(self, *, email: str, password: str, ip: str, user_agent: str | None) -> AuthResult:
        email = canonical_email(email)
        await self._throttler.check(ip, email)
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                loaded = await self._load_for_login(session, email)
                if loaded is None:
                    # Same Argon2 cost as a real check; result discarded. Without
                    # this, response timing alone reveals whether the email exists.
                    self._hasher.verify(password, self._dummy_password_hash())
                    await self._throttler.record_failure(ip, email)
                    raise InvalidCredentialsError("invalid credentials")
                user, cred = loaded
                valid, new_hash = self._hasher.verify_and_update(password, cred.password_hash)
                if not valid or not user.is_active:
                    await self._throttler.record_failure(ip, email)
                    raise InvalidCredentialsError("invalid credentials")
                if new_hash is not None:
                    cred.password_hash = new_hash
                family_id = uuid.uuid4().hex
                _, refresh_token = await self._refresh.mint(
                    session, user_id=user.id, family_id=family_id, now=now, ip=ip, user_agent=user_agent
                )
                access_token = mint_access_token(settings=self._settings, user_id=user.id)
            await self._throttler.reset(ip, email)
            return AuthResult(user=user, access_token=access_token, refresh_token=refresh_token)

    async def refresh(self, *, refresh_token: str, ip: str, user_agent: str | None) -> AuthResult:
        await self._throttler.check(ip, refresh_token[:16])
        now = datetime.now(UTC)
        async with self._sessions() as session:
            # Commit BEFORE raising: a reuse revocation must persist even though
            # the request itself fails (raising inside the transaction would roll it back).
            async with session.begin():
                outcome = await self._refresh.rotate(
                    session, presented_token=refresh_token, now=now, ip=ip, user_agent=user_agent
                )
                user = None
                access_token = ""
                if outcome.status == "ok":
                    user = await session.get(User, outcome.user_id)
                    if user is None or not user.is_active:
                        outcome = replace(outcome, status="invalid")
                    else:
                        access_token = mint_access_token(settings=self._settings, user_id=user.id)
            if outcome.status == "reuse":
                await self._throttler.record_failure(ip, refresh_token[:16])
                raise RefreshTokenReuseError("refresh token reuse detected")
            if outcome.status != "ok":
                await self._throttler.record_failure(ip, refresh_token[:16])
                raise RefreshTokenInvalidError("invalid refresh token")
            await self._throttler.reset(ip, refresh_token[:16])
            assert user is not None
            return AuthResult(user=user, access_token=access_token, refresh_token=outcome.new_token)

    async def logout(self, *, refresh_token: str) -> None:
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                await self._refresh.revoke_token(session, token_hash=hash_refresh_token(refresh_token), now=now)

    async def logout_everywhere(self, *, user_id: str) -> None:
        await self.invalidate_tokens(user_id=user_id)

    async def invalidate_tokens(self, *, user_id: str) -> None:
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                user = await session.get(User, user_id)
                if user is None:
                    return
                user.tokens_valid_after = now
                await self._refresh.revoke_all_for_user(session, user_id=user_id, now=now)

    async def change_password(self, *, user_id: str, current_password: str, new_password: str) -> None:
        async with self._sessions() as session:
            async with session.begin():
                cred = await session.scalar(select(Credential).where(Credential.user_id == user_id))
                if cred is None or not self._hasher.verify(current_password, cred.password_hash):
                    raise InvalidCredentialsError("invalid credentials")
                cred.password_hash = self._hasher.hash(new_password)
                user = await session.get(User, user_id)
                if user is not None:
                    user.tokens_valid_after = datetime.now(UTC)
                    await self._refresh.revoke_all_for_user(session, user_id=user_id, now=datetime.now(UTC))

    async def get_user(self, *, user_id: str) -> User | None:
        async with self._sessions() as session:
            return await session.get(User, user_id)

    # --- Admin control plane (change A): global account management. Policies
    # (who may call what) live in modules/admin/policies.py; these primitives
    # enforce structural invariants (single root, last-root protection). ---

    async def count_superusers(self) -> int:
        async with self._sessions() as session:
            return int(await session.scalar(select(func.count()).select_from(User).where(User.is_superuser)) or 0)

    async def count_users(self) -> int:
        async with self._sessions() as session:
            return int(await session.scalar(select(func.count()).select_from(User)) or 0)

    async def list_users(self, *, limit: int = 100, offset: int = 0) -> list[User]:
        async with self._sessions() as session:
            rows = await session.execute(select(User).order_by(User.created_at).limit(limit).offset(offset))
            return list(rows.scalars().all())

    async def create_superuser(self, *, email: str, password: str) -> User:
        """One-shot root creation (CLI only). Fail-closed when a root exists."""
        email = canonical_email(email)
        async with self._sessions() as session:
            async with session.begin():
                if await session.scalar(select(User.id).where(User.is_superuser)) is not None:
                    raise LastRootProtectedError("root already exists")
                if await session.scalar(select(User.id).where(User.email == email)) is not None:
                    raise EmailAlreadyRegisteredError("email already registered")
                user = User(email=email, is_superuser=True, is_staff=True)
                session.add(user)
                await session.flush()
                session.add(Credential(user_id=user.id, password_hash=self._hasher.hash(password)))
            await session.refresh(user)
            return user

    async def create_user_by_admin(self, *, email: str, password: str) -> User:
        """Staff-created account: active, never privileged (flags only via grant flows)."""
        email = canonical_email(email)
        async with self._sessions() as session:
            async with session.begin():
                if await session.scalar(select(User.id).where(User.email == email)) is not None:
                    raise EmailAlreadyRegisteredError("email already registered")
                user = User(email=email)
                session.add(user)
                await session.flush()
                session.add(Credential(user_id=user.id, password_hash=self._hasher.hash(password)))
            await session.refresh(user)
            return user

    async def set_active(self, *, user_id: str, active: bool) -> User | None:
        """Disable/enable. Disabling the last root is refused; disabling takes
        effect immediately (sessions revoked via tokens_valid_after)."""
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                user = await session.get(User, user_id)
                if user is None:
                    return None
                if not active and user.is_superuser:
                    remaining = await session.scalar(
                        select(func.count()).select_from(User).where(User.is_superuser, User.is_active, User.id != user_id)
                    )
                    if not remaining:
                        raise LastRootProtectedError("cannot disable the last root")
                user.is_active = active
                if not active:
                    user.tokens_valid_after = now
                    await self._refresh.revoke_all_for_user(session, user_id=user_id, now=now)
            return user

    async def set_staff(self, *, user_id: str, staff: bool) -> User | None:
        """Grant/revoke global staff. Revoking staff from a root is refused
        (superuser implies staff); use disable for containment instead."""
        async with self._sessions() as session:
            async with session.begin():
                user = await session.get(User, user_id)
                if user is None:
                    return None
                if not staff and user.is_superuser:
                    raise LastRootProtectedError("cannot revoke staff from root")
                user.is_staff = staff
            return user

    # --- Password recovery (change B): token-opaque, single-use, boundary event. ---

    def _reset_link(self, token: str) -> str:
        base = self._settings.frontend_url.rstrip("/")
        return f"{base}/reset?token={token}"

    async def request_reset(self, *, email: str, ip: str) -> str | None:
        """Enqueue a reset email; returns user_id iff an active user exists.

        Response stays generic (router always 202); the id is only for audit.
        Throttled per (ip, email) as a counter: every call increments, so
        enumeration bursts hit 429 without revealing existence.
        """
        email = canonical_email(email)
        key = f"pwd-reset:{email}"
        await self._throttler.check(ip, key)
        await self._throttler.record_failure(ip, key)
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                user = await session.scalar(select(User).where(User.email == email))
                if user is None or not user.is_active:
                    return None
                row, token = await self._resets.create(session, user_id=user.id, now=now, ip=ip)
                row_id = row.id
                address = user.email
                user_id = user.id
            if self._outbox is None:
                return user_id
            await self._outbox.enqueue(
                type="email.template",
                idempotency_key=f"password-reset:{row_id}",
                payload={
                    "to": address,
                    "subject": "Password reset",
                    "template": "password_reset",
                    "context": {"name": address, "link": self._reset_link(token)},
                },
                aggregate_id=user_id,
            )
            return user_id

    async def reset_password(self, *, token: str, new_password: str, ip: str) -> None:
        """Consume a reset token: rotate credential + revoke sessions + siblings."""
        await self._throttler.check(ip, token[:16])
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                row = await self._resets.consume(session, presented_token=token, now=now)
                if row is None:
                    await self._throttler.record_failure(ip, token[:16])
                    raise PasswordResetError("invalid or expired reset token")
                cred = await session.scalar(select(Credential).where(Credential.user_id == row.user_id))
                user = await session.get(User, row.user_id)
                if cred is None or user is None or not user.is_active:
                    row.used_at = now
                    await self._throttler.record_failure(ip, token[:16])
                    raise PasswordResetError("invalid or expired reset token")
                cred.password_hash = self._hasher.hash(new_password)
                user.tokens_valid_after = now
                await self._refresh.revoke_all_for_user(session, user_id=user.id, now=now)
                row.used_at = now
                await self._resets.invalidate_pending(session, user_id=user.id, now=now)
            await self._throttler.reset(ip, token[:16])

    async def admin_initiate_reset(self, *, user_id: str, ip: str) -> bool:
        """Privileged force-reset: revoke sessions now, then enqueue recovery mail."""
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                user = await session.get(User, user_id)
                if user is None or not user.is_active:
                    return False
                user.tokens_valid_after = now
                await self._refresh.revoke_all_for_user(session, user_id=user_id, now=now)
                row, token = await self._resets.create(session, user_id=user_id, now=now, ip=ip)
                row_id = row.id
                address = user.email
            if self._outbox is None:
                return True
            await self._outbox.enqueue(
                type="email.template",
                idempotency_key=f"password-reset:{row_id}",
                payload={
                    "to": address,
                    "subject": "Password reset",
                    "template": "password_reset",
                    "context": {"name": address, "link": self._reset_link(token)},
                },
                aggregate_id=user_id,
            )
            return True

    async def purge_expired_resets(self, *, limit: int = 1000) -> int:
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                return await self._resets.purge_expired(session, now=now, limit=limit)
