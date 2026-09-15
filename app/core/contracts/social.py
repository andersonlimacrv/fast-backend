"""Social login provider port (change C, contract only, no active provider).

Future activation adds an adapter in `infrastructure/` implementing this
Protocol plus `/auth/social/*` routes with `state`+PKCE. Modules never import
OAuth/HTTP clients directly (`no-provider-imports-in-modules`).
"""

from typing import Protocol


class SocialProfile(Protocol):
    provider: str
    provider_sub: str
    email: str | None


class SocialProvider(Protocol):
    """OIDC/OAuth2 provider (Google, GitHub, ...). Inert until a change wires it."""

    provider: str

    def authorize_url(self, *, state: str, code_challenge: str, redirect_uri: str) -> str:
        """Build the provider authorization URL (PKCE S256)."""
        ...

    async def exchange_code(self, *, code: str, code_verifier: str, redirect_uri: str) -> dict:
        """Exchange an authorization code for provider tokens (raises on failure)."""
        ...

    async def get_profile(self, *, access_token: str) -> SocialProfile:
        """Fetch the normalized profile for linking by canonical email."""
        ...
