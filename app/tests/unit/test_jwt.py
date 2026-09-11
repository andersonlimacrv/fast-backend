"""Unit tests: JWT mint/verify (no external services)."""

from datetime import UTC, timedelta

import jwt as pyjwt
import pytest

from app.core.settings import Settings
from app.infrastructure.auth.jwt import decode_access_token, mint_access_token


@pytest.fixture()
def settings() -> Settings:
    return Settings(secret_key="test-secret-key-min-32-chars-long-enough")


@pytest.mark.unit
def test_mint_decode_roundtrip_with_claims(settings: Settings) -> None:
    token = mint_access_token(settings=settings, user_id="u1", active_org_id="org-1")
    payload = decode_access_token(settings=settings, token=token)
    assert payload["sub"] == "u1"
    assert payload["type"] == "access"
    assert payload["iss"] == "fast-backend"
    assert payload["aud"] == "fast-backend-api"
    assert payload["active_org_id"] == "org-1"
    assert "jti" in payload
    assert payload["exp"] - payload["iat"] == 15 * 60


@pytest.mark.unit
def test_tampered_token_rejected(settings: Settings) -> None:
    token = mint_access_token(settings=settings, user_id="u1")
    with pytest.raises(pyjwt.PyJWTError):
        decode_access_token(settings=settings, token=token + "x")


@pytest.mark.unit
def test_wrong_secret_rejected(settings: Settings) -> None:
    token = mint_access_token(settings=settings, user_id="u1")
    other = Settings(secret_key="another-secret-key-min-32-chars-ok")
    with pytest.raises(pyjwt.PyJWTError):
        decode_access_token(settings=other, token=token)


@pytest.mark.unit
def test_expired_token_rejected(settings: Settings) -> None:
    token = mint_access_token(settings=settings, user_id="u1", ttl=timedelta(seconds=-1))
    with pytest.raises(pyjwt.ExpiredSignatureError):
        decode_access_token(settings=settings, token=token)


@pytest.mark.unit
def test_wrong_issuer_audience_rejected(settings: Settings) -> None:
    token = mint_access_token(settings=settings, user_id="u1")
    other = Settings(secret_key=settings.secret_key, jwt_issuer="other", jwt_audience="other-api")
    with pytest.raises(pyjwt.PyJWTError):
        decode_access_token(settings=other, token=token)


@pytest.mark.unit
def test_non_access_type_rejected(settings: Settings) -> None:
    import uuid
    from datetime import datetime

    now = datetime.now(UTC)
    forged = pyjwt.encode(
        {
            "sub": "u1",
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=5)).timestamp()),
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "jti": uuid.uuid4().hex,
        },
        settings.secret_key,
        algorithm="HS256",
    )
    with pytest.raises(pyjwt.InvalidTokenError):
        decode_access_token(settings=settings, token=forged)
