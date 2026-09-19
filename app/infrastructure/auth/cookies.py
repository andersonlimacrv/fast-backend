"""HttpOnly session cookies for browser SPAs (change auth-cookies-http-only).

Transport only: login/refresh/switch *emit* cookies, `CurrentPrincipal` *reads*
them, logout *clears* them. Token lifecycle (rotation, reuse, revocation) is
untouched — it still lives in `refresh_tokens.py` + `AuthenticationService`.

Layout (design.md decisions):

- `access_token`: `HttpOnly`, `Path=/`, `Max-Age` = access TTL. Travels on
  every API call, never readable by JS.
- `refresh_token`: `HttpOnly`, `Path=/auth` (only travels to `/auth/*`,
  shrinking exposure), `Max-Age` = refresh TTL.
- `csrf_token`: readable by JS (`HttpOnly=False`, the synchronizer token the
  SPA echoes in `X-CSRF-Token`), `Path=/`, `Max-Age` = refresh TTL. Minted at
  login, stable across refresh/switch (rotating it per refresh would race
  concurrent tabs holding the previous value), cleared at logout.
- `SameSite` from settings (`lax` default: top-level navigation keeps working;
  `strict` opt-in). Never `none` (rejected in `Settings`).
- `Secure` from settings: on wherever there is HTTPS (staging/prod via
  Caddy); local dev over plain http sets `AUTH_COOKIE_SECURE=false`.

Transition: everything here is inert while `AUTH_COOKIE_ENABLED=false`
(default) — routers only call these helpers behind the flag, and
`CurrentPrincipal` ignores cookies. Header-only removal is a dedicated
follow-up change (no removal here); rollback = flag off. No DB migration:
cookies are transport, `refresh_tokens` is unchanged.
"""

from __future__ import annotations

import secrets
from typing import Any

from app.core.settings import Settings

ACCESS_COOKIE_NAME = "access_token"  # noqa: S105 (cookie name, not a secret)
REFRESH_COOKIE_NAME = "refresh_token"  # noqa: S105 (cookie name, not a secret)
CSRF_COOKIE_NAME = "csrf_token"  # noqa: S105 (cookie name, not a secret)
CSRF_HEADER_NAME = "x-csrf-token"

# Refresh cookie travels only to `/auth/*` (design.md decision 3).
REFRESH_COOKIE_PATH = "/auth"


def new_csrf_token() -> str:
    """Mint an opaque synchronizer token (compared with `hmac.compare_digest`)."""
    return secrets.token_urlsafe(32)


def access_cookie_max_age(settings: Settings) -> int:
    return settings.access_token_ttl_minutes * 60


def refresh_cookie_max_age(settings: Settings) -> int:
    return settings.refresh_token_ttl_days * 24 * 3600


def _base_kwargs(settings: Settings, *, httponly: bool, path: str, max_age: int) -> dict[str, Any]:
    kwargs: dict[str, Any] = {
        "httponly": httponly,
        "secure": settings.auth_cookie_secure,
        "samesite": settings.auth_cookie_samesite.lower(),
        "path": path,
        "max_age": max_age,
    }
    if settings.auth_cookie_domain.strip():
        kwargs["domain"] = settings.auth_cookie_domain.strip()
    return kwargs


def set_session_cookies(response: Any, settings: Settings, *, access_token: str, refresh_token: str, csrf_token: str) -> None:
    """Emit the full session trio (login). Duck-typed `response` (Starlette `set_cookie`)."""
    access_kwargs = _base_kwargs(settings, httponly=True, path="/", max_age=access_cookie_max_age(settings))
    refresh_kwargs = _base_kwargs(settings, httponly=True, path=REFRESH_COOKIE_PATH, max_age=refresh_cookie_max_age(settings))
    csrf_kwargs = _base_kwargs(settings, httponly=False, path="/", max_age=refresh_cookie_max_age(settings))
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, **access_kwargs)
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, **refresh_kwargs)
    response.set_cookie(CSRF_COOKIE_NAME, csrf_token, **csrf_kwargs)


def set_rotated_cookies(response: Any, settings: Settings, *, access_token: str, refresh_token: str) -> None:
    """Re-emit access + refresh after rotation (refresh). CSRF stays stable (see module docstring)."""
    access_kwargs = _base_kwargs(settings, httponly=True, path="/", max_age=access_cookie_max_age(settings))
    refresh_kwargs = _base_kwargs(settings, httponly=True, path=REFRESH_COOKIE_PATH, max_age=refresh_cookie_max_age(settings))
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, **access_kwargs)
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, **refresh_kwargs)


def set_access_cookie(response: Any, settings: Settings, *, access_token: str) -> None:
    """Re-emit only the access cookie (switch-organization keeps refresh + CSRF)."""
    access_kwargs = _base_kwargs(settings, httponly=True, path="/", max_age=access_cookie_max_age(settings))
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, **access_kwargs)


def clear_session_cookies(response: Any, settings: Settings) -> None:
    """Expire the trio (logout). Same names/paths/domain so the browser matches and deletes them."""
    expired = {"max_age": 0}
    access_kwargs = _base_kwargs(settings, httponly=True, path="/", max_age=0) | expired
    refresh_kwargs = _base_kwargs(settings, httponly=True, path=REFRESH_COOKIE_PATH, max_age=0) | expired
    csrf_kwargs = _base_kwargs(settings, httponly=False, path="/", max_age=0) | expired
    response.set_cookie(ACCESS_COOKIE_NAME, "", **access_kwargs)
    response.set_cookie(REFRESH_COOKIE_NAME, "", **refresh_kwargs)
    response.set_cookie(CSRF_COOKIE_NAME, "", **csrf_kwargs)
