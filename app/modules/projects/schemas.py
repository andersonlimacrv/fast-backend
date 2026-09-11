"""Project schemas (Pydantic v2)."""

from pydantic import BaseModel, ConfigDict, Field


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    name: str


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class ProjectUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
