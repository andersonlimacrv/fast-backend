"""CurrentTenant: JWT claim validated against Postgres membership (never trusted alone)."""

from dataclasses import dataclass

from fastapi import Depends, Request

from app.core.errors import OrganizationAccessDeniedError
from app.modules.identity.public import Principal, current_principal
from app.modules.organization.public import assert_membership, list_user_orgs


@dataclass(frozen=True)
class TenantContext:
    tenant_id: str
    role: str


def _org_service(request: Request):
    return request.app.state.org_service


async def current_tenant(request: Request, principal: Principal = Depends(current_principal)) -> TenantContext:
    """Resolve tenant: JWT `active_org_id` validated against Postgres membership.

    `single` mode without a claim falls back to the caller's sole org; row mode
    (or ambiguity) denies.
    """
    settings = request.app.state.settings
    service = _org_service(request)
    org_id = principal.active_org_id
    if org_id is not None:
        membership = await assert_membership(service, user_id=principal.user_id, org_id=org_id)
        return TenantContext(tenant_id=org_id, role=membership.role)
    if settings.tenancy_mode == "single":
        pairs = await list_user_orgs(service, user_id=principal.user_id)
        if len(pairs) == 1:
            return TenantContext(tenant_id=pairs[0].organization.id, role=pairs[0].role)
    raise OrganizationAccessDeniedError("access denied")
