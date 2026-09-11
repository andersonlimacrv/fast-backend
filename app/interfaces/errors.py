"""Domain → HTTP mapping. The ONLY place that knows status codes for domain errors."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.errors import (
    DomainError,
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    LastOwnerProtectedError,
    OrganizationAccessDeniedError,
    OrganizationSwitchDeniedError,
    RefreshTokenInvalidError,
    RefreshTokenReuseError,
    ResourceNotFoundError,
    SlugUnavailableError,
    ThrottledError,
    UserNotFoundError,
)


def _status_for(exc: DomainError) -> int:
    if isinstance(exc, (RefreshTokenReuseError, RefreshTokenInvalidError)):
        return 401
    if isinstance(exc, InvalidCredentialsError):
        return 401
    if isinstance(exc, EmailAlreadyRegisteredError):
        return 409
    if isinstance(exc, (OrganizationAccessDeniedError, OrganizationSwitchDeniedError)):
        return 403
    if isinstance(exc, (LastOwnerProtectedError, SlugUnavailableError)):
        return 409
    if isinstance(exc, UserNotFoundError):
        return 404
    if isinstance(exc, ResourceNotFoundError):
        return 404
    if isinstance(exc, ThrottledError):
        return 429
    return 500


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
        status = _status_for(exc)
        detail = "internal error" if status == 500 else str(exc) or "request failed"
        return JSONResponse(status_code=status, content={"detail": detail})
