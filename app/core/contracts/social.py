"""Social login provider port (change login-social-redesign activates it).

Modules depend only on this Protocol; the concrete OIDC adapter lives in
`infrastructure/auth/oidc.py` (`no-provider-imports-in-modules`). The flow is
Authorization Code + PKCE S256 + `state` + `nonce`; the backend stores the
verifier and exchanges a one-time grant with the SPA, never tokens in URLs.
"""

from typing import Any, Protocol


class SocialProfile(Protocol):
    """Normalized profile returned by the provider's UserInfo endpoint."""

    @property
    def provider(self) -> str: ...
    @property
    def provider_sub(self) -> str: ...
    @property
    def email(self) -> str | None: ...
    @property
    def email_verified(self) -> bool: ...


class SocialProvider(Protocol):
    """OIDC provider (Google, Keycloak, Auth0, Entra ID, ...)."""

    @property
    def provider(self) -> str: ...

    def authorize_url(self, *, state: str, code_challenge: str, redirect_uri: str, nonce: str) -> str:
        """Build the provider authorization URL (PKCE S256 + nonce)."""
        ...

    async def discover(self) -> None:
        """Warm discovery (issuer metadata) before building the authorize URL."""
        ...

    async def exchange_code(self, *, code: str, code_verifier: str, redirect_uri: str) -> dict[str, Any]:
        """Exchange an authorization code for provider tokens (raises on failure)."""
        ...

    async def get_profile(self, *, access_token: str, id_token: str | None = None, nonce: str | None = None) -> SocialProfile:
        """Fetch the normalized profile; `id_token`/`nonce` are consistency checks."""
        ...
