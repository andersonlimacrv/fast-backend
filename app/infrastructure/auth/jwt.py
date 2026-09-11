"""Short-lived HS256 access tokens. Monolith: no asymmetric keys (v2 §3.2)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

import jwt

from app.core.settings import Settings

ACCESS_TOKEN_TYPE = "access"  # noqa: S105 (token type label, not a secret)


def mint_access_token(
    *,
    settings: Settings,
    user_id: str,
    active_org_id: str | None = None,
    ttl: timedelta | None = None,
) -> str:
    now = datetime.now(UTC)
    expires = now + (ttl or timedelta(minutes=settings.access_token_ttl_minutes))
    return jwt.encode(
        {
            "sub": user_id,
            "type": ACCESS_TOKEN_TYPE,
            "iat": int(now.timestamp()),
            "exp": int(expires.timestamp()),
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "jti": uuid.uuid4().hex,
            "active_org_id": active_org_id,
        },
        settings.secret_key,
        algorithm="HS256",
    )


def decode_access_token(*, settings: Settings, token: str) -> dict:
    """Decode + validate signature, expiry, issuer, audience and token type.

    Raises `jwt.PyJWTError` (incl. `ExpiredSignatureError`, `InvalidTokenError`)
    on any violation. Membership/tenancy checks belong to `CurrentPrincipal`.
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=["HS256"],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={"require": ["sub", "type", "iat", "exp", "iss", "aud", "jti"]},
    )
    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise jwt.InvalidTokenError("not an access token")
    return payload
