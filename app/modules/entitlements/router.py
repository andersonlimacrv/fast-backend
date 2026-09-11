"""Grants routes (admin+). Dependencies live in `dependencies.py`."""

from fastapi import APIRouter, Depends, Request

from app.modules.entitlements.dependencies import _scoped_admin
from app.modules.entitlements.schemas import GrantRead, GrantUpsert
from app.modules.tenancy.public import TenantContext

router = APIRouter(prefix="/organizations/{org_id}/grants", tags=["entitlements"])


@router.get("", response_model=list[GrantRead])
async def list_grants(
    org_id: str,
    request: Request,
    _tenant: TenantContext = Depends(_scoped_admin),
) -> list[GrantRead]:
    service = request.app.state.entitlement_service
    return [GrantRead.model_validate(g) for g in await service.list_resolved(org_id=org_id)]


@router.put("", response_model=GrantRead)
async def upsert_grant(
    org_id: str,
    payload: GrantUpsert,
    request: Request,
    _tenant: TenantContext = Depends(_scoped_admin),
) -> GrantRead:
    service = request.app.state.entitlement_service
    grant = await service.upsert(org_id=org_id, key=payload.key, limit=payload.limit, enabled=payload.enabled)
    return GrantRead.model_validate(grant)
