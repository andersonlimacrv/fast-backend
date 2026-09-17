"""Unit tests: domain → HTTP mapping pins (no I/O)."""

import pytest

from app.core.errors import LastOwnerProtectedError, LastRootProtectedError
from app.interfaces.errors import _status_for


@pytest.mark.unit
def test_last_root_maps_to_409() -> None:
    assert _status_for(LastRootProtectedError("cannot disable the last root")) == 409


@pytest.mark.unit
def test_last_owner_maps_to_409() -> None:
    assert _status_for(LastOwnerProtectedError("cannot remove the last owner")) == 409
