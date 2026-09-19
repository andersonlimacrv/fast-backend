"""Identity HTTP schemas (Pydantic v2). Never expose hashes or tokens except documented."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    is_staff: bool = False


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"  # noqa: S105 (OAuth2 label, not a secret)


class RefreshRequest(BaseModel):
    """Refresh credential: body token (header flow) or empty when the HttpOnly
    cookie carries it (cookie flow, flag-gated in the router). Empty reaches
    the service as invalid (401) unless a cookie supplies the token."""

    refresh_token: str = Field(default="")


class LogoutRequest(BaseModel):
    """Same dual source as refresh: body token or session cookie (cleared on logout)."""

    refresh_token: str = Field(default="")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=8, max_length=256)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=256)
