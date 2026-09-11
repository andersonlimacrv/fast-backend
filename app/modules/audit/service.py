"""AuditService: the AuditRecorder implementation + admin reads. Insert-only."""

from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.modules.audit.models import AuditLog


class AuditService:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._sessions = session_factory

    async def record(
        self,
        *,
        tenant_id: str | None,
        actor_user_id: str | None,
        action: str,
        resource_type: str = "",
        resource_id: str = "",
        metadata: dict[str, Any] | None = None,
        ip: str | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        async with self._sessions() as session:
            async with session.begin():
                row = AuditLog(
                    tenant_id=tenant_id,
                    actor_user_id=actor_user_id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    audit_metadata=metadata or {},
                    ip=ip,
                    user_agent=user_agent,
                )
                session.add(row)
            return row

    async def list_for_org(self, *, org_id: str, limit: int = 100) -> list[AuditLog]:
        async with self._sessions() as session:
            rows = (
                await session.execute(
                    select(AuditLog).where(AuditLog.tenant_id == org_id).order_by(desc(AuditLog.created_at)).limit(limit)
                )
            ).scalars()
            return list(rows.all())
