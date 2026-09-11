"""ProjectService: tenant-scoped CRUD via TenantScopedRepository. No HTTPException."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.errors import ResourceNotFoundError
from app.modules.projects.models import Project
from app.modules.tenancy.public import SuperuserContext, TenantScopedRepository


class ProjectService:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._sessions = session_factory

    async def create(self, *, tenant_id: str, name: str) -> Project:
        async with self._sessions() as session:
            async with session.begin():
                repo = TenantScopedRepository(session, tenant_id)
                project = Project(org_id=tenant_id, name=name.strip())
                await repo.add(project)
            return project

    async def get(self, *, tenant_id: str, project_id: str) -> Project:
        async with self._sessions() as session:
            project = await TenantScopedRepository(session, tenant_id).get(Project, project_id)
            if project is None:
                raise ResourceNotFoundError("project not found")
            assert isinstance(project, Project)
            return project

    async def list(self, *, tenant_id: str) -> list[Project]:
        async with self._sessions() as session:
            return await TenantScopedRepository(session, tenant_id).list(Project)

    async def rename(self, *, tenant_id: str, project_id: str, name: str) -> Project:
        async with self._sessions() as session:
            async with session.begin():
                project = await TenantScopedRepository(session, tenant_id).get(Project, project_id)
                if project is None:
                    raise ResourceNotFoundError("project not found")
                assert isinstance(project, Project)
                project.name = name.strip()
            return project

    async def remove(self, *, tenant_id: str, project_id: str) -> bool:
        async with self._sessions() as session:
            async with session.begin():
                repo = TenantScopedRepository(session, tenant_id)
                project = await repo.get(Project, project_id)
                if project is None:
                    return False
                await repo.delete(project)
            return True

    async def get_any(self, *, project_id: str, superuser: SuperuserContext) -> Project | None:
        """Explicit cross-tenant read (support tooling)."""
        async with self._sessions() as session:
            repo = TenantScopedRepository.scoped_for_superuser(session, superuser)
            project = await repo.get(Project, project_id)
            assert project is None or isinstance(project, Project)
            return project
