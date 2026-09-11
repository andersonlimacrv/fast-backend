"""Entitlement schemas (Pydantic v2)."""

from pydantic import BaseModel, ConfigDict, Field


class GrantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    org_id: str
    key: str
    limit: int | None
    enabled: bool
    from_default: bool = False


class GrantUpsert(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    limit: int | None = Field(default=None, ge=0)
    enabled: bool = True
