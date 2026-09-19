"""Global per-IP rate-limit ceiling (change rate-limit-global).

Single rule, consumed by the identity + admin routers (explicit `await` at the
top of each endpoint, mirroring `assert_audit_available`). Counter semantics:
every sensitive request counts (check, then record) — unlike login/register
failure budgets — because mass creation with fresh emails never fails.

The client IP comes from the proxy-hops rule (`TRUSTED_PROXY_HOPS`, fail-closed):
spoofed `X-Forwarded-For` never buys a fresh bucket. Duck-typed on purpose (no
fastapi import, like `app.core.contracts.audit.client_ip`); routers pass the
real `Request`. Raises the generic `ThrottledError` (429 + `Retry-After` via
`interfaces/errors.py`); the body never reveals which limit fired.
"""

from typing import Any

from app.core.contracts.audit import client_ip


async def enforce_global_rate_limit(request: Any) -> None:
    """Consume one unit of the caller's global per-IP budget (or raise 429)."""
    state = request.app.state
    trusted_hops: int = getattr(getattr(state, "settings", None), "trusted_proxy_hops", 0) or 0
    ip = client_ip(request, trusted_hops)
    throttler = state.throttler
    await throttler.check_global(ip)
    await throttler.record_global(ip)
