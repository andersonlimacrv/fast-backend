"""Unit tests: real client IP behind trusted proxies (no external services)."""

import pytest

from app.core.contracts.audit import client_ip, real_client_ip
from app.infrastructure.security.client_ip import client_ip_from_request


class _FakeClient:
    def __init__(self, host: str | None) -> None:
        self.host = host


class _FakeRequest:
    # Plain dict (unlike Starlette's case-insensitive Headers): tests use the
    # lowercase key the production lookup asks for.
    def __init__(self, headers: dict[str, str] | None = None, host: str | None = "127.0.0.1") -> None:
        self.headers = headers or {}
        self.client = _FakeClient(host) if host is not None else None


@pytest.mark.unit
@pytest.mark.parametrize(
    ("xff", "direct", "hops", "expected"),
    [
        (None, "10.0.0.1", 0, "10.0.0.1"),  # no header -> direct peer
        ("9.9.9.9", "10.0.0.1", 0, "10.0.0.1"),  # spoof ignored when fail-closed
        ("9.9.9.9", "10.0.0.1", 1, "9.9.9.9"),  # one trusted hop -> last entry
        ("1.1.1.1, 2.2.2.2", "10.0.0.1", 1, "2.2.2.2"),  # counted from the right
        ("1.1.1.1, 2.2.2.2", "10.0.0.1", 2, "1.1.1.1"),
        ("1.1.1.1, 2.2.2.2", "10.0.0.1", 5, "1.1.1.1"),  # more hops than entries clamps left
        ("  1.1.1.1 ,, 2.2.2.2  ", "10.0.0.1", 1, "2.2.2.2"),  # empties skipped, entries stripped
        ("", "10.0.0.1", 1, "10.0.0.1"),  # blank header -> direct peer
        ("   ", "10.0.0.1", 1, "10.0.0.1"),
        (None, None, 0, "unknown"),  # no peer info at all
        ("9.9.9.9", None, 1, "9.9.9.9"),
        ("9.9.9.9", "10.0.0.1", -1, "10.0.0.1"),  # defensive: negative behaves as fail-closed
    ],
)
def test_real_client_ip_vectors(xff: str | None, direct: str | None, hops: int, expected: str) -> None:
    assert real_client_ip(xff, direct, hops) == expected


@pytest.mark.unit
def test_client_ip_spoof_ignored_by_default() -> None:
    request = _FakeRequest(headers={"x-forwarded-for": "9.9.9.9"}, host="10.0.0.1")
    assert client_ip(request) == "10.0.0.1"
    assert client_ip(request, 0) == "10.0.0.1"
    assert client_ip(request, 1) == "9.9.9.9"


@pytest.mark.unit
def test_client_ip_unknown_without_peer() -> None:
    assert client_ip(_FakeRequest(host=None)) == "unknown"
    assert client_ip(object()) == "unknown"  # neither headers nor client


@pytest.mark.unit
def test_infrastructure_helper_matches_core_rule() -> None:
    """The `infrastructure/` entrypoint routers use must agree with the core rule (no drift)."""
    vectors = [
        (None, "10.0.0.1", 0),
        ("9.9.9.9", "10.0.0.1", 0),
        ("9.9.9.9", "10.0.0.1", 1),
        ("1.1.1.1, 2.2.2.2, 3.3.3.3", "10.0.0.1", 2),
    ]
    for xff, direct, hops in vectors:
        headers = {"x-forwarded-for": xff} if xff is not None else {}
        request = _FakeRequest(headers=headers, host=direct)
        assert client_ip_from_request(request, hops) == real_client_ip(xff, direct, hops) == client_ip(request, hops)
