"""Public API of the tenancy module. Other modules may import ONLY from here."""

from fastapi import Depends

from app.core.errors import OrganizationAccessDeniedError
from app.modules.organization.public import role_at_least
from app.modules.tenancy.dependencies import TenantContext, current_tenant
from app.modules.tenancy.repository import SuperuserContext, TenantScopedRepository

__all__ = [
    "SuperuserContext",
    "TenantContext",
    "TenantScopedRepository",
    "current_tenant",
    "require_role",
]


def require_role(minimum: str):
    """Dependency factory: 403 unless the tenant role ranks at or above minimum."""

    async def _dep(tenant: TenantContext = Depends(current_tenant)) -> TenantContext:
        if not role_at_least(tenant.role, minimum):
            raise OrganizationAccessDeniedError("access denied")
        return tenant

    return _dep
