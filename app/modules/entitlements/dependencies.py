"""Entitlement dependencies (gates). Routes live in `router.py`, schemas in `schemas.py`."""

from fastapi import Depends, Request

from app.core.errors import OrganizationAccessDeniedError
from app.modules.tenancy.public import TenantContext, current_tenant, require_role

_ADMIN = require_role("admin")


async def _scoped_admin(org_id: str, request: Request, tenant: TenantContext = Depends(_ADMIN)) -> TenantContext:
    """Admin of the tenant AND path org must equal the tenant (no cross-org management)."""
    if tenant.tenant_id != org_id:
        raise OrganizationAccessDeniedError("access denied")
    return tenant


async def require_entitlement(key: str, *, usage: int = 0):
    """Dependency factory: 403 unless the tenant's org is entitled.

    Static usage for simple gates; quota checks needing a transaction use
    `EntitlementService.require` directly in the service layer.
    """

    async def _dep(request: Request, tenant: TenantContext = Depends(current_tenant)):
        service = request.app.state.entitlement_service
        return await service.require(org_id=tenant.tenant_id, key=key, usage=usage)

    return _dep


async def require_projects_access(request: Request, tenant: TenantContext = Depends(current_tenant)):
    service = request.app.state.entitlement_service
    return await service.require(org_id=tenant.tenant_id, key="projects.access")
