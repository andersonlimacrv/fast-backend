"""Admin authorization policies: pure functions, no I/O (unit-tested).

Levels: `root` (is_superuser) > `staff` (is_staff) > None (no global access).
Org roles (owner/admin/member) are untouched by this module.
"""

from app.core.errors import OrganizationAccessDeniedError

STAFF = "staff"
ROOT = "root"


def level_of(*, is_superuser: bool, is_staff: bool) -> str | None:
    """Global access level for a principal. `is_superuser` implies staff."""
    if is_superuser:
        return ROOT
    if is_staff:
        return STAFF
    return None


def can_manage_staff(level: str | None) -> bool:
    """Only root administers staff/root privileges."""
    return level == ROOT


def assert_can_manage_staff(level: str | None) -> None:
    if not can_manage_staff(level):
        raise OrganizationAccessDeniedError("root required")


def assert_not_self(*, actor_user_id: str, target_user_id: str, operation: str) -> None:
    """Privilege changes and self-disable require a second accountable actor."""
    if actor_user_id == target_user_id:
        raise OrganizationAccessDeniedError(f"cannot {operation} your own account via admin")


def assert_valid_reason(reason: str) -> str:
    """Every privileged mutation carries an auditable reason (defense in depth;
    schemas already enforce min length at the boundary)."""
    cleaned = reason.strip()
    if len(cleaned) < 8:
        raise OrganizationAccessDeniedError("reason required")
    return cleaned
