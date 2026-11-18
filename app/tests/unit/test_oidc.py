"""Unit tests: generic OIDC adapter (no network; httpx MockTransport)."""

import base64
import json
from typing import Any
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest

from app.core.errors import SocialLoginError
from app.core.settings import Settings
from app.infrastructure.auth.oidc import OIDCProvider
from app.modules.identity.social import pkce_challenge

ISSUER = "https://idp.example.com"
REDIRECT_URI = "https://api.example.com/auth/social/oidc/callback"


def _settings(**overrides: Any) -> Settings:
    values: dict[str, Any] = {
        "_env_file": None,
        "secret_key": "x" * 32,
        "frontend_url": "https://app.example.com",
        "social_login_enabled": True,
        "oidc_issuer": ISSUER,
        "oidc_client_id": "client-123",
        "oidc_client_secret": "s3cret",
        "oidc_redirect_uri": REDIRECT_URI,
    }
    values.update(overrides)
    return Settings(**values)


def _fake_id_token(claims: dict) -> str:
    def enc(value: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(value).encode()).rstrip(b"=").decode()

    return f"{enc({'alg': 'none', 'typ': 'JWT'})}.{enc(claims)}."


def _transport(
    *,
    issuer: str = ISSUER,
    sub: str = "sub-1",
    id_token_sub: str | None = None,
    id_token_nonce: str = "nonce-789",
    verified: object = "true",
) -> httpx.MockTransport:
    id_token = _fake_id_token({"iss": ISSUER, "aud": "client-123", "sub": id_token_sub or sub, "nonce": id_token_nonce})

    async def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/.well-known/openid-configuration":
            return httpx.Response(
                200,
                json={
                    "issuer": issuer,
                    "authorization_endpoint": f"{ISSUER}/authorize?prompt=login",
                    "token_endpoint": f"{ISSUER}/token",
                    "userinfo_endpoint": f"{ISSUER}/userinfo",
                },
            )
        if request.url.path == "/token":
            body = request.content.decode()
            assert "code_verifier=verifier" in body
            assert "grant_type=authorization_code" in body
            return httpx.Response(200, json={"access_token": "at", "id_token": id_token})
        if request.url.path == "/userinfo":
            assert request.headers["authorization"] == "Bearer at"
            return httpx.Response(200, json={"sub": sub, "email": "Ada@Example.com", "email_verified": verified})
        return httpx.Response(404)

    return httpx.MockTransport(handler)


def _provider(transport: httpx.MockTransport, **overrides) -> OIDCProvider:
    return OIDCProvider(_settings(**overrides), client=httpx.AsyncClient(transport=transport))


@pytest.mark.unit
def test_pkce_challenge_matches_rfc7636_vector() -> None:
    verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    assert pkce_challenge(verifier) == "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"


@pytest.mark.unit
async def test_authorize_url_carries_pkce_state_and_nonce() -> None:
    provider = _provider(_transport())
    await provider.discover()
    url = provider.authorize_url(
        state="state-123", code_challenge="challenge-456", redirect_uri=REDIRECT_URI, nonce="nonce-789"
    )
    parts = urlsplit(url)
    query = parse_qs(parts.query)
    assert f"{parts.scheme}://{parts.netloc}{parts.path}" == f"{ISSUER}/authorize"
    assert query["prompt"] == ["login"]  # existing provider query preserved
    assert query["state"] == ["state-123"]
    assert query["nonce"] == ["nonce-789"]
    assert query["code_challenge"] == ["challenge-456"]
    assert query["code_challenge_method"] == ["S256"]
    assert query["redirect_uri"] == [REDIRECT_URI]
    assert "openid" in query["scope"][0].split()
    await provider.aclose()


@pytest.mark.unit
async def test_exchange_and_profile_normalize_identity() -> None:
    provider = _provider(_transport())
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    profile = await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    assert profile.provider == "oidc"
    assert profile.provider_sub == "sub-1"
    assert profile.email == "ada@example.com"
    assert profile.email_verified is True
    await provider.aclose()


@pytest.mark.unit
async def test_id_token_nonce_mismatch_fails_closed() -> None:
    provider = _provider(_transport())
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="other")
    await provider.aclose()


@pytest.mark.unit
async def test_unverified_email_is_reported_as_false() -> None:
    provider = _provider(_transport(verified="false"))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    profile = await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"])
    assert profile.email_verified is False
    await provider.aclose()


@pytest.mark.unit
async def test_discovery_issuer_mismatch_fails_closed() -> None:
    provider = _provider(_transport(issuer="https://evil.example.com"))
    with pytest.raises(SocialLoginError):
        await provider.discover()
    await provider.aclose()


@pytest.mark.unit
async def test_id_token_sub_mismatch_fails_closed() -> None:
    provider = _provider(_transport(sub="sub-1", id_token_sub="other-sub"))
    with pytest.raises(SocialLoginError):
        tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"])
    await provider.aclose()
