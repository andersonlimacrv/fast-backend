"""Admin dependencies: the ONLY place that reads global privilege flags.

`current_staff` / `current_root` turn a `Principal` into an `AdminContext`.
No other module may branch on `is_superuser`/`is_staff`.
"""

from dataclasses import dataclass

from fastapi import Depends, Request

from app.core.errors import AuditUnavailableError, OrganizationAccessDeniedError
from app.modules.admin.policies import ROOT, STAFF, level_of
from app.modules.identity.public import Principal, current_principal


@dataclass(frozen=True)
class AdminContext:
    user_id: str
    email: str
    level: str  # STAFF | ROOT


def _context(principal: Principal) -> AdminContext | None:
    level = level_of(is_superuser=principal.is_superuser, is_staff=principal.is_staff)
    if level is None:
        return None
    return AdminContext(user_id=principal.user_id, email=principal.email, level=level)


async def current_staff(request: Request, principal: Principal = Depends(current_principal)) -> AdminContext:
    _ = request
    ctx = _context(principal)
    if ctx is None:
        raise OrganizationAccessDeniedError("staff required")
    return ctx


async def current_root(request: Request, principal: Principal = Depends(current_principal)) -> AdminContext:
    _ = request
    ctx = _context(principal)
    if ctx is None or ctx.level != ROOT:
        raise OrganizationAccessDeniedError("root required")
    return ctx


def assert_audit_available(request: Request) -> None:
    """Fail-closed: privileged mutations require the audit recorder (ADR 0005)."""
    if getattr(getattr(request, "app", None), "state", None) is None:
        raise AuditUnavailableError("audit unavailable")
    if getattr(request.app.state, "audit_service", None) is None:
        raise AuditUnavailableError("audit unavailable")


def is_staff_level(ctx: AdminContext) -> bool:
    return ctx.level in (STAFF, ROOT)
