"""Entitlement resolution: code defaults, database overrides. No HTTPException."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.errors import EntitlementDeniedError
from app.modules.entitlements.models import EntitlementGrant

PROJECTS_MAX = "projects.max"
PROJECTS_ACCESS = "projects.access"

DEFAULT_ENTITLEMENTS: dict[str, dict] = {
    PROJECTS_MAX: {"limit": 100, "enabled": True},
    PROJECTS_ACCESS: {"limit": None, "enabled": True},
}


@dataclass(frozen=True)
class ResolvedEntitlement:
    org_id: str
    key: str
    limit: int | None
    enabled: bool
    from_default: bool


class EntitlementService:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._sessions = session_factory

    async def resolve(self, *, org_id: str, key: str) -> ResolvedEntitlement:
        async with self._sessions() as session:
            row = await session.scalar(
                select(EntitlementGrant).where(EntitlementGrant.org_id == org_id, EntitlementGrant.key == key)
            )
            if row is None:
                default = DEFAULT_ENTITLEMENTS.get(key, {"limit": None, "enabled": True})
                return ResolvedEntitlement(
                    org_id=org_id, key=key, limit=default["limit"], enabled=default["enabled"], from_default=True
                )
            return ResolvedEntitlement(org_id=org_id, key=key, limit=row.limit, enabled=row.enabled, from_default=False)

    async def require(self, *, org_id: str, key: str, usage: int = 0) -> ResolvedEntitlement:
        """Raise `EntitlementDeniedError` unless enabled and (unlimited or usage < limit)."""
        resolved = await self.resolve(org_id=org_id, key=key)
        if not resolved.enabled:
            raise EntitlementDeniedError(f"entitlement denied: {key}")
        if resolved.limit is not None and usage >= resolved.limit:
            raise EntitlementDeniedError(f"quota reached: {key}")
        return resolved

    async def upsert(self, *, org_id: str, key: str, limit: int | None, enabled: bool = True) -> EntitlementGrant:
        async with self._sessions() as session:
            async with session.begin():
                row = await session.scalar(
                    select(EntitlementGrant).where(EntitlementGrant.org_id == org_id, EntitlementGrant.key == key)
                )
                if row is None:
                    row = EntitlementGrant(org_id=org_id, key=key, limit=limit, enabled=enabled)
                    session.add(row)
                else:
                    row.limit = limit
                    row.enabled = enabled
            return row

    async def list_grants(self, *, org_id: str) -> list[EntitlementGrant]:
        async with self._sessions() as session:
            rows = (
                await session.execute(
                    select(EntitlementGrant).where(EntitlementGrant.org_id == org_id).order_by(EntitlementGrant.key)
                )
            ).scalars()
            return list(rows.all())

    async def list_resolved(self, *, org_id: str) -> list[ResolvedEntitlement]:
        """Single source of truth for debugging: code defaults merged with DB
        overrides, each marked with `from_default`."""
        async with self._sessions() as session:
            rows = (await session.execute(select(EntitlementGrant).where(EntitlementGrant.org_id == org_id))).scalars()
            by_key = {row.key: row for row in rows.all()}
            resolved = []
            for key, default in sorted(DEFAULT_ENTITLEMENTS.items()):
                row = by_key.pop(key, None)
                if row is None:
                    resolved.append(
                        ResolvedEntitlement(
                            org_id=org_id, key=key, limit=default["limit"], enabled=default["enabled"], from_default=True
                        )
                    )
                else:
                    resolved.append(
                        ResolvedEntitlement(org_id=org_id, key=key, limit=row.limit, enabled=row.enabled, from_default=False)
                    )
            for key in sorted(by_key):
                row = by_key[key]
                resolved.append(
                    ResolvedEntitlement(org_id=org_id, key=key, limit=row.limit, enabled=row.enabled, from_default=False)
                )
            return resolved
