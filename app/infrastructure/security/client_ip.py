"""Real client IP behind trusted proxies (fail-closed).

Routers consume the helper from here (single rule, no per-router copies).
The parsing itself lives in `app.core.contracts.audit`: core cannot import
infrastructure (`core-independence`), while infrastructure may import core —
so this module re-exports the canonical implementation instead of copying it
(change proxy-hops-trusted).
"""

from typing import Any

from app.core.contracts.audit import client_ip, real_client_ip

__all__ = ["client_ip", "client_ip_from_request", "real_client_ip"]


def client_ip_from_request(request: Any, trusted_proxy_hops: int) -> str:
    """Real client IP for `request`, honoring at most `trusted_proxy_hops` of `X-Forwarded-For`.

    Hops are explicit (never read from `request.app.state` here): callers pass
    `request.app.state.settings.trusted_proxy_hops`. `0` ignores the header.
    """
    return client_ip(request, trusted_proxy_hops)
