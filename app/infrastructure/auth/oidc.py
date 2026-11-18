"""Generic OIDC adapter (change login-social-redesign, hardened in
change oidc-id-token-signature).

Implements `core/contracts/social.SocialProvider` using Authorization Code +
PKCE S256. Discovery is cached per process; the issuer from discovery must
match `OIDC_ISSUER` exactly (OIDC Core §4.3). Modules never import this
module directly's provider libraries — they receive it as a Protocol, so
`no-provider-imports-in-modules` stays intact.

Identity proof (OIDC Core §3.1.3.7): the `id_token` signature is verified
(RS256 only) against the provider JWKS, with `iss`/`aud`/`exp`/`iat`/`sub`
checked and the `nonce` bound to the state record. The access token is then
used at the authenticated UserInfo endpoint; the two identities must agree
on `sub`.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
import jwt as pyjwt
from jwt.algorithms import RSAAlgorithm

from app.core.errors import SocialLoginError
from app.core.settings import Settings

# Clock-skew tolerance for `exp`/`iat` (standard practice, ADR 0015).
_ID_TOKEN_LEEWAY_SECONDS = 60


@dataclass(frozen=True)
class OIDCProfile:
    provider: str
    provider_sub: str
    email: str | None
    email_verified: bool


def _with_query(url: str, params: dict[str, str]) -> str:
    """Merge `params` into an endpoint URL that may already carry a query."""
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.update(params)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


class OIDCProvider:
    provider: str

    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self.provider = settings.oidc_provider
        self._client = client or httpx.AsyncClient(timeout=10.0, follow_redirects=False)
        self._configuration: dict[str, Any] | None = None
        self._jwks_keys: dict[str, Any] | None = None

    async def _config(self) -> dict[str, Any]:
        if self._configuration is not None:
            return self._configuration
        issuer = self._settings.oidc_issuer.rstrip("/")
        try:
            resp = await self._client.get(f"{issuer}/.well-known/openid-configuration")
            resp.raise_for_status()
            config = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SocialLoginError("identity provider unavailable") from exc
        if not isinstance(config, dict):
            raise SocialLoginError("identity provider unavailable")
        discovered_issuer = str(config.get("issuer", "")).rstrip("/")
        if discovered_issuer != issuer:
            raise SocialLoginError("identity provider configuration mismatch")
        for key in ("authorization_endpoint", "token_endpoint", "userinfo_endpoint", "jwks_uri"):
            if not isinstance(config.get(key), str) or not config[key]:
                raise SocialLoginError("identity provider configuration incomplete")
        self._configuration = config
        return config

    async def _jwks(self, *, refresh: bool = False) -> dict[str, Any]:
        """Provider signing keys by `kid`, cached per process.

        Rotation is covered by refetch-on-unknown-`kid` at the single call
        site (`_key_for`); no TTL thread, no Redis (ADR 0015).
        """
        if self._jwks_keys is None or refresh:
            config = await self._config()
            try:
                resp = await self._client.get(str(config["jwks_uri"]))
                resp.raise_for_status()
                document = resp.json()
            except (httpx.HTTPError, ValueError) as exc:
                raise SocialLoginError("identity provider keys unavailable") from exc
            if not isinstance(document, dict) or not isinstance(document.get("keys"), list):
                raise SocialLoginError("identity provider keys unavailable")
            self._jwks_keys = {
                str(entry["kid"]): entry
                for entry in document["keys"]
                if isinstance(entry, dict) and isinstance(entry.get("kid"), str)
            }
        assert self._jwks_keys is not None
        return self._jwks_keys

    def _key_for(self, jwks: dict[str, Any], kid: str) -> Any:
        try:
            return RSAAlgorithm.from_jwk(json.dumps(jwks[kid]))
        except (KeyError, ValueError, TypeError) as exc:
            raise SocialLoginError("identity provider token invalid") from exc

    def authorize_url(self, *, state: str, code_challenge: str, redirect_uri: str, nonce: str) -> str:
        # Discovery is async; the service warms it via `discover()` before
        # building the URL. Fail closed if a caller forgets.
        if self._configuration is None:
            raise SocialLoginError("identity provider not discovered")
        params = {
            "response_type": "code",
            "client_id": self._settings.oidc_client_id,
            "redirect_uri": redirect_uri,
            "scope": self._settings.oidc_scopes,
            "state": state,
            "nonce": nonce,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        return _with_query(str(self._configuration["authorization_endpoint"]), params)

    async def discover(self) -> None:
        await self._config()

    async def exchange_code(self, *, code: str, code_verifier: str, redirect_uri: str) -> dict[str, Any]:
        config = await self._config()
        form = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self._settings.oidc_client_id,
            "client_secret": self._settings.oidc_client_secret,
            "code_verifier": code_verifier,
        }
        try:
            resp = await self._client.post(str(config["token_endpoint"]), data=form, headers={"Accept": "application/json"})
            resp.raise_for_status()
            payload = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SocialLoginError("identity provider rejected the code") from exc
        if not isinstance(payload, dict):
            raise SocialLoginError("identity provider rejected the code")
        access_token = payload.get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise SocialLoginError("identity provider returned no access token")
        return payload

    async def _check_id_token(self, id_token: str, *, expected_sub: str, expected_nonce: str | None) -> None:
        """Verify the `id_token` signature + claims (OIDC Core §3.1.3.7).

        RS256 only (any other `alg`, including `none`, is refused); `iss`,
        `aud`, `exp`/`iat` (with leeway), `sub` and `nonce` are enforced.
        An unknown `kid` triggers one JWKS refetch (rotation) before
        failing. Every failure maps to the same generic error (never an
        oracle).
        """
        try:
            header = pyjwt.get_unverified_header(id_token)
        except pyjwt.PyJWTError as exc:
            raise SocialLoginError("identity provider token invalid") from exc
        if header.get("alg") != "RS256" or not isinstance(header.get("kid"), str):
            raise SocialLoginError("identity provider token invalid")
        jwks = await self._jwks()
        if header["kid"] not in jwks:
            jwks = await self._jwks(refresh=True)
        key = self._key_for(jwks, header["kid"])
        try:
            claims = pyjwt.decode(
                id_token,
                key,
                algorithms=["RS256"],
                audience=self._settings.oidc_client_id,
                issuer=self._settings.oidc_issuer.rstrip("/"),
                leeway=_ID_TOKEN_LEEWAY_SECONDS,
                options={"require": ["exp", "iat", "sub"]},
            )
        except pyjwt.PyJWTError as exc:
            raise SocialLoginError("identity provider token invalid") from exc
        if claims.get("sub") != expected_sub:
            raise SocialLoginError("identity provider token invalid")
        if expected_nonce is not None and claims.get("nonce") != expected_nonce:
            raise SocialLoginError("identity provider token invalid")

    async def get_profile(self, *, access_token: str, id_token: str | None = None, nonce: str | None = None) -> OIDCProfile:
        config = await self._config()
        try:
            resp = await self._client.get(
                str(config["userinfo_endpoint"]),
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SocialLoginError("identity provider profile unavailable") from exc
        if not isinstance(data, dict):
            raise SocialLoginError("identity provider profile unavailable")
        sub = data.get("sub")
        if not isinstance(sub, str) or not sub or len(sub) > 255:
            raise SocialLoginError("identity provider profile invalid")
        if id_token:
            await self._check_id_token(id_token, expected_sub=sub, expected_nonce=nonce)
        raw_email = data.get("email")
        email = raw_email.strip().lower() if isinstance(raw_email, str) else None
        if email and ("@" not in email or len(email) > 320):
            email = None
        raw_verified = data.get("email_verified")
        verified = raw_verified is True or (isinstance(raw_verified, str) and raw_verified.lower() == "true")
        return OIDCProfile(provider=self.provider, provider_sub=sub, email=email, email_verified=verified)

    async def aclose(self) -> None:
        await self._client.aclose()
