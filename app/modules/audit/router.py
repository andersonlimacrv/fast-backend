"""Audit routes: admin-only trail reads (append-only, no writes here)."""

from fastapi import APIRouter, Depends, Request

from app.modules.audit.schemas import AuditRead
from app.modules.tenancy.public import TenantContext, require_org_admin

router = APIRouter(prefix="/organizations/{org_id}/audit", tags=["audit"])

_SCOPED_ADMIN = require_org_admin()


@router.get("", response_model=list[AuditRead])
async def list_audit(
    org_id: str,
    request: Request,
    _tenant: TenantContext = Depends(_SCOPED_ADMIN),
    limit: int = 100,
) -> list[AuditRead]:
    service = request.app.state.audit_service
    return [AuditRead.model_validate(r) for r in await service.list_for_org(org_id=org_id, limit=min(limit, 500))]
