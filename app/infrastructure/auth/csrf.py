"""CSRF synchronizer-token check for cookie-authenticated mutations (change auth-cookies-http-only).

Rule (design.md decision 4): when the credential arrived via cookie (ambient —
the browser attaches it without JS), state-changing requests must also carry
the non-`HttpOnly` `csrf_token` cookie value in the `X-CSRF-Token` header. A
cross-site attacker can trigger cookie-attached requests but cannot read the
cookie value, so they cannot echo it. `Origin` alone is intentionally NOT the
defense (not every client sends it); `SameSite=Lax` is the outer layer, this
token is the inner one.

Scope:

- Only cookie-authenticated requests are checked: bearer-in-header is not
  ambient, so header flows never need the token (transition stays green).
- Only unsafe methods (`POST/PUT/PATCH/DELETE`): safe methods (`GET/HEAD/
  OPTIONS/TRACE`) are exempt — reading `/auth/me` via cookie needs no token.
- Fail-closed: missing/empty/mismatched cookie or header raises `CsrfError`
  (→ 403). Sessions predating the flag have no CSRF cookie: they re-login
  (login mints the trio); no legacy bypass.

Duck-typed on purpose (no fastapi import, like `core/contracts/audit.client_ip`):
pass the real `Request`; unit tests pass plain dicts/objects.
"""

from __future__ import annotations

import hmac
from collections.abc import Mapping
from typing import Any

from app.core.errors import CsrfError
from app.infrastructure.auth.cookies import CSRF_COOKIE_NAME, CSRF_HEADER_NAME

SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})


def _headers_lower(headers: Any) -> dict[str, str]:
    try:
        items = headers.items()
    except AttributeError:
        return {}
    lowered: dict[str, str] = {}
    for key, value in items:
        lowered[str(key).lower()] = str(value)
    return lowered


def csrf_valid(*, method: str, cookies: Mapping[str, str] | None, headers: Any) -> bool:
    """Pure check: True when no token is required or when header echoes the cookie."""
    if method.upper() in SAFE_METHODS:
        return True
    cookie_token = (cookies or {}).get(CSRF_COOKIE_NAME, "")
    header_token = _headers_lower(headers).get(CSRF_HEADER_NAME, "")
    if not cookie_token or not header_token:
        return False
    return hmac.compare_digest(cookie_token, header_token)


def assert_csrf(request: Any) -> None:
    """Enforce the synchronizer token for a cookie-authenticated mutation (or raise `CsrfError`)."""
    method = str(getattr(request, "method", "") or "")
    cookies = getattr(request, "cookies", None)
    headers = getattr(request, "headers", None)
    if not csrf_valid(method=method, cookies=cookies, headers=headers):
        raise CsrfError("csrf validation failed")
