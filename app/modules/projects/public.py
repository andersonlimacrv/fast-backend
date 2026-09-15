"""Public API of the projects module. Other modules may import ONLY from here."""

from app.modules.projects.service import ProjectService
from app.modules.tenancy.public import SuperuserContext

__all__ = ["ProjectService", "count_all_projects"]


async def count_all_projects(service: ProjectService, *, superuser: SuperuserContext) -> int:
    """Explicit cross-tenant count (admin control plane only)."""
    return await service.count_all(superuser=superuser)
