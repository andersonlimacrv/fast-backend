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


class ThrottledError(DomainError):
    """Too many attempts; client must back off."""
