"""Integration: RBAC + entitlements (real Postgres)."""

import pytest
from httpx import AsyncClient

from app.tests.conftest import register_and_login


async def _owner_with_org(client: AsyncClient, name: str = "Acme") -> tuple[dict[str, str], dict, dict]:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    org = (await client.post("/organizations", json={"name": name}, headers=headers)).json()
    switched = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=headers)
    assert switched.status_code == 200
    return {"Authorization": f"Bearer {switched.json()['access_token']}"}, org, data


async def _user_id(client: AsyncClient, token: str) -> str:
    me = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    return str(me.json()["id"])


@pytest.mark.integration
async def test_member_cannot_delete_admin_can(client: AsyncClient) -> None:
    admin_headers, org, owner = await _owner_with_org(client)
    created = await client.post("/projects", json={"name": "p1"}, headers=admin_headers)
    assert created.status_code == 201

    member = await register_and_login(client)
    member_id = await _user_id(client, member["access_token"])
    await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id}, headers=admin_headers)
    switched = await client.post(
        "/auth/switch-organization",
        json={"org_id": org["id"]},
        headers={"Authorization": f"Bearer {member['access_token']}"},
    )
    member_headers = {"Authorization": f"Bearer {switched.json()['access_token']}"}

    assert (await client.delete(f"/projects/{created.json()['id']}", headers=member_headers)).status_code == 403
    assert (await client.delete(f"/projects/{created.json()['id']}", headers=admin_headers)).status_code == 204


@pytest.mark.integration
async def test_quota_enforced_from_grant(client: AsyncClient) -> None:
    admin_headers, org, _ = await _owner_with_org(client)
    put = await client.put(
        f"/organizations/{org['id']}/grants",
        json={"key": "projects.max", "limit": 1},
        headers=admin_headers,
    )
    assert put.status_code == 200
    assert put.json()["limit"] == 1
    assert put.json()["from_default"] is False

    assert (await client.post("/projects", json={"name": "p1"}, headers=admin_headers)).status_code == 201
    assert (await client.post("/projects", json={"name": "p2"}, headers=admin_headers)).status_code == 403


@pytest.mark.integration
async def test_disabled_flag_denies_access(client: AsyncClient) -> None:
    admin_headers, org, _ = await _owner_with_org(client)
    await client.post("/projects", json={"name": "p1"}, headers=admin_headers)
    await client.put(
        f"/organizations/{org['id']}/grants",
        json={"key": "projects.access", "enabled": False},
        headers=admin_headers,
    )
    assert (await client.get("/projects", headers=admin_headers)).status_code == 403


@pytest.mark.integration
async def test_grants_admin_only_and_defaults_listed(client: AsyncClient) -> None:
    admin_headers, org, owner = await _owner_with_org(client)
    member = await register_and_login(client)
    member_id = await _user_id(client, member["access_token"])
    await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id}, headers=admin_headers)
    switched = await client.post(
        "/auth/switch-organization",
        json={"org_id": org["id"]},
        headers={"Authorization": f"Bearer {member['access_token']}"},
    )
    member_headers = {"Authorization": f"Bearer {switched.json()['access_token']}"}

    assert (await client.get(f"/organizations/{org['id']}/grants", headers=member_headers)).status_code == 403
    assert (
        await client.put(
            f"/organizations/{org['id']}/grants",
            json={"key": "projects.max", "limit": 5},
            headers=member_headers,
        )
    ).status_code == 403

    put = await client.put(
        f"/organizations/{org['id']}/grants",
        json={"key": "projects.max", "limit": 5},
        headers=admin_headers,
    )
    assert put.status_code == 200

    listed = await client.get(f"/organizations/{org['id']}/grants", headers=admin_headers)
    assert listed.status_code == 200
    by_key = {g["key"]: g for g in listed.json()}
    assert by_key["projects.max"] == {
        "org_id": org["id"],
        "key": "projects.max",
        "limit": 5,
        "enabled": True,
        "from_default": False,
    }
    assert by_key["projects.access"]["from_default"] is True
