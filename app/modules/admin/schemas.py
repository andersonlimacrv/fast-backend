"""Admin HTTP schemas (Pydantic v2). Privilege flags are NEVER writable here."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ORG_ROLES = ("owner", "admin", "member")


class ReasonedBody(BaseModel):
    reason: str = Field(min_length=8, max_length=500)


class AdminUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    is_staff: bool
    created_at: datetime


class AdminUserCreate(ReasonedBody):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class AdminOverview(BaseModel):
    users: int
    organizations: int
    projects: int


class AdminOrgRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str


class MembershipSet(ReasonedBody):
    org_id: str = Field(min_length=1)
    user_id: str = Field(min_length=1)
    role: str = Field(pattern="^(owner|admin|member)$")


class AdminAuditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str | None
    actor_user_id: str | None
    action: str
    resource_type: str
    resource_id: str
    metadata: dict[str, Any] = Field(alias="audit_metadata", default_factory=dict)
    ip: str | None
    created_at: datetime


class StatusAccepted(BaseModel):
    status: str = "accepted"
