"""Unit tests: admin policies are pure functions (no DB, no services)."""

import pytest

from app.core.errors import OrganizationAccessDeniedError
from app.modules.admin.policies import (
    ROOT,
    STAFF,
    assert_can_manage_staff,
    assert_not_self,
    assert_valid_reason,
    can_manage_staff,
    level_of,
)


@pytest.mark.unit
def test_level_of_superuser_implies_staff() -> None:
    assert level_of(is_superuser=True, is_staff=False) == ROOT
    assert level_of(is_superuser=True, is_staff=True) == ROOT
    assert level_of(is_superuser=False, is_staff=True) == STAFF
    assert level_of(is_superuser=False, is_staff=False) is None


@pytest.mark.unit
def test_only_root_manages_staff() -> None:
    assert can_manage_staff(ROOT) is True
    assert can_manage_staff(STAFF) is False
    assert can_manage_staff(None) is False
    assert_can_manage_staff(ROOT)
    with pytest.raises(OrganizationAccessDeniedError):
        assert_can_manage_staff(STAFF)
    with pytest.raises(OrganizationAccessDeniedError):
        assert_can_manage_staff(None)


@pytest.mark.unit
def test_self_privilege_changes_denied() -> None:
    with pytest.raises(OrganizationAccessDeniedError):
        assert_not_self(actor_user_id="a", target_user_id="a", operation="grant staff to")
    assert_not_self(actor_user_id="a", target_user_id="b", operation="grant staff to")


@pytest.mark.unit
def test_reason_defense_in_depth() -> None:
    assert assert_valid_reason("  revoke leaked session  ") == "revoke leaked session"
    with pytest.raises(OrganizationAccessDeniedError):
        assert_valid_reason("short")
