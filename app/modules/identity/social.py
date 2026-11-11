"""Social login service (change login-social-redesign).

Owns the OIDC dance and account linking; never raises HTTP errors. The
provider is injected as `core/contracts/social.SocialProvider`, so this module
stays free of OAuth/HTTP clients. Session minting reuses the password flow's
`RefreshTokenRepository` + JWT, including rotation/reuse/`tokens_valid_after`.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.contracts.social import SocialProfile, SocialProvider
from app.core.errors import SocialEmailUnverifiedError, SocialLoginError
from app.core.settings import Settings
from app.infrastructure.auth.jwt import mint_access_token
from app.infrastructure.auth.oidc_state import OIDCStateStore
from app.infrastructure.auth.refresh_tokens import RefreshTokenRepository
from app.infrastructure.auth.social import LinkedIdentity
from app.modules.identity.models import User
from app.modules.identity.service import AuthResult, canonical_email


def pkce_challenge(verifier: str) -> str:
    """RFC 7636 S256: BASE64URL(SHA256(verifier)) without padding."""
    digest = hashlib.sha256(verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()


class SocialLoginService:
    def __init__(
        self,
        settings: Settings,
        session_factory: async_sessionmaker[AsyncSession],
        refresh_repo: RefreshTokenRepository,
        provider: SocialProvider,
        states: OIDCStateStore,
    ) -> None:
        self._settings = settings
        self._sessions = session_factory
        self._refresh = refresh_repo
        self._provider = provider
        self._states = states

    async def begin(self) -> tuple[str, str]:
        """Create state+verifier+nonce and return (authorize_url, state)."""
        state = secrets.token_urlsafe(32)
        verifier = secrets.token_urlsafe(64)
        nonce = secrets.token_urlsafe(24)
        redirect_uri = self._settings.oidc_redirect_uri
        await self._provider.discover()
        await self._states.put_state(
            state,
            code_verifier=verifier,
            nonce=nonce,
            redirect_uri=redirect_uri,
            provider=self._provider.provider,
        )
        url = self._provider.authorize_url(
            state=state,
            code_challenge=pkce_challenge(verifier),
            redirect_uri=redirect_uri,
            nonce=nonce,
        )
        return url, state

    async def complete(self, *, code: str, state: str) -> str:
        """Exchange the code, link/create the user, return a one-time grant."""
        record = await self._states.consume_state(state)
        if record is None or record.get("provider") != self._provider.provider:
            raise SocialLoginError("invalid or expired state")
        tokens = await self._provider.exchange_code(
            code=code,
            code_verifier=str(record.get("code_verifier", "")),
            redirect_uri=str(record.get("redirect_uri", "")),
        )
        access_token = tokens.get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise SocialLoginError("identity provider rejected the code")
        id_token = tokens.get("id_token")
        profile = await self._provider.get_profile(
            access_token=access_token,
            id_token=id_token if isinstance(id_token, str) and id_token else None,
            nonce=str(record.get("nonce", "")) or None,
        )
        user = await self._link_or_create(profile)
        grant = secrets.token_urlsafe(32)
        await self._states.put_grant(grant, user_id=user.id, family_id=uuid.uuid4().hex, provider=self._provider.provider)
        return grant

    async def exchange(self, *, grant: str, ip: str, user_agent: str | None) -> AuthResult:
        """Consume the grant and mint the standard token pair."""
        record = await self._states.consume_grant(grant)
        if record is None:
            raise SocialLoginError("invalid or expired exchange code")
        user_id = str(record.get("user_id", ""))
        family_id = str(record.get("family_id", ""))
        if not user_id or not family_id:
            raise SocialLoginError("invalid or expired exchange code")
        now = datetime.now(UTC)
        async with self._sessions() as session:
            async with session.begin():
                user = await session.get(User, user_id)
                if user is None or not user.is_active:
                    raise SocialLoginError("invalid or expired exchange code")
                _, refresh_token = await self._refresh.mint(
                    session, user_id=user.id, family_id=family_id, now=now, ip=ip, user_agent=user_agent
                )
                access_token = mint_access_token(settings=self._settings, user_id=user.id)
        return AuthResult(user=user, access_token=access_token, refresh_token=refresh_token)

    async def _link_or_create(self, profile: SocialProfile) -> User:
        # Two concurrent callbacks can race the unique (provider, provider_sub)
        # constraint; the loser retries once and finds the winner's link.
        try:
            return await self._link_or_create_once(profile)
        except IntegrityError:
            try:
                return await self._link_or_create_once(profile)
            except IntegrityError as exc:
                raise SocialLoginError("social login failed") from exc

    async def _link_or_create_once(self, profile: SocialProfile) -> User:
        async with self._sessions() as session:
            async with session.begin():
                linked = await session.scalar(
                    select(LinkedIdentity).where(
                        LinkedIdentity.provider == profile.provider,
                        LinkedIdentity.provider_sub == profile.provider_sub,
                    )
                )
                if linked is not None:
                    user = await session.get(User, linked.user_id)
                    if user is None or not user.is_active:
                        raise SocialLoginError("social login failed")
                    return user
                email = canonical_email(profile.email) if profile.email else None
                # Auto-link only when the IdP asserts email verification;
                # otherwise an unverified address could seize an account.
                if not email or not profile.email_verified or "@" not in email:
                    raise SocialEmailUnverifiedError("verified email required")
                user = await session.scalar(select(User).where(User.email == email))
                if user is None:
                    user = User(email=email)
                    session.add(user)
                    await session.flush()
                if not user.is_active:
                    raise SocialLoginError("social login failed")
                session.add(
                    LinkedIdentity(
                        user_id=user.id,
                        provider=profile.provider,
                        provider_sub=profile.provider_sub,
                        email=email,
                    )
                )
                await session.flush()
                return user

    async def aclose(self) -> None:
        close = getattr(self._provider, "aclose", None)
        if callable(close):
            await close()
        await self._states.aclose()
