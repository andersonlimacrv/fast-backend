"""Unit tests: HttpOnly session cookies + CSRF synchronizer token (no I/O).

Covers change auth-cookies-http-only tasks 1.1/1.2 (emission helpers,
settings) and 2.1 (pure CSRF matrix, 403 mapping). Container-backed flow
lives in `app/tests/integration/test_auth_cookies.py`.
"""

from typing import Any

import pytest
from pydantic import ValidationError

from app.core.errors import CsrfError
from app.core.settings import Settings
from app.infrastructure.auth.cookies import (
    ACCESS_COOKIE_NAME,
    CSRF_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    clear_session_cookies,
    new_csrf_token,
    set_access_cookie,
    set_rotated_cookies,
    set_session_cookies,
)
from app.infrastructure.auth.csrf import assert_csrf, csrf_valid
from app.interfaces.errors import _status_for
from scripts.env_check import check_env


def _settings(**overrides: Any) -> Settings:
    overrides.setdefault("secret_key", "x" * 32)
    overrides.setdefault("frontend_url", "https://app.example.com")
    return Settings(**overrides)


class FakeResponse:
    """Duck-typed Starlette response: records `set_cookie` calls."""

    def __init__(self) -> None:
        self.cookies: list[dict[str, Any]] = []

    def set_cookie(self, key: str, value: str, **kwargs: Any) -> None:
        self.cookies.append({"key": key, "value": value, **kwargs})

    def by_name(self, name: str) -> dict[str, Any]:
        return next(c for c in self.cookies if c["key"] == name)


class FakeRequest:
    """Duck-typed request for `assert_csrf` (method/cookies/headers only)."""

    def __init__(self, method: str, cookies: dict[str, str] | None = None, headers: dict[str, str] | None = None) -> None:
        self.method = method
        self.cookies = cookies or {}
        self.headers = headers or {}


@pytest.mark.unit
def test_cookie_settings_defaults_keep_header_only() -> None:
    s = _settings()
    assert s.auth_cookie_enabled is False
    assert s.auth_cookie_secure is True
    assert s.auth_cookie_samesite == "lax"
    assert s.auth_cookie_domain == ""
    assert s.csrf_enabled is True


@pytest.mark.unit
def test_cookie_samesite_rejects_none_and_unknown() -> None:
    with pytest.raises(ValidationError, match="AUTH_COOKIE_SAMESITE"):
        _settings(auth_cookie_samesite="none")
    with pytest.raises(ValidationError, match="AUTH_COOKIE_SAMESITE"):
        _settings(auth_cookie_samesite="bogus")
    assert _settings(auth_cookie_samesite="Strict").auth_cookie_samesite == "Strict"


@pytest.mark.unit
def test_production_guards_cookie_without_secure_or_csrf() -> None:
    base: dict[str, Any] = {
        "environment": "production",
        "trusted_hosts": ["example.com"],
        "bootstrap_key": "y" * 32,
        "frontend_url": "https://app.example.com",
    }
    with pytest.raises(ValidationError, match="AUTH_COOKIE_SECURE"):
        _settings(**base, auth_cookie_enabled=True, auth_cookie_secure=False)
    with pytest.raises(ValidationError, match="CSRF_ENABLED"):
        _settings(**base, auth_cookie_enabled=True, csrf_enabled=False)
    ok = _settings(**base, auth_cookie_enabled=True)
    assert ok.auth_cookie_enabled and ok.auth_cookie_secure and ok.csrf_enabled


@pytest.mark.unit
def test_login_emits_httponly_trio_with_paths_and_ttl() -> None:
    s = _settings(auth_cookie_enabled=True, auth_cookie_secure=False)
    resp = FakeResponse()
    set_session_cookies(resp, s, access_token="a", refresh_token="r", csrf_token="c")
    access = resp.by_name(ACCESS_COOKIE_NAME)
    refresh = resp.by_name(REFRESH_COOKIE_NAME)
    csrf = resp.by_name(CSRF_COOKIE_NAME)
    assert (access["value"], access["httponly"], access["path"]) == ("a", True, "/")
    assert access["max_age"] == s.access_token_ttl_minutes * 60
    assert (refresh["value"], refresh["httponly"], refresh["path"]) == ("r", True, "/auth")
    assert refresh["max_age"] == s.refresh_token_ttl_days * 24 * 3600
    # Synchronizer token MUST stay JS-readable (the SPA echoes it in X-CSRF-Token).
    assert (csrf["value"], csrf["httponly"], csrf["path"]) == ("c", False, "/")
    for cookie in (access, refresh, csrf):
        assert cookie["samesite"] == "lax"
        assert cookie["secure"] is False
        assert "domain" not in cookie


@pytest.mark.unit
def test_secure_and_domain_propagate() -> None:
    s = _settings(auth_cookie_enabled=True, auth_cookie_secure=True, auth_cookie_domain="example.com")
    resp = FakeResponse()
    set_session_cookies(resp, s, access_token="a", refresh_token="r", csrf_token="c")
    for cookie in resp.cookies:
        assert cookie["secure"] is True
        assert cookie["domain"] == "example.com"


@pytest.mark.unit
def test_rotation_and_switch_keep_csrf_stable() -> None:
    s = _settings(auth_cookie_enabled=True, auth_cookie_secure=False)
    rotated = FakeResponse()
    set_rotated_cookies(rotated, s, access_token="a2", refresh_token="r2")
    assert {c["key"] for c in rotated.cookies} == {ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME}
    switched = FakeResponse()
    set_access_cookie(switched, s, access_token="a3")
    assert [c["key"] for c in switched.cookies] == [ACCESS_COOKIE_NAME]


@pytest.mark.unit
def test_logout_expires_trio_on_matching_paths() -> None:
    s = _settings(auth_cookie_enabled=True, auth_cookie_secure=False)
    resp = FakeResponse()
    clear_session_cookies(resp, s)
    assert {c["key"] for c in resp.cookies} == {ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, CSRF_COOKIE_NAME}
    paths = {c["key"]: c["path"] for c in resp.cookies}
    assert paths == {ACCESS_COOKIE_NAME: "/", REFRESH_COOKIE_NAME: "/auth", CSRF_COOKIE_NAME: "/"}
    assert all(c["value"] == "" and c["max_age"] == 0 for c in resp.cookies)


@pytest.mark.unit
def test_csrf_tokens_are_opaque_and_unique() -> None:
    assert new_csrf_token() != new_csrf_token()


@pytest.mark.unit
def test_csrf_matrix() -> None:
    token = "t" * 32
    cookies = {CSRF_COOKIE_NAME: token}
    headers = {"X-CSRF-Token": token}
    # Safe methods never need the token (cookie session can read).
    assert csrf_valid(method="GET", cookies={}, headers={}) is True
    assert csrf_valid(method="HEAD", cookies={}, headers={}) is True
    # Mutations: match passes (header lookup is case-insensitive).
    assert csrf_valid(method="POST", cookies=cookies, headers=headers) is True
    assert csrf_valid(method="POST", cookies=cookies, headers={"x-csrf-token": token}) is True
    assert csrf_valid(method="DELETE", cookies=cookies, headers=headers) is True
    # Missing/empty/mismatched fail closed.
    assert csrf_valid(method="POST", cookies={}, headers=headers) is False
    assert csrf_valid(method="POST", cookies=cookies, headers={}) is False
    assert csrf_valid(method="POST", cookies=cookies, headers={"X-CSRF-Token": "wrong"}) is False
    assert csrf_valid(method="POST", cookies={CSRF_COOKIE_NAME: ""}, headers=headers) is False


@pytest.mark.unit
def test_assert_csrf_raises_domain_error_on_mutation() -> None:
    assert_csrf(FakeRequest("GET"))
    assert_csrf(FakeRequest("POST", {CSRF_COOKIE_NAME: "t"}, {"X-CSRF-Token": "t"}))
    with pytest.raises(CsrfError):
        assert_csrf(FakeRequest("POST"))
    with pytest.raises(CsrfError):
        assert_csrf(FakeRequest("POST", {CSRF_COOKIE_NAME: "t"}, {"X-CSRF-Token": "nope"}))


@pytest.mark.unit
def test_csrf_maps_to_403() -> None:
    assert _status_for(CsrfError("csrf validation failed")) == 403


@pytest.mark.unit
def test_env_check_covers_cookie_keys(tmp_path) -> None:
    example = tmp_path / ".env.example"
    env = tmp_path / ".env"
    example.write_text(
        "AUTH_COOKIE_ENABLED=false\nAUTH_COOKIE_SECURE=true\nAUTH_COOKIE_SAMESITE=lax\nCSRF_ENABLED=true\n",
        encoding="utf-8",
    )
    env.write_text(
        "AUTH_COOKIE_ENABLED=true\nAUTH_COOKIE_SECURE=false\nAUTH_COOKIE_SAMESITE=strict\nCSRF_ENABLED=true\n",
        encoding="utf-8",
    )
    code, _ = check_env(env, example)
    assert code == 0
    env.write_text("AUTH_COOKIE_ENABLED=maybe\nAUTH_COOKIE_SAMESITE=none\n", encoding="utf-8")
    code, report = check_env(env, example)
    assert code == 1
    assert "AUTH_COOKIE_ENABLED" in report and "AUTH_COOKIE_SAMESITE" in report
