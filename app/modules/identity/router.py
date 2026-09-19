"""Identity HTTP routes. Translates domain errors (interfaces maps them to status)."""

from fastapi import APIRouter, Depends, Request, Response

from app.core.contracts.audit import audit_request
from app.infrastructure.auth.cookies import (
    REFRESH_COOKIE_NAME,
    clear_session_cookies,
    new_csrf_token,
    set_rotated_cookies,
    set_session_cookies,
)
from app.infrastructure.auth.csrf import assert_csrf
from app.infrastructure.security.client_ip import client_ip_from_request
from app.infrastructure.security.rate_limit import enforce_global_rate_limit
from app.modules.identity.dependencies import Principal, current_principal
from app.modules.identity.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    UserRead,
)


async def _global_rate_limit(request: Request) -> None:
    """Count every request against the per-IP global budget BEFORE auth.

    Router-level dependencies run before endpoint ones, so anonymous floods
    fill the bucket instead of dying at 401 uncounted (anti-scrape).
    """
    await enforce_global_rate_limit(request)


router = APIRouter(prefix="/auth", tags=["auth"], dependencies=[Depends(_global_rate_limit)])


def _service(request: Request):
    return request.app.state.auth_service


def _client_ip(request: Request) -> str:
    hops: int = request.app.state.settings.trusted_proxy_hops
    return client_ip_from_request(request, hops)


@router.post("/register", response_model=UserRead, status_code=201)
async def register(payload: RegisterRequest, request: Request) -> UserRead:
    user = await _service(request).register(email=str(payload.email), password=payload.password, ip=_client_ip(request))
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, request: Request, response: Response) -> TokenPair:
    result = await _service(request).login(
        email=str(payload.email),
        password=payload.password,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await audit_request(request, action="auth.login", actor_user_id=result.user.id, resource_type="user")
    settings = request.app.state.settings
    if settings.auth_cookie_enabled:
        # Full trio: HttpOnly access+refresh plus the JS-readable CSRF token.
        # Body tokens stay (dual transition; removal is a follow-up change).
        csrf_token = new_csrf_token()
        set_session_cookies(
            response, settings, access_token=result.access_token, refresh_token=result.refresh_token, csrf_token=csrf_token
        )
    return TokenPair(access_token=result.access_token, refresh_token=result.refresh_token)


def _presented_refresh_token(request: Request, body_token: str) -> tuple[str, bool]:
    """Resolve the refresh credential: explicit body wins, else the HttpOnly cookie (flag-gated).

    Returns (token, from_cookie). Empty body + no/flag-off cookie yields ("", False),
    which the service rejects as invalid (401) — same as an unknown token.
    """
    if body_token:
        return body_token, False
    settings = request.app.state.settings
    if settings.auth_cookie_enabled:
        cookie_token = request.cookies.get(REFRESH_COOKIE_NAME, "")
        if cookie_token:
            return cookie_token, True
    return "", False


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, request: Request, response: Response) -> TokenPair:
    presented, from_cookie = _presented_refresh_token(request, payload.refresh_token)
    settings = request.app.state.settings
    if from_cookie and settings.csrf_enabled:
        # Cookie-sourced rotation is a mutation: synchronizer token required (fail-closed first).
        assert_csrf(request)
    result = await _service(request).refresh(
        refresh_token=presented,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    if settings.auth_cookie_enabled:
        # Re-emit access+refresh; CSRF stays stable (see cookies.py).
        set_rotated_cookies(response, settings, access_token=result.access_token, refresh_token=result.refresh_token)
    return TokenPair(access_token=result.access_token, refresh_token=result.refresh_token)


@router.post("/logout", status_code=204)
async def logout(payload: LogoutRequest, request: Request, response: Response) -> None:
    presented, from_cookie = _presented_refresh_token(request, payload.refresh_token)
    settings = request.app.state.settings
    if from_cookie and settings.csrf_enabled:
        assert_csrf(request)
    # Idempotent single-token revoke: unknown/empty token revokes nothing (still 204).
    await _service(request).logout(refresh_token=presented)
    if settings.auth_cookie_enabled:
        clear_session_cookies(response, settings)


@router.post("/logout-everywhere", status_code=204)
async def logout_everywhere(request: Request, me: Principal = Depends(current_principal)) -> None:
    await _service(request).logout_everywhere(user_id=me.user_id)
    await audit_request(request, action="auth.logout_global", actor_user_id=me.user_id, resource_type="user")


@router.post("/change-password", status_code=204)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    me: Principal = Depends(current_principal),
) -> None:
    await _service(request).change_password(
        user_id=me.user_id, current_password=payload.current_password, new_password=payload.new_password
    )
    await audit_request(request, action="auth.password_change", actor_user_id=me.user_id, resource_type="user")


@router.get("/me", response_model=UserRead)
async def me(request: Request, principal: Principal = Depends(current_principal)) -> UserRead:
    user = await _service(request).get_user(user_id=principal.user_id)
    assert user is not None
    return UserRead.model_validate(user)


@router.post("/password/forgot", status_code=202)
async def forgot_password(payload: ForgotPasswordRequest, request: Request) -> dict[str, str]:
    """Always 202 generic (anti-enumeration); audit only when a user exists."""
    actor = await _service(request).request_reset(email=str(payload.email), ip=_client_ip(request))
    if actor is not None:
        await audit_request(request, action="auth.password_reset_request", actor_user_id=actor, resource_type="user")
    return {"status": "accepted"}


@router.post("/password/reset", status_code=204)
async def reset_password(payload: ResetPasswordRequest, request: Request) -> None:
    await _service(request).reset_password(token=payload.token, new_password=payload.new_password, ip=_client_ip(request))
    await audit_request(request, action="auth.password_reset_confirm", resource_type="user")
