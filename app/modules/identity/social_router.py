"""Social login routes (change login-social-redesign).

Included by `main.py` ONLY when `SOCIAL_LOGIN_ENABLED=true`, so with the flag
off no `/auth/social*` path exists (preserves the `social-contract` spec).

Browser flow: authorize (302 to IdP) → callback (302 back to the SPA with a
one-time grant) → SPA exchanges the grant for the standard token pair. Tokens
never travel in a URL.
"""

from __future__ import annotations

import secrets
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse

from app.core.contracts.audit import audit_request
from app.core.errors import SocialEmailUnverifiedError, SocialLoginError
from app.core.settings import Settings
from app.infrastructure.auth.cookies import new_csrf_token, set_session_cookies
from app.infrastructure.security.client_ip import client_ip_from_request
from app.infrastructure.security.rate_limit import enforce_global_rate_limit
from app.modules.identity.schemas import SocialExchangeRequest, TokenPair

OIDC_STATE_COOKIE = "oidc_state"  # noqa: S105 (cookie name, not a secret)
OIDC_STATE_COOKIE_PATH = "/auth/social"


async def _global_rate_limit(request: Request) -> None:
    """Same per-IP ceiling as the rest of `/auth` (anti-abuse)."""
    await enforce_global_rate_limit(request)


router = APIRouter(prefix="/auth/social", tags=["auth"], dependencies=[Depends(_global_rate_limit)])


def _settings(request: Request) -> Settings:
    settings = request.app.state.settings
    assert isinstance(settings, Settings)
    return settings


def _service(request: Request):
    return request.app.state.social_service


def _client_ip(request: Request) -> str:
    return client_ip_from_request(request, _settings(request).trusted_proxy_hops)


def _frontend(settings: Settings, path: str, params: dict[str, str] | None = None) -> str:
    base = settings.frontend_url.rstrip("/")
    query = ""
    if params:
        query = "?" + "&".join(f"{key}={quote(value)}" for key, value in params.items())
    return f"{base}{path}{query}"


def _error_redirect(settings: Settings, code: str) -> RedirectResponse:
    return RedirectResponse(_frontend(settings, "/login", {"social_error": code}), status_code=302)


def _state_cookie_secure(settings: Settings) -> bool:
    # The binding cookie travels on the same redirect URI as the callback;
    # local http dev must not mark it Secure or the browser drops it.
    return settings.oidc_redirect_uri.startswith("https://")


def _set_state_cookie(response: Response, settings: Settings, state: str) -> None:
    response.set_cookie(
        OIDC_STATE_COOKIE,
        state,
        httponly=True,
        secure=_state_cookie_secure(settings),
        samesite="lax",
        path=OIDC_STATE_COOKIE_PATH,
        max_age=settings.oidc_state_ttl_seconds,
    )


def _clear_state_cookie(response: Response) -> None:
    response.delete_cookie(OIDC_STATE_COOKIE, path=OIDC_STATE_COOKIE_PATH)


@router.get("/{provider}/authorize")
async def authorize(provider: str, request: Request) -> RedirectResponse:
    settings = _settings(request)
    service = _service(request)
    if service is None or provider != settings.oidc_provider:
        raise HTTPException(status_code=404, detail="unknown provider")
    try:
        url, state = await service.begin()
    except SocialLoginError:
        return _error_redirect(settings, "provider")
    response = RedirectResponse(url, status_code=302)
    _set_state_cookie(response, settings, state)
    return response


@router.get("/{provider}/callback")
async def callback(
    provider: str,
    request: Request,
    code: str = "",
    state: str = "",
    error: str = "",
) -> RedirectResponse:
    settings = _settings(request)
    service = _service(request)
    if service is None or provider != settings.oidc_provider:
        return _error_redirect(settings, "disabled")
    cookie_state = request.cookies.get(OIDC_STATE_COOKIE, "")
    if error:
        response = _error_redirect(settings, "cancelled" if error == "access_denied" else "provider")
        _clear_state_cookie(response)
        return response
    if not code or not state or not cookie_state or not secrets.compare_digest(state, cookie_state):
        # Missing/invalid state: never consume the code, never mint a session.
        response = _error_redirect(settings, "state")
        _clear_state_cookie(response)
        return response
    try:
        grant = await service.complete(code=code, state=state)
    except SocialEmailUnverifiedError:
        response = _error_redirect(settings, "email")
    except SocialLoginError:
        response = _error_redirect(settings, "provider")
    else:
        response = RedirectResponse(_frontend(settings, "/auth/social/callback", {"code": grant}), status_code=302)
    _clear_state_cookie(response)
    return response


@router.post("/exchange", response_model=TokenPair)
async def exchange(payload: SocialExchangeRequest, request: Request, response: Response) -> TokenPair:
    settings = _settings(request)
    service = _service(request)
    if service is None:
        raise HTTPException(status_code=404, detail="social login disabled")
    result = await service.exchange(
        grant=payload.code,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await audit_request(
        request,
        action="auth.login",
        actor_user_id=result.user.id,
        resource_type="user",
        metadata={"method": "oidc", "provider": settings.oidc_provider},
    )
    if settings.auth_cookie_enabled:
        csrf_token = new_csrf_token()
        set_session_cookies(
            response, settings, access_token=result.access_token, refresh_token=result.refresh_token, csrf_token=csrf_token
        )
    return TokenPair(access_token=result.access_token, refresh_token=result.refresh_token)
