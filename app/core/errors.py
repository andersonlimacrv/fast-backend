"""Domain/application errors. Services raise these; only `interfaces/` maps them to HTTP."""


class DomainError(Exception):
    """Base for all domain errors."""


class InvalidCredentialsError(DomainError):
    """Email unknown, password wrong, or account inactive (intentionally generic)."""


class EmailAlreadyRegisteredError(DomainError):
    """Registration attempted with an email that already exists."""


class RefreshTokenInvalidError(DomainError):
    """Refresh token unknown, expired, revoked, or concurrently consumed."""


class RefreshTokenReuseError(RefreshTokenInvalidError):
    """A consumed refresh token was presented again: whole family revoked."""


class UserNotFoundError(DomainError):
    """Referenced user does not exist (internal use; avoid leaking via auth paths)."""


class OrganizationSwitchDeniedError(DomainError):
    """Switch-organization request denied (reserved for membership enforcement in Fase 3)."""


class OrganizationAccessDeniedError(DomainError):
    """No membership (or no such organization — deliberately indistinguishable)."""


class LastOwnerProtectedError(DomainError):
    """Refusing to remove/demote the last owner of an organization."""


class LastRootProtectedError(DomainError):
    """Refusing to disable/demote the last root (change A admin control plane)."""


class PasswordResetError(DomainError):
    """Reset token unknown, expired, or already used (intentionally generic, change B)."""


class AuditUnavailableError(DomainError):
    """Privileged action refused: audit recorder missing (fail-closed, change A)."""


class SlugUnavailableError(DomainError):
    """Could not mint a unique organization slug after retries."""


class ResourceNotFoundError(DomainError):
    """Tenant-scoped resource not found in the caller's tenant."""


class EntitlementDeniedError(DomainError):
    """Feature not entitled for the caller's organization/plan."""


class WebhookVerificationError(DomainError):
    """Provider webhook signature missing, invalid, or stale."""


class ThrottledError(DomainError):
    """Too many attempts; client must back off.

    The message stays generic on purpose (no limit values, no account-oracle);
    `retry_after` only feeds the `Retry-After` response header (change
    rate-limit-global). Services set it from the Redis key TTL.
    """

    def __init__(self, message: str = "too many attempts", *, retry_after: int | None = None) -> None:
        super().__init__(message)
        self.retry_after = retry_after


class CsrfError(DomainError):
    """Cookie-authenticated mutation without a valid CSRF synchronizer token.

    Raised exclusively at the HTTP boundary (`CurrentPrincipal` for
    bearer-or-cookie routes, refresh/logout routers for cookie-sourced
    tokens); maps to 403 in `interfaces/errors.py` (change
    auth-cookies-http-only).
    """
