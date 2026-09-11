"""Organization HTTP schemas (Pydantic v2)."""

from pydantic import BaseModel, ConfigDict, Field

from app.modules.organization.models import ADMIN, MEMBER, OWNER


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class MembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    org_id: str
    role: str


class MemberAdd(BaseModel):
    user_id: str = Field(min_length=1)
    role: str = Field(default=MEMBER, pattern=f"^({OWNER}|{ADMIN}|{MEMBER})$")


class MemberRoleUpdate(BaseModel):
    role: str = Field(pattern=f"^({OWNER}|{ADMIN}|{MEMBER})$")


class SwitchOrganizationRequest(BaseModel):
    org_id: str = Field(min_length=1)


class SwitchTokenPair(BaseModel):
    """Same wire shape as identity's TokenPair, owned by this module (no cross-module schemas)."""

    access_token: str
    refresh_token: str = ""
    token_type: str = "bearer"  # noqa: S105 (OAuth2 label, not a secret)
