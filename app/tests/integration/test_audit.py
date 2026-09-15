"""Integration: audit trail (real Postgres)."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.modules.audit.models import AuditLog
from app.tests.conftest import register_and_login


async def _org_with_token(client: AsyncClient, name: str = "Acme") -> tuple[dict[str, str], dict, dict]:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    org = (await client.post("/organizations", json={"name": name}, headers=headers)).json()
    switched = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=headers)
    assert switched.status_code == 200
    return {"Authorization": f"Bearer {switched.json()['access_token']}"}, org, data


async def _user_id(client: AsyncClient, token: str) -> str:
    me = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    return str(me.json()["id"])


async def _actions(application, org_id: str | None = None) -> list[str]:
    factory = application.state.session_factory
    async with factory() as session:
        stmt = select(AuditLog.action)
        if org_id is not None:
            stmt = stmt.where(AuditLog.tenant_id == org_id)
        return list((await session.execute(stmt)).scalars().all())


@pytest.mark.integration
async def test_login_and_role_change_are_audited(client: AsyncClient, application) -> None:
    owner = await register_and_login(client)
    oh = {"Authorization": f"Bearer {owner['access_token']}"}
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=oh)).json()

    member = await register_and_login(client)
    member_id = await _user_id(client, member["access_token"])
    await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id}, headers=oh)
    await client.patch(f"/organizations/{org['id']}/members/{member_id}", json={"role": "admin"}, headers=oh)

    actions = await _actions(application, org["id"])
    assert "org.create" in actions
    assert "org.member_add" in actions
    assert "org.member_role_change" in actions
    # login happened outside any org
    all_actions = await _actions(application)
    assert "auth.login" in all_actions


@pytest.mark.integration
async def test_audit_read_admin_only(client: AsyncClient) -> None:
    admin_headers, org, _ = await _org_with_token(client)
    member = await register_and_login(client)
    member_id = await _user_id(client, member["access_token"])
    await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id}, headers=admin_headers)
    switched = await client.post(
        "/auth/switch-organization",
        json={"org_id": org["id"]},
        headers={"Authorization": f"Bearer {member['access_token']}"},
    )
    member_headers = {"Authorization": f"Bearer {switched.json()['access_token']}"}

    assert (await client.get(f"/organizations/{org['id']}/audit", headers=member_headers)).status_code == 403
    resp = await client.get(f"/organizations/{org['id']}/audit", headers=admin_headers)
    assert resp.status_code == 200
    rows = resp.json()
    assert {r["action"] for r in rows} >= {"org.create", "org.member_add"}
    assert all(r["tenant_id"] == org["id"] for r in rows)
    assert all(r["ip"] for r in rows)


@pytest.mark.integration
async def test_password_change_and_grant_audited(client: AsyncClient, application) -> None:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    await client.post(
        "/auth/change-password",
        json={"current_password": data["password"], "new_password": "N3w!Str0ngPass"},
        headers=headers,
    )
    # password change revokes previous access tokens: re-login for a fresh one.
    # NOTE: same-second iat edge (documented in dependencies.py) may kill the
    # first token — retry bounded until a live one is issued.
    import time

    fresh_headers = dict(headers)
    for _ in range(5):
        fresh = await client.post("/auth/login", json={"email": data["email"], "password": "N3w!Str0ngPass"})
        assert fresh.status_code == 200
        fresh_headers = {"Authorization": f"Bearer {fresh.json()['access_token']}"}
        if (await client.get("/auth/me", headers=fresh_headers)).status_code == 200:
            break
        time.sleep(1.1)
    headers = fresh_headers
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=headers)).json()
    switched = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=headers)
    admin_headers = {"Authorization": f"Bearer {switched.json()['access_token']}"}
    await client.put(f"/organizations/{org['id']}/grants", json={"key": "projects.max", "limit": 5}, headers=admin_headers)

    actions = await _actions(application, org["id"])
    assert "billing.grant_upsert" in actions
    assert "auth.password_change" in await _actions(application)


@pytest.mark.integration
async def test_global_logout_is_audited(client: AsyncClient, application) -> None:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    assert (await client.post("/auth/logout-everywhere", headers=headers)).status_code == 204
    assert "auth.logout_global" in await _actions(application)


@pytest.mark.integration
async def test_audit_surface_is_append_only() -> None:
    from app.modules.audit.router import router
    from app.modules.audit.service import AuditService

    public = {name for name in dir(AuditService) if not name.startswith("_")}
    # `list_recent` is read-only (root-only route in the admin leaf module);
    # append-only still holds: no update/delete API exists anywhere.
    assert public == {"record", "list_for_org", "list_recent"}
    get_routes = [route for route in router.routes if "GET" in getattr(route, "methods", set())]
    assert len(get_routes) == 1
    assert all(getattr(route, "methods", set()) == {"GET"} for route in router.routes)
