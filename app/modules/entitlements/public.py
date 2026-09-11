"""Public API of the entitlements module. Other modules may import ONLY from here."""

from app.modules.entitlements.dependencies import require_entitlement, require_projects_access
from app.modules.entitlements.service import (
    DEFAULT_ENTITLEMENTS,
    PROJECTS_ACCESS,
    PROJECTS_MAX,
    EntitlementService,
    ResolvedEntitlement,
)

__all__ = [
    "DEFAULT_ENTITLEMENTS",
    "PROJECTS_ACCESS",
    "PROJECTS_MAX",
    "EntitlementService",
    "ResolvedEntitlement",
    "require_entitlement",
    "require_projects_access",
]
