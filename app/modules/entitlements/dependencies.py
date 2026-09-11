"""Entitlement dependencies (gates). Routes live in `router.py`, schemas in `schemas.py`."""

from fastapi import Depends, Request

from app.modules.tenancy.public import TenantContext, current_tenant, require_org_admin

_scoped_admin = require_org_admin()


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
