"""Linked social identities (change C, table only, no active provider).

Follows `refresh_tokens.py`: auth secrets live in `infrastructure/auth`,
never in modules. Unique `(provider, provider_sub)` prevents double-linking.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


def _uuid() -> str:
    import uuid

    return uuid.uuid4().hex


class LinkedIdentity(Base):
    __tablename__ = "linked_identities"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    provider: Mapped[str] = mapped_column(String(40), nullable=False)
    provider_sub: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("provider", "provider_sub", name="uq_linked_provider_sub"),)
