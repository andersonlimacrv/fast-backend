"""Identity HTTP routes. Translates domain errors (interfaces maps them to status)."""

from fastapi import APIRouter, Depends, Request

from app.infrastructure.auth.jwt import mint_access_token
from app.modules.identity.dependencies import Principal, current_principal
from app.modules.identity.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    SwitchOrganizationRequest,
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


@router.post("/change-password", status_code=204)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    me: Principal = Depends(current_principal),
) -> None:
    await _service(request).change_password(
        user_id=me.user_id, current_password=payload.current_password, new_password=payload.new_password
    )


@router.get("/me", response_model=UserRead)
async def me(request: Request, principal: Principal = Depends(current_principal)) -> UserRead:
    user = await _service(request).get_user(user_id=principal.user_id)
    assert user is not None
    return UserRead.model_validate(user)


@router.post("/switch-organization", response_model=TokenPair)
async def switch_organization(
    payload: SwitchOrganizationRequest,
    request: Request,
    me: Principal = Depends(current_principal),
) -> TokenPair:
    """Mint a new access token with the requested `active_org_id`.

    Fase 1: context only. Membership enforcement arrives in Fase 3 (tenancy),
    which will deny orgs the user does not belong to.
    """
    service = _service(request)
    user = await service.get_user(user_id=me.user_id)
    assert user is not None
    access_token = mint_access_token(settings=request.app.state.settings, user_id=user.id, active_org_id=payload.org_id)
    return TokenPair(access_token=access_token, refresh_token="")
