"""CurrentPrincipal: the ONLY place that turns a JWT into an identity.

Validates signature/iss/aud/exp/type, loads user state, enforces
`tokens_valid_after` and activity. Membership/tenancy checks belong to Fase 3.
"""

from dataclasses import dataclass
from datetime import UTC, datetime

import jwt as pyjwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import InvalidCredentialsError
from app.core.settings import Settings
from app.infrastructure.auth.cookies import ACCESS_COOKIE_NAME
from app.infrastructure.auth.csrf import assert_csrf
from app.infrastructure.auth.jwt import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Principal:
    user_id: str
    email: str
    is_superuser: bool
    is_staff: bool
    active_org_id: str | None
    token_iat: int
    # Transport the credential arrived on (change auth-cookies-http-only).
    # Cookie-authenticated mutations additionally pass the CSRF check below;
    # header flows never do (bearer is not ambient). Defaults False so every
    # existing construction keeps working.
    via_cookie: bool = False


def _settings_of(request: Request) -> Settings:
    settings = request.app.state.settings
    assert isinstance(settings, Settings)
    return settings


def _service_of(request: Request):
    return request.app.state.auth_service


async def current_principal(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Principal:
    """Resolve the caller from Bearer header OR (flag-gated) access cookie.

    Transition (change auth-cookies-http-only): flag off = header-only,
    byte-identical to before (cookies ignored entirely). Flag on = explicit
    header wins when present (cross-site forgeries cannot set it), otherwise
    the `access_token` cookie is accepted. Cookie-authenticated *mutations*
    additionally require the CSRF synchronizer token (safe methods exempt);
    the check lives here — never in services, never per-route. Sunset:
    header-only removal is a dedicated follow-up change (no removal here).
    """
    settings = _settings_of(request)
    raw_token: str | None = None
    via_cookie = False
    if credentials is not None and credentials.credentials:
        raw_token = credentials.credentials
    elif settings.auth_cookie_enabled:
        cookie_token = request.cookies.get(ACCESS_COOKIE_NAME)
        if cookie_token:
            raw_token = cookie_token
            via_cookie = True
    if raw_token is None:
        raise InvalidCredentialsError("missing bearer token")
    try:
        payload = decode_access_token(settings=settings, token=raw_token)
    except pyjwt.PyJWTError as exc:
        raise InvalidCredentialsError("invalid access token") from exc
    service = _service_of(request)
    user = await service.get_user(user_id=str(payload["sub"]))
    if user is None or not user.is_active:
        raise InvalidCredentialsError("invalid access token")
    iat = int(payload["iat"])
    if user.tokens_valid_after is not None:
        valid_after = user.tokens_valid_after
        if valid_after.tzinfo is None:
            valid_after = valid_after.replace(tzinfo=UTC)
        # JWT iat has second precision: a token minted in the same second as
        # the revocation must count as revoked, so validity requires STRICTLY
        # greater (v2 §3.5 formula adapted to integer-second iat).
        if iat <= int(valid_after.timestamp()):
            raise InvalidCredentialsError("token revoked")
    if via_cookie and settings.csrf_enabled:
        assert_csrf(request)
    return Principal(
        user_id=user.id,
        email=user.email,
        is_superuser=user.is_superuser,
        is_staff=user.is_staff or user.is_superuser,
        active_org_id=payload.get("active_org_id"),
        token_iat=iat,
        via_cookie=via_cookie,
    )


async def get_current_time() -> datetime:
    return datetime.now(UTC)
