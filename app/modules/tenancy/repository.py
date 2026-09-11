"""Tenant-scoped persistence. No default read path exists without a tenant."""

from dataclasses import dataclass

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True)
class SuperuserContext:
    """Explicit cross-tenant bypass. Never implicit, always visible at call site."""

    reason: str = "support"


class TenantScopedRepository:
    """Repository that cannot query without a tenant. Pass `SuperuserContext`
    explicitly to bypass (the bypass is then visible in code review)."""

    def __init__(
        self,
        session: AsyncSession,
        tenant_id: str | None,
        *,
        superuser: SuperuserContext | None = None,
        tenant_attr: str = "org_id",
    ) -> None:
        if tenant_id is None and superuser is None:
            raise ValueError("tenant_id is required (or pass an explicit SuperuserContext)")
        self._session = session
        self._tenant_id = tenant_id
        self._superuser = superuser
        self._tenant_attr = tenant_attr

    @classmethod
    def scoped_for_superuser(cls, session: AsyncSession, superuser: SuperuserContext) -> "TenantScopedRepository":
        return cls(session, None, superuser=superuser)

    def _tenant_filter(self, model: type):
        if self._tenant_id is None:
            return None
        return getattr(model, self._tenant_attr) == self._tenant_id

    async def get(self, model: type, resource_id: str):
        stmt: Select = select(model).where(model.id == resource_id)  # type: ignore[attr-defined]
        filtr = self._tenant_filter(model)
        if filtr is not None:
            stmt = stmt.where(filtr)
        return await self._session.scalar(stmt)

    async def list(self, model: type, *, limit: int = 100, offset: int = 0) -> list:
        stmt: Select = select(model)
        filtr = self._tenant_filter(model)
        if filtr is not None:
            stmt = stmt.where(filtr)
        stmt = stmt.limit(limit).offset(offset)
        return list((await self._session.execute(stmt)).scalars().all())

    async def add(self, obj) -> None:
        self._session.add(obj)
        await self._session.flush()

    async def delete(self, obj) -> None:
        await self._session.delete(obj)
