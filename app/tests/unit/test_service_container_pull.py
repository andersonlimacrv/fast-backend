"""Unit tests: ServiceContainer image-pull retry (no docker needed)."""

from types import SimpleNamespace

import pytest

from app.tests.conftest import _pull_with_retry


def _client(failures_before_success: int, error: Exception | None = None):
    calls = {"n": 0}
    failure = error if error is not None else RuntimeError("500 unauthorized")

    class Images:
        def pull(self, _image: str) -> None:
            calls["n"] += 1
            if calls["n"] <= failures_before_success:
                raise failure

    return SimpleNamespace(images=Images()), calls


@pytest.mark.unit
def test_pull_retries_then_succeeds() -> None:
    client, calls = _client(2)
    _pull_with_retry(client, "img:latest", attempts=3, backoff=(0.0,))
    assert calls["n"] == 3


@pytest.mark.unit
def test_pull_persistent_failure_raises_last_error() -> None:
    client, calls = _client(99)
    with pytest.raises(RuntimeError, match="500 unauthorized"):
        _pull_with_retry(client, "img:latest", attempts=2, backoff=(0.0,))
    assert calls["n"] == 2
