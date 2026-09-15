"""Public API of the organization module. Other modules may import ONLY from here."""

from app.modules.organization.models import Membership, Organization, role_at_least
from app.modules.organization.service import OrganizationService

__all__ = [
    "Membership",
    "Organization",
    "OrganizationService",
    "admin_remove_membership",
    "admin_set_membership",
    "assert_membership",
    "count_organizations",
    "get_membership",
    "list_organizations",
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


async def count_organizations(service: OrganizationService) -> int:
    """Global org count (admin control plane only)."""
    return await service.count_organizations()


async def list_organizations(service: OrganizationService, *, limit: int = 100, offset: int = 0):
    """Global org listing (admin control plane only)."""
    return await service.list_organizations(limit=limit, offset=offset)


async def admin_set_membership(service: OrganizationService, *, org_id: str, user_id: str, role: str):
    """Cross-org membership write (admin control plane only)."""
    return await service.admin_set_membership(org_id=org_id, user_id=user_id, role=role)


async def admin_remove_membership(service: OrganizationService, *, org_id: str, user_id: str) -> None:
    """Cross-org membership removal (admin control plane only)."""
    await service.admin_remove_membership(org_id=org_id, user_id=user_id)
