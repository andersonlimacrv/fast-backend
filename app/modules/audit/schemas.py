"""Audit schemas (Pydantic v2)."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AuditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    tenant_id: str | None
    actor_user_id: str | None
    action: str
    resource_type: str
    resource_id: str
    metadata: dict[str, Any] = Field(alias="audit_metadata", default_factory=dict)
    ip: str | None
    created_at: datetime
