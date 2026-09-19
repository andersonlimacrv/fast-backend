"""Integration: HttpOnly session cookies + CSRF (real Postgres + Redis).

Change auth-cookies-http-only tasks 1.x/2.x/4.1 (backend only):

- Flag off (default app) = header-only, byte-identical: no `Set-Cookie` on
  login, cookies ignored by `CurrentPrincipal`.
- Flag on = dual read (header OR cookie) + `Set-Cookie` trio on login,
  rotation re-emit on refresh, access re-emit on switch, expiring clear on
  logout; full login → me → refresh → logout flow works cookie-only.
- CSRF synchronizer token: cookie-authenticated mutations without (or with a
  wrong) `X-CSRF-Token` → 403; safe methods and header flows never need it.
- `refresh_tokens.ip/user_agent` keep being recorded on the cookie flow.

Hermetic suite rule: every custom `Settings` carries an explicit
`frontend_url`; cookie tests run over plain http, so they set
`auth_cookie_secure=false` (browsers/httpx only send `Secure` over https) —
the `Secure` attribute itself is asserted by parsing `Set-Cookie`.
"""

from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient, Response
from sqlalchemy import select

from app.core.settings import Settings
from app.infrastructure.auth.cookies import ACCESS_COOKIE_NAME, CSRF_COOKIE_NAME, REFRESH_COOKIE_NAME
from app.infrastructure.auth.refresh_tokens import RefreshToken, hash_refresh_token
from app.tests.conftest import build_app, register_and_login


def _cookie_settings(base_settings: Settings, **overrides: Any) -> Settings:
    return Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        login_max_attempts=1000,  # throttling has its own tests; stay out of the way
        rate_limit_global_max_attempts=100000,
        frontend_url="https://app.example.com",  # fail-fast is explicit, never global
        **overrides,
    )


async def _discard(app: Any) -> None:
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


def _set_cookies(resp: Response) -> dict[str, dict[str, Any]]:
    """Parse `Set-Cookie` headers into {name: {value, attrs-lower}}."""
    out: dict[str, dict[str, Any]] = {}
    for raw in resp.headers.get_list("set-cookie"):
        parts = [p.strip() for p in raw.split(";")]
        name, _, value = parts[0].partition("=")
        attrs: dict[str, Any] = {}
        for part in parts[1:]:
            if "=" in part:
                key, _, val = part.partition("=")
                attrs[key.strip().lower()] = val.strip()
            else:
                attrs[part.strip().lower()] = True
        out[name.strip()] = {"value": value.strip().strip('"'), "attrs": attrs}
    return out


def _csrf_of(client: AsyncClient) -> str:
    token = client.cookies.get(CSRF_COOKIE_NAME)
    assert token, "login must seed the CSRF cookie"
    return token


@pytest.mark.integration
async def test_flag_off_login_sets_no_cookies(client: AsyncClient) -> None:
    data = await register_and_login(client)
    assert data["access_token"] and data["refresh_token"]
    login_like = await client.post("/auth/login", json={"email": data["email"], "password": data["password"]})
    assert login_like.status_code == 200
    assert login_like.headers.get_list("set-cookie") == []


@pytest.mark.integration
async def test_flag_off_ignores_cookies(client: AsyncClient) -> None:
    data = await register_and_login(client)
    forged = await client.get("/auth/me", cookies={ACCESS_COOKIE_NAME: data["access_token"]})
    assert forged.status_code == 401


@pytest.mark.integration
async def test_login_sets_httponly_trio(base_settings: Settings, clean_db: None) -> None:
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookies-trio@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            assert login.status_code == 200
            # Body tokens stay during the dual transition (removal is a follow-up change).
            body = login.json()
            assert body["access_token"] and body["refresh_token"]
            cookies = _set_cookies(login)
            access, refresh, csrf = cookies[ACCESS_COOKIE_NAME], cookies[REFRESH_COOKIE_NAME], cookies[CSRF_COOKIE_NAME]
            assert access["value"] == body["access_token"] and "httponly" in access["attrs"]
            assert access["attrs"].get("path") == "/" and access["attrs"].get("samesite") == "lax"
            assert access["attrs"].get("max-age") == str(15 * 60)
            assert "secure" not in access["attrs"]
            assert refresh["value"] == body["refresh_token"] and "httponly" in refresh["attrs"]
            assert refresh["attrs"].get("path") == "/auth" and refresh["attrs"].get("samesite") == "lax"
            assert refresh["attrs"].get("max-age") == str(30 * 24 * 3600)
            # The synchronizer token must stay JS-readable (document.cookie can see it;
            # the HttpOnly session tokens never appear there).
            assert csrf["value"] and "httponly" not in csrf["attrs"]
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_secure_attribute_follows_flag(base_settings: Settings, clean_db: None) -> None:
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=True)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookies-secure@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            assert login.status_code == 200
            cookies = _set_cookies(login)
            assert cookies and all("secure" in c["attrs"] for c in cookies.values())
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_cookie_only_login_me_refresh_logout(base_settings: Settings, clean_db: None) -> None:
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookie-flow@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            assert login.status_code == 200
            first_refresh = login.json()["refresh_token"]

            # No Authorization header anywhere below: session travels by cookie only.
            me = await ac.get("/auth/me")
            assert me.status_code == 200, me.text
            assert me.json()["email"] == email

            # Silent refresh with an empty body (credential comes from the cookie) + CSRF.
            rotated = await ac.post("/auth/refresh", json={}, headers={"X-CSRF-Token": _csrf_of(ac)})
            assert rotated.status_code == 200, rotated.text
            assert rotated.json()["refresh_token"] != first_refresh
            assert ACCESS_COOKIE_NAME in _set_cookies(rotated)

            # Old refresh family member is consumed: reuse via body is still 401 (rotation intact).
            reuse = await ac.post("/auth/refresh", json={"refresh_token": first_refresh})
            assert reuse.status_code == 401

            # Logout clears the trio (expiring Set-Cookie); the session is gone afterwards.
            logout = await ac.post("/auth/logout", json={}, headers={"X-CSRF-Token": _csrf_of(ac)})
            assert logout.status_code == 204, logout.text
            cleared = _set_cookies(logout)
            assert set(cleared) == {ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, CSRF_COOKIE_NAME}
            assert all(c["attrs"].get("max-age") == "0" for c in cleared.values())
            assert (await ac.get("/auth/me")).status_code == 401
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_cookie_mutation_without_csrf_is_403(base_settings: Settings, clean_db: None) -> None:
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookie-csrf@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            assert (await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})).status_code == 200

            # Safe method via cookie: no token needed.
            assert (await ac.get("/auth/me")).status_code == 200
            # Mutations via cookie: missing/wrong token → 403, correct → through.
            assert (await ac.post("/auth/logout-everywhere")).status_code == 403
            assert (await ac.post("/auth/logout-everywhere", headers={"X-CSRF-Token": "wrong"})).status_code == 403
            assert (await ac.post("/auth/refresh", json={})).status_code == 403
            ok = await ac.post("/auth/logout-everywhere", headers={"X-CSRF-Token": _csrf_of(ac)})
            assert ok.status_code == 204, ok.text
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_header_flow_needs_no_csrf_when_flag_on(base_settings: Settings, clean_db: None) -> None:
    """Dual transition: Bearer header keeps working untouched (current e2e stay green)."""
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "header-dual@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
            assert (await ac.get("/auth/me", headers=headers)).status_code == 200
            # Body refresh + bearer mutations pass with no CSRF involved.
            rotated = await ac.post("/auth/refresh", json={"refresh_token": login.json()["refresh_token"]})
            assert rotated.status_code == 200, rotated.text
            assert (await ac.post("/auth/logout-everywhere", headers=headers)).status_code == 204
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_switch_organization_reemits_access_cookie(base_settings: Settings, clean_db: None) -> None:
    import jwt as pyjwt

    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookie-switch@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
            org = (await ac.post("/organizations", json={"name": "Acme"}, headers=headers)).json()

            # Cookie-authenticated switch without CSRF → 403; with token → new access (body + cookie).
            assert (await ac.post("/auth/switch-organization", json={"org_id": org["id"]})).status_code == 403
            switched = await ac.post(
                "/auth/switch-organization", json={"org_id": org["id"]}, headers={"X-CSRF-Token": _csrf_of(ac)}
            )
            assert switched.status_code == 200, switched.text
            payload = pyjwt.decode(switched.json()["access_token"], options={"verify_signature": False})
            assert payload["active_org_id"] == org["id"]
            cookies = _set_cookies(switched)
            assert cookies[ACCESS_COOKIE_NAME]["value"] == switched.json()["access_token"]
            assert REFRESH_COOKIE_NAME not in cookies  # refresh + CSRF stay untouched on switch
    finally:
        await _discard(app)


@pytest.mark.integration
async def test_cookie_flow_records_ip_and_user_agent(base_settings: Settings, clean_db: None) -> None:
    settings = _cookie_settings(base_settings, auth_cookie_enabled=True, auth_cookie_secure=False)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "cookie-audit@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201
            login = await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})
            assert login.status_code == 200
            factory = app.state.session_factory
            async with factory() as session:
                row = await session.scalar(
                    select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(login.json()["refresh_token"]))
                )
                assert row is not None
                assert row.ip and row.ip != ""
                assert row.user_agent and row.user_agent != ""
    finally:
        await _discard(app)
