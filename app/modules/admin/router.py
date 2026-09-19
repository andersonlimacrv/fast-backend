"""Admin routes: named privileged actions (never generic CRUD on flags)."""

from fastapi import APIRouter, Depends, Request

from app.core.contracts.audit import audit_request
from app.infrastructure.security.client_ip import client_ip_from_request
from app.infrastructure.security.rate_limit import enforce_global_rate_limit
from app.modules.admin.dependencies import AdminContext, assert_audit_available, current_root, current_staff
from app.modules.admin.schemas import (
    AdminAuditRead,
    AdminOrgRead,
    AdminOverview,
    AdminUserCreate,
    AdminUserRead,
    MembershipSet,
    ReasonedBody,
    StatusAccepted,
)


async def _global_rate_limit(request: Request) -> None:
    """Count every request against the per-IP global budget BEFORE auth (anti-scrape)."""
    await enforce_global_rate_limit(request)


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(_global_rate_limit)])


def _service(request: Request):
    return request.app.state.admin_service


@router.get("/overview", response_model=AdminOverview)
async def overview(request: Request, ctx: AdminContext = Depends(current_staff)) -> AdminOverview:
    data = await _service(request).overview(ctx=ctx)
    return AdminOverview(**data)


@router.get("/users", response_model=list[AdminUserRead])
async def list_users(
    request: Request, ctx: AdminContext = Depends(current_staff), limit: int = 100, offset: int = 0
) -> list[AdminUserRead]:
    rows = await _service(request).list_all_users(ctx=ctx, limit=limit, offset=offset)
    return [AdminUserRead.model_validate(r) for r in rows]


@router.get("/users/{user_id}", response_model=AdminUserRead)
async def get_user(request: Request, user_id: str, ctx: AdminContext = Depends(current_staff)) -> AdminUserRead:
    return AdminUserRead.model_validate(await _service(request).get_user(ctx=ctx, user_id=user_id))


@router.post("/users", response_model=AdminUserRead, status_code=201)
async def create_user(payload: AdminUserCreate, request: Request, ctx: AdminContext = Depends(current_staff)):
    assert_audit_available(request)
    user = await _service(request).create_user(
        ctx=ctx, email=str(payload.email), password=payload.password, reason=payload.reason
    )
    await audit_request(
        request,
        action="admin.user_create",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user.id,
        metadata={"reason": payload.reason, "success": True, "email": str(payload.email)},
    )
    return AdminUserRead.model_validate(user)


@router.post("/users/{user_id}/disable", response_model=AdminUserRead)
async def disable_user(payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_staff)):
    assert_audit_available(request)
    user = await _service(request).set_user_active(ctx=ctx, user_id=user_id, active=False, reason=payload.reason)
    await audit_request(
        request,
        action="admin.user_disable",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return AdminUserRead.model_validate(user)


@router.post("/users/{user_id}/enable", response_model=AdminUserRead)
async def enable_user(payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_staff)):
    assert_audit_available(request)
    user = await _service(request).set_user_active(ctx=ctx, user_id=user_id, active=True, reason=payload.reason)
    await audit_request(
        request,
        action="admin.user_enable",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return AdminUserRead.model_validate(user)


@router.post("/users/{user_id}/revoke-sessions", response_model=StatusAccepted)
async def revoke_sessions(payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_staff)):
    assert_audit_available(request)
    await _service(request).revoke_sessions(ctx=ctx, user_id=user_id, reason=payload.reason)
    await audit_request(
        request,
        action="admin.sessions_revoked",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return StatusAccepted()


@router.post("/users/{user_id}/force-password-reset", response_model=StatusAccepted)
async def force_password_reset(
    payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_staff)
):
    """Privileged recovery without ever returning the secret (change B)."""
    assert_audit_available(request)
    hops: int = request.app.state.settings.trusted_proxy_hops
    ip = client_ip_from_request(request, hops)
    await _service(request).force_password_reset(ctx=ctx, user_id=user_id, reason=payload.reason, ip=ip)
    await audit_request(
        request,
        action="admin.password_reset_forced",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return StatusAccepted()


@router.post("/staff/{user_id}/grant", response_model=AdminUserRead)
async def grant_staff(payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_root)):
    assert_audit_available(request)
    user = await _service(request).grant_staff(ctx=ctx, user_id=user_id, reason=payload.reason)
    await audit_request(
        request,
        action="admin.staff_granted",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return AdminUserRead.model_validate(user)


@router.post("/staff/{user_id}/revoke", response_model=AdminUserRead)
async def revoke_staff(payload: ReasonedBody, request: Request, user_id: str, ctx: AdminContext = Depends(current_root)):
    assert_audit_available(request)
    user = await _service(request).revoke_staff(ctx=ctx, user_id=user_id, reason=payload.reason)
    await audit_request(
        request,
        action="admin.staff_revoked",
        actor_user_id=ctx.user_id,
        resource_type="user",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return AdminUserRead.model_validate(user)


@router.get("/organizations", response_model=list[AdminOrgRead])
async def list_organizations(
    request: Request, ctx: AdminContext = Depends(current_staff), limit: int = 100, offset: int = 0
) -> list[AdminOrgRead]:
    rows = await _service(request).list_all_organizations(ctx=ctx, limit=limit, offset=offset)
    return [AdminOrgRead.model_validate(r) for r in rows]


@router.post("/memberships", response_model=StatusAccepted, status_code=201)
async def set_membership(payload: MembershipSet, request: Request, ctx: AdminContext = Depends(current_staff)):
    assert_audit_available(request)
    await _service(request).set_membership(
        ctx=ctx, org_id=payload.org_id, user_id=payload.user_id, role=payload.role, reason=payload.reason
    )
    await audit_request(
        request,
        action="admin.membership_set",
        actor_user_id=ctx.user_id,
        tenant_id=payload.org_id,
        resource_type="membership",
        resource_id=payload.user_id,
        metadata={"reason": payload.reason, "success": True, "role": payload.role},
    )
    return StatusAccepted()


@router.delete("/memberships/{org_id}/{user_id}", response_model=StatusAccepted)
async def remove_membership(
    org_id: str, user_id: str, payload: ReasonedBody, request: Request, ctx: AdminContext = Depends(current_staff)
):
    assert_audit_available(request)
    await _service(request).remove_membership(ctx=ctx, org_id=org_id, user_id=user_id, reason=payload.reason)
    await audit_request(
        request,
        action="admin.membership_removed",
        actor_user_id=ctx.user_id,
        tenant_id=org_id,
        resource_type="membership",
        resource_id=user_id,
        metadata={"reason": payload.reason, "success": True},
    )
    return StatusAccepted()


@router.get("/audit", response_model=list[AdminAuditRead])
async def global_audit(request: Request, ctx: AdminContext = Depends(current_root), limit: int = 100) -> list[AdminAuditRead]:
    rows = await _service(request).recent_audit(ctx=ctx, limit=limit)
    return [AdminAuditRead.model_validate(r) for r in rows]
