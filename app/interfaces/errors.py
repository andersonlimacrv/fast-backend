"""Domain → HTTP mapping. The ONLY place that knows status codes for domain errors."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.errors import (
    AuditUnavailableError,
    CsrfError,
    DomainError,
    EmailAlreadyRegisteredError,
    EntitlementDeniedError,
    InvalidCredentialsError,
    LastOwnerProtectedError,
    LastRootProtectedError,
    OrganizationAccessDeniedError,
    OrganizationSwitchDeniedError,
    PasswordResetError,
    RefreshTokenInvalidError,
    RefreshTokenReuseError,
    ResourceNotFoundError,
    SlugUnavailableError,
    ThrottledError,
    UserNotFoundError,
    WebhookVerificationError,
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
    if isinstance(exc, EntitlementDeniedError):
        return 403
    if isinstance(exc, CsrfError):
        return 403
    if isinstance(exc, (LastOwnerProtectedError, SlugUnavailableError)):
        return 409
    if isinstance(exc, LastRootProtectedError):
        return 409
    if isinstance(exc, PasswordResetError):
        return 400
    if isinstance(exc, AuditUnavailableError):
        return 500
    if isinstance(exc, UserNotFoundError):
        return 404
    if isinstance(exc, ResourceNotFoundError):
        return 404
    if isinstance(exc, ThrottledError):
        return 429
    if isinstance(exc, WebhookVerificationError):
        return 400
    return 500


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
        status = _status_for(exc)
        detail = "internal error" if status == 500 else str(exc) or "request failed"
        if isinstance(exc, ThrottledError):
            # Generic body (never which limit fired); backoff hint lives only
            # in the header (change rate-limit-global).
            retry_after = exc.retry_after if exc.retry_after and exc.retry_after > 0 else 60
            return JSONResponse(status_code=status, content={"detail": detail}, headers={"Retry-After": str(retry_after)})
        return JSONResponse(status_code=status, content={"detail": detail})
