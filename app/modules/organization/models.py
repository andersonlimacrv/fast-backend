"""Organization + Membership models. Roles are plain strings (owner|admin|member)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base

OWNER = "owner"
ADMIN = "admin"
MEMBER = "member"
ROLES = (OWNER, ADMIN, MEMBER)

_ROLE_RANK = {MEMBER: 1, ADMIN: 2, OWNER: 3}


def role_at_least(role: str, minimum: str) -> bool:
    return _ROLE_RANK[role] >= _ROLE_RANK[minimum]


def _uuid() -> str:
    import uuid

    return uuid.uuid4().hex


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    org_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False, default=MEMBER)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "org_id", name="uq_membership_user_org"),)
