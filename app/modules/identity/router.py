"""Identity HTTP routes. Translates domain errors (interfaces maps them to status)."""

from fastapi import APIRouter, Depends, Request

from app.core.contracts.audit import audit_request
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

router = APIRouter(prefix="/auth", tags=["auth"])


def _service(request: Request):
    return request.app.state.auth_service


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=UserRead, status_code=201)
async def register(payload: RegisterRequest, request: Request) -> UserRead:
    user = await _service(request).register(email=str(payload.email), password=payload.password)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, request: Request) -> TokenPair:
    result = await _service(request).login(
        email=str(payload.email),
        password=payload.password,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    await audit_request(request, action="auth.login", actor_user_id=result.user.id, resource_type="user")
    return TokenPair(access_token=result.access_token, refresh_token=result.refresh_token)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, request: Request) -> TokenPair:
    result = await _service(request).refresh(
        refresh_token=payload.refresh_token,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return TokenPair(access_token=result.access_token, refresh_token=result.refresh_token)


@router.post("/logout", status_code=204)
async def logout(payload: LogoutRequest, request: Request) -> None:
    await _service(request).logout(refresh_token=payload.refresh_token)


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
