"""Integration: organizations, memberships, fixed roles (real Postgres)."""

import pytest
from httpx import AsyncClient

from app.tests.conftest import register_and_login


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.integration
async def test_create_org_makes_owner_with_slug(client: AsyncClient) -> None:
    data = await register_and_login(client)
    resp = await client.post("/organizations", json={"name": "Acme Corp"}, headers=_auth(data["access_token"]))
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["slug"] == "acme-corp"

    mine = await client.get("/organizations", headers=_auth(data["access_token"]))
    assert [o["id"] for o in mine.json()] == [body["id"]]


@pytest.mark.integration
async def test_duplicate_name_mints_unique_slug(client: AsyncClient) -> None:
    data = await register_and_login(client)
    headers = _auth(data["access_token"])
    first = (await client.post("/organizations", json={"name": "Acme"}, headers=headers)).json()
    second_resp = await client.post("/organizations", json={"name": "Acme"}, headers=headers)
    assert second_resp.status_code == 201
    second = second_resp.json()
    assert second["slug"] != first["slug"]
    assert second["slug"].startswith("acme-")


@pytest.mark.integration
async def test_other_org_is_invisible(client: AsyncClient) -> None:
    owner = await register_and_login(client)
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=_auth(owner["access_token"]))).json()

    outsider = await register_and_login(client)
    assert (await client.get(f"/organizations/{org['id']}", headers=_auth(outsider["access_token"]))).status_code == 403
    assert (await client.get("/organizations", headers=_auth(outsider["access_token"]))).json() == []


@pytest.mark.integration
async def test_member_management_rbac(client: AsyncClient) -> None:
    owner = await register_and_login(client)
    oh = _auth(owner["access_token"])
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=oh)).json()

    member = await register_and_login(client)
    member_id = await _user_id(client, member)
    added = await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id}, headers=oh)
    assert added.status_code in (200, 201), added.text
    assert added.json()["role"] == "member"

    mh = _auth(member["access_token"])
    newcomer = await register_and_login(client)
    newcomer_id = await _user_id(client, newcomer)
    # plain member cannot add others
    assert (
        await client.post(f"/organizations/{org['id']}/members", json={"user_id": newcomer_id}, headers=mh)
    ).status_code == 403
    # unknown user → 404
    assert (await client.post(f"/organizations/{org['id']}/members", json={"user_id": "0" * 32}, headers=oh)).status_code == 404


async def _user_id(client: AsyncClient, data: dict) -> str:
    me = await client.get("/auth/me", headers=_auth(data["access_token"]))
    return str(me.json()["id"])


@pytest.mark.integration
async def test_last_owner_protected(client: AsyncClient) -> None:
    owner = await register_and_login(client)
    oh = _auth(owner["access_token"])
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=oh)).json()
    owner_id = await _user_id(client, owner)

    # cannot remove the last owner
    assert (await client.delete(f"/organizations/{org['id']}/members/{owner_id}", headers=oh)).status_code == 409
    # cannot demote the last owner
    assert (
        await client.patch(f"/organizations/{org['id']}/members/{owner_id}", json={"role": "member"}, headers=oh)
    ).status_code == 409

    # promote a second owner, then removal works
    member = await register_and_login(client)
    member_id = await _user_id(client, member)
    await client.post(f"/organizations/{org['id']}/members", json={"user_id": member_id, "role": "admin"}, headers=oh)
    assert (
        await client.patch(f"/organizations/{org['id']}/members/{member_id}", json={"role": "owner"}, headers=oh)
    ).status_code == 200
    assert (await client.delete(f"/organizations/{org['id']}/members/{owner_id}", headers=oh)).status_code == 204
