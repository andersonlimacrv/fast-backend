"""AuthenticationService: register/login/refresh/logout. Never raises HTTPException."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, replace
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.errors import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    RefreshTokenInvalidError,
    RefreshTokenReuseError,
)
from app.core.settings import Settings
from app.infrastructure.auth.hashing import PwdlibHasher
from app.infrastructure.auth.jwt import mint_access_token
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
    ) -> None:
        self._settings = settings
        self._sessions = session_factory
        self._hasher = hasher
        self._refresh = refresh_repo
        self._throttler = throttler

    async def register(self, *, email: str, password: str) -> User:
        email = canonical_email(email)
        async with self._sessions() as session:
            async with session.begin():
                exists = await session.scalar(select(User.id).where(User.email == email))
                if exists is not None:
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
