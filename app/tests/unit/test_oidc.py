"""Unit tests: generic OIDC adapter with RS256 id_token verification (no network)."""

import base64
import json
import time
from typing import Any
from urllib.parse import parse_qs, urlsplit

import httpx
import jwt as pyjwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

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


def _b64u_raw(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _rsa_key() -> tuple[str, dict[str, str]]:
    """One-off test key: (private PEM, public JWK fields). Generated per call."""
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    public = key.public_key()
    numbers = public.public_numbers()
    n = _b64u_raw(numbers.n.to_bytes((numbers.n.bit_length() + 7) // 8, "big"))
    e = _b64u_raw(numbers.e.to_bytes((numbers.e.bit_length() + 7) // 8, "big"))
    return private_pem, {"kty": "RSA", "n": n, "e": e}


_PRIVATE_PEM, _PUBLIC_JWK_FIELDS = _rsa_key()
_OTHER_PRIVATE_PEM, _ = _rsa_key()
_KID = "test-key-1"


def _id_token(
    claims: dict | None = None,
    *,
    key_pem: str = _PRIVATE_PEM,
    kid: str = _KID,
    alg: str = "RS256",
    sub: str = "sub-1",
    nonce: str = "nonce-789",
    issuer: str = ISSUER,
    audience: str = "client-123",
    lifetime: int = 300,
) -> str:
    now = int(time.time())
    payload = {"iss": issuer, "aud": audience, "sub": sub, "nonce": nonce, "iat": now, "exp": now + lifetime}
    payload.update(claims or {})
    return pyjwt.encode(payload, key_pem, algorithm=alg, headers={"kid": kid})


def _unsigned_id_token(claims: dict) -> str:
    def enc(value: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(value).encode()).rstrip(b"=").decode()

    return f"{enc({'alg': 'none', 'typ': 'JWT'})}.{enc(claims)}."


def _transport(
    *,
    issuer: str = ISSUER,
    sub: str = "sub-1",
    id_token: str | None = None,
    verified: object = "true",
    jwks_keys: list[dict] | None = None,
    jwks_sequence: list[list[dict]] | None = None,
) -> httpx.MockTransport:
    token = id_token if id_token is not None else _id_token(sub=sub)
    calls = {"jwks": 0}
    default_keys = [{**_PUBLIC_JWK_FIELDS, "kid": _KID, "use": "sig", "alg": "RS256"}]

    async def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/.well-known/openid-configuration":
            return httpx.Response(
                200,
                json={
                    "issuer": issuer,
                    "authorization_endpoint": f"{ISSUER}/authorize?prompt=login",
                    "token_endpoint": f"{ISSUER}/token",
                    "userinfo_endpoint": f"{ISSUER}/userinfo",
                    "jwks_uri": f"{ISSUER}/jwks",
                },
            )
        if request.url.path == "/jwks":
            if jwks_sequence is not None:
                keys = jwks_sequence[min(calls["jwks"], len(jwks_sequence) - 1)]
            else:
                keys = default_keys if jwks_keys is None else jwks_keys
            calls["jwks"] += 1
            return httpx.Response(200, json={"keys": keys})
        if request.url.path == "/token":
            body = request.content.decode()
            assert "code_verifier=verifier" in body
            assert "grant_type=authorization_code" in body
            return httpx.Response(200, json={"access_token": "at", "id_token": token})
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
async def test_tampered_id_token_fails_closed() -> None:
    good = _id_token()
    head, payload, sig = good.split(".")
    tampered_payload = ("A" if not payload.startswith("A") else "B") + payload[1:]
    provider = _provider(_transport(id_token=f"{head}.{tampered_payload}.{sig}"))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    await provider.aclose()


@pytest.mark.unit
async def test_unsigned_id_token_is_refused() -> None:
    now = int(time.time())
    unsigned = _unsigned_id_token(
        {"iss": ISSUER, "aud": "client-123", "sub": "sub-1", "nonce": "nonce-789", "iat": now, "exp": now + 300}
    )
    provider = _provider(_transport(id_token=unsigned))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    await provider.aclose()


@pytest.mark.unit
async def test_wrong_key_id_token_fails_closed() -> None:
    other = _id_token(key_pem=_OTHER_PRIVATE_PEM)
    provider = _provider(_transport(id_token=other))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    await provider.aclose()


@pytest.mark.unit
async def test_rotated_key_passes_after_jwks_refetch() -> None:
    rotated_private, rotated_pub = _rsa_key()
    rotated = _id_token(key_pem=rotated_private, kid="rotated-key-9")
    first = [{**_PUBLIC_JWK_FIELDS, "kid": _KID, "use": "sig", "alg": "RS256"}]
    second = first + [{**rotated_pub, "kid": "rotated-key-9", "use": "sig", "alg": "RS256"}]
    provider = _provider(_transport(id_token=rotated, jwks_sequence=[first, second]))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    profile = await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    assert profile.provider_sub == "sub-1"
    await provider.aclose()


@pytest.mark.unit
async def test_expired_id_token_fails_closed() -> None:
    provider = _provider(_transport(id_token=_id_token(lifetime=-3600)))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
    await provider.aclose()


@pytest.mark.unit
async def test_wrong_audience_fails_closed() -> None:
    provider = _provider(_transport(id_token=_id_token(audience="other-client")))
    tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
    with pytest.raises(SocialLoginError):
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"], nonce="nonce-789")
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
    provider = _provider(_transport(sub="sub-1", id_token=_id_token(sub="other-sub")))
    with pytest.raises(SocialLoginError):
        tokens = await provider.exchange_code(code="abc", code_verifier="verifier", redirect_uri=REDIRECT_URI)
        await provider.get_profile(access_token=tokens["access_token"], id_token=tokens["id_token"])
    await provider.aclose()
