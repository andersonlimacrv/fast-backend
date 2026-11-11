"""Generic OIDC adapter (change login-social-redesign).

Implements `core/contracts/social.SocialProvider` using Authorization Code +
PKCE S256. Discovery is cached per process; the issuer from discovery must
match `OIDC_ISSUER` exactly (OIDC Core §4.3). Modules never import this
module directly's provider libraries — they receive it as a Protocol, so
`no-provider-imports-in-modules` stays intact.

Identity proof: the token endpoint is authenticated with the client secret and
PKCE, and the UserInfo endpoint is called with the resulting access token. The
`id_token` is used as a consistency check (`iss`/`aud`/`sub`), not as the
signature-verified assertion; JWKS/RS256 validation is documented as future
hardening in the change design (ADR 0014).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
import jwt as pyjwt

from app.core.errors import SocialLoginError
from app.core.settings import Settings


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
        for key in ("authorization_endpoint", "token_endpoint", "userinfo_endpoint"):
            if not isinstance(config.get(key), str) or not config[key]:
                raise SocialLoginError("identity provider configuration incomplete")
        self._configuration = config
        return config

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

    def _check_id_token(self, id_token: str, *, expected_sub: str, expected_nonce: str | None) -> None:
        """Consistency check only (unverified decode; see module docstring)."""
        try:
            claims = pyjwt.decode(id_token, options={"verify_signature": False, "verify_aud": False, "verify_exp": False})
        except pyjwt.PyJWTError as exc:
            raise SocialLoginError("identity provider token invalid") from exc
        issuer = str(claims.get("iss", "")).rstrip("/")
        if issuer != self._settings.oidc_issuer.rstrip("/"):
            raise SocialLoginError("identity provider token invalid")
        aud = claims.get("aud")
        audiences = aud if isinstance(aud, list) else [aud]
        if self._settings.oidc_client_id not in audiences:
            raise SocialLoginError("identity provider token invalid")
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
            self._check_id_token(id_token, expected_sub=sub, expected_nonce=nonce)
        raw_email = data.get("email")
        email = raw_email.strip().lower() if isinstance(raw_email, str) else None
        if email and ("@" not in email or len(email) > 320):
            email = None
        raw_verified = data.get("email_verified")
        verified = raw_verified is True or (isinstance(raw_verified, str) and raw_verified.lower() == "true")
        return OIDCProfile(provider=self.provider, provider_sub=sub, email=email, email_verified=verified)

    async def aclose(self) -> None:
        await self._client.aclose()
