"""Entitlement grants: boolean flags and quotas in one table.

`limit=None` means unlimited (pure on/off via `enabled`). DB rows override
`DEFAULT_ENTITLEMENTS`; nothing is ever seeded (DAG: nobody below may import
this module's writers, and writers live behind `admin+` routes).
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


def _uuid() -> str:
    import uuid

    return uuid.uuid4().hex


class EntitlementGrant(Base):
    __tablename__ = "entitlement_grants"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    org_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("org_id", "key", name="uq_grant_org_key"),)
