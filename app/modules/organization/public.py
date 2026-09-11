"""Public API of the organization module. Other modules may import ONLY from here."""

from app.modules.organization.models import Membership, Organization, role_at_least
from app.modules.organization.service import OrganizationService

__all__ = [
    "Membership",
    "Organization",
    "OrganizationService",
    "assert_membership",
    "get_membership",
    "list_user_orgs",
    "role_at_least",
]


async def get_membership(service: OrganizationService, *, user_id: str, org_id: str) -> Membership | None:
    """Deliberately exposed read for tenancy and future modules."""
    return await service.get_membership(user_id=user_id, org_id=org_id)


async def assert_membership(
    service: OrganizationService, *, user_id: str, org_id: str, minimum_role: str = "member"
) -> Membership:
    """Deliberately exposed enforcement; raises `OrganizationAccessDeniedError`."""
    return await service.require_membership(user_id=user_id, org_id=org_id, minimum_role=minimum_role)


async def list_user_orgs(service: OrganizationService, *, user_id: str):
    """Deliberately exposed listing for tenancy single-mode resolution."""
    return await service.list_user_orgs(user_id=user_id)
