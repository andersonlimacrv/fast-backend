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
    """Too many attempts; client must back off."""
