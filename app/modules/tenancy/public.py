"""Public API of the tenancy module. Other modules may import ONLY from here."""

from fastapi import Depends, Request

from app.core.errors import OrganizationAccessDeniedError
from app.modules.organization.public import role_at_least
from app.modules.tenancy.dependencies import TenantContext, current_tenant
from app.modules.tenancy.repository import SuperuserContext, TenantScopedRepository

__all__ = [
    "SuperuserContext",
    "TenantContext",
    "TenantScopedRepository",
    "current_tenant",
    "require_org_admin",
    "require_role",
]


def require_role(minimum: str):
    """Dependency factory: 403 unless the tenant role ranks at or above minimum."""

    async def _dep(tenant: TenantContext = Depends(current_tenant)) -> TenantContext:
        if not role_at_least(tenant.role, minimum):
            raise OrganizationAccessDeniedError("access denied")
        return tenant

    return _dep


def require_org_admin():
    """Dependency factory for `/{org_id}`-scoped admin routes: admin of the
    tenant AND path org must equal the tenant (no cross-org management)."""

    _admin = require_role("admin")

    async def _dep(org_id: str, request: Request, tenant: TenantContext = Depends(_admin)) -> TenantContext:
        _ = request
        if tenant.tenant_id != org_id:
            raise OrganizationAccessDeniedError("access denied")
        return tenant

    return _dep
