"""Integration: registration, login, me, password change, logout, switch-org, throttling."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.settings import Settings
from app.tests.conftest import build_app, register_and_login


@pytest.mark.integration
async def test_register_login_me(client: AsyncClient) -> None:
    data = await register_and_login(client)
    assert data["token_type"] == "bearer"
    assert data["access_token"] and data["refresh_token"]

    me = await client.get("/auth/me", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert me.status_code == 200, me.text
    assert me.json()["email"] == data["email"]

    anon = await client.get("/auth/me")
    assert anon.status_code == 401


@pytest.mark.integration
async def test_register_duplicate_and_login_wrong_password(client: AsyncClient) -> None:
    data = await register_and_login(client)
    dup = await client.post("/auth/register", json={"email": data["email"], "password": "Str0ng!Pass"})
    assert dup.status_code == 409

    bad = await client.post("/auth/login", json={"email": data["email"], "password": "Wrong!Pass1"})
    assert bad.status_code == 401


@pytest.mark.integration
async def test_change_password_rotates_credentials(client: AsyncClient) -> None:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    resp = await client.post(
        "/auth/change-password",
        json={"current_password": data["password"], "new_password": "N3w!Str0ngPass"},
        headers=headers,
    )
    assert resp.status_code == 204, resp.text

    old_login = await client.post("/auth/login", json={"email": data["email"], "password": data["password"]})
    assert old_login.status_code == 401

    new_login = await client.post("/auth/login", json={"email": data["email"], "password": "N3w!Str0ngPass"})
    assert new_login.status_code == 200

    # Password change revokes previous access tokens.
    stale = await client.get("/auth/me", headers=headers)
    assert stale.status_code == 401


@pytest.mark.integration
async def test_logout_revokes_refresh_token(client: AsyncClient) -> None:
    data = await register_and_login(client)
    resp = await client.post("/auth/logout", json={"refresh_token": data["refresh_token"]})
    assert resp.status_code == 204

    again = await client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert again.status_code == 401


@pytest.mark.integration
async def test_logout_everywhere_revokes_access_and_refresh(client: AsyncClient) -> None:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    resp = await client.post("/auth/logout-everywhere", headers=headers)
    assert resp.status_code == 204, resp.text

    assert (await client.get("/auth/me", headers=headers)).status_code == 401
    assert (await client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})).status_code == 401


@pytest.mark.integration
async def test_switch_organization_requires_membership(client: AsyncClient) -> None:
    owner = await register_and_login(client)
    owner_headers = {"Authorization": f"Bearer {owner['access_token']}"}
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=owner_headers)).json()

    outsider = await register_and_login(client)
    outsider_headers = {"Authorization": f"Bearer {outsider['access_token']}"}
    denied = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=outsider_headers)
    assert denied.status_code == 403

    switched = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=owner_headers)
    assert switched.status_code == 200, switched.text
    import jwt as pyjwt

    payload = pyjwt.decode(switched.json()["access_token"], options={"verify_signature": False})
    assert payload["active_org_id"] == org["id"]
    assert payload["sub"]


@pytest.mark.integration
async def test_login_throttling(base_settings: Settings, clean_db: None) -> None:
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        login_max_attempts=3,
        login_window_seconds=60,
    )
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "throttled@example.com"
            await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})
            for _ in range(3):
                r = await ac.post("/auth/login", json={"email": email, "password": "bad-bad-bad"})
                assert r.status_code == 401
            blocked = await ac.post("/auth/login", json={"email": email, "password": "bad-bad-bad"})
            assert blocked.status_code == 429
    finally:
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
async def test_login_unknown_email_indistinguishable(client: AsyncClient, application) -> None:
    """Unknown email vs wrong password: same 401 + same body (anti-enumeration)."""
    data = await register_and_login(client)
    ghost = await client.post("/auth/login", json={"email": "ghost-xyz@example.com", "password": "Wrong!Pass1"})
    wrong = await client.post("/auth/login", json={"email": data["email"], "password": "Wrong!Pass1"})
    assert ghost.status_code == wrong.status_code == 401
    assert ghost.json() == wrong.json()


@pytest.mark.integration
async def test_login_unknown_email_spends_argon2(client: AsyncClient, application) -> None:
    """The dummy verify runs on the unknown-email path (no timing shortcut)."""
    calls: list[tuple[str, str]] = []
    real = application.state.auth_service._hasher

    class RecordingHasher:
        def hash(self, password: str) -> str:
            return str(real.hash(password))

        def verify(self, password: str, password_hash: str) -> bool:
            calls.append((password, password_hash))
            return bool(real.verify(password, password_hash))

        def verify_and_update(self, password: str, password_hash: str):  # passthrough
            return real.verify_and_update(password, password_hash)

    application.state.auth_service._hasher = RecordingHasher()
    try:
        resp = await client.post("/auth/login", json={"email": "nobody-here@example.com", "password": "Wrong!Pass1"})
        assert resp.status_code == 401
        assert len(calls) == 1 and calls[0][0] == "Wrong!Pass1"
    finally:
        application.state.auth_service._hasher = real
