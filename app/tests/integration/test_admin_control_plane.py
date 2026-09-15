"""Integration: admin control plane RBAC, invariants, audit (real Postgres+Redis)."""

import uuid

import pytest
from httpx import AsyncClient

from app.core.errors import LastRootProtectedError
from app.tests.conftest import register_and_login

REASON = "integration test containment"


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _make_root(application, client: AsyncClient, password: str = "Str0ng!Pass") -> dict:
    email = f"root-{uuid.uuid4().hex[:8]}@example.com"
    await application.state.auth_service.create_superuser(email=email, password=password)
    login = await client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, login.text
    me = await client.get("/auth/me", headers=_auth(login.json()["access_token"]))
    return {"email": email, "password": password, "id": me.json()["id"], **login.json()}


async def _make_staff(application, client: AsyncClient, password: str = "Str0ng!Pass") -> dict:
    email = f"staff-{uuid.uuid4().hex[:8]}@example.com"
    auth = application.state.auth_service
    user = await auth.create_user_by_admin(email=email, password=password)
    await auth.set_staff(user_id=user.id, staff=True)
    login = await client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, login.text
    return {"email": email, "password": password, "id": user.id, **login.json()}


@pytest.mark.integration
async def test_second_superuser_refused(application, client: AsyncClient) -> None:
    auth = application.state.auth_service
    await auth.create_superuser(email="r1@example.com", password="Str0ng!Pass")
    with pytest.raises(LastRootProtectedError):
        await auth.create_superuser(email="r2@example.com", password="Str0ng!Pass")
    assert await auth.count_superusers() == 1


@pytest.mark.integration
async def test_bootstrap_function_single_root(application, client: AsyncClient) -> None:
    from scripts.bootstrap_root import bootstrap

    settings = application.state.settings.model_copy(update={"bootstrap_key": "k" * 32})
    await bootstrap(settings=settings, email="cli-root@example.com", password="Str0ng!Pass", key="k" * 32)
    with pytest.raises(LastRootProtectedError):
        await bootstrap(settings=settings, email="cli-root2@example.com", password="Str0ng!Pass", key="k" * 32)
    with pytest.raises(ValueError):
        await bootstrap(settings=settings, email="cli-root3@example.com", password="Str0ng!Pass", key="wrong-key")
    assert await application.state.auth_service.count_superusers() == 1


@pytest.mark.integration
async def test_overview_rbac_matrix(application, client: AsyncClient) -> None:
    root = await _make_root(application, client)
    staff = await _make_staff(application, client)
    member = await register_and_login(client)
    assert (await client.get("/admin/overview", headers=_auth(root["access_token"]))).status_code == 200
    assert (await client.get("/admin/overview", headers=_auth(staff["access_token"]))).status_code == 200
    assert (await client.get("/admin/overview", headers=_auth(member["access_token"]))).status_code == 403
    assert (await client.get("/admin/overview")).status_code == 401


@pytest.mark.integration
async def test_staff_user_lifecycle_with_reason(application, client: AsyncClient) -> None:
    staff = await _make_staff(application, client)
    headers = _auth(staff["access_token"])
    # missing reason → 422, nothing created
    missing = await client.post("/admin/users", json={"email": "x@example.com", "password": "Str0ng!Pass"}, headers=headers)
    assert missing.status_code == 422
    created = await client.post(
        "/admin/users", json={"email": "x@example.com", "password": "Str0ng!Pass", "reason": REASON}, headers=headers
    )
    assert created.status_code == 201, created.text
    uid = created.json()["id"]
    assert created.json()["is_staff"] is False

    listed = await client.get("/admin/users", headers=headers)
    assert uid in [u["id"] for u in listed.json()]

    disabled = await client.post(f"/admin/users/{uid}/disable", json={"reason": REASON}, headers=headers)
    assert disabled.status_code == 200 and disabled.json()["is_active"] is False
    # disabled account cannot log in
    denied = await client.post("/auth/login", json={"email": "x@example.com", "password": "Str0ng!Pass"})
    assert denied.status_code == 401

    enabled = await client.post(f"/admin/users/{uid}/enable", json={"reason": REASON}, headers=headers)
    assert enabled.status_code == 200 and enabled.json()["is_active"] is True
    # unknown user → 404
    assert (await client.get(f"/admin/users/{'0' * 32}", headers=headers)).status_code == 404

    # audit carries reason+success (root reads global trail; wire key is `audit_metadata` alias)
    root = await _make_root(application, client)
    trail = (await client.get("/admin/audit", headers=_auth(root["access_token"]))).json()
    creates = [r for r in trail if r["action"] == "admin.user_create"]
    assert creates
    meta = creates[0].get("metadata") or creates[0].get("audit_metadata") or {}
    assert meta.get("reason") == REASON and meta.get("success") is True


@pytest.mark.integration
async def test_revoke_sessions_kills_token(application, client: AsyncClient) -> None:
    staff = await _make_staff(application, client)
    victim = await register_and_login(client)
    victim_id = (await client.get("/auth/me", headers=_auth(victim["access_token"]))).json()["id"]
    resp = await client.post(
        f"/admin/users/{victim_id}/revoke-sessions", json={"reason": REASON}, headers=_auth(staff["access_token"])
    )
    assert resp.status_code == 200
    assert (await client.get("/auth/me", headers=_auth(victim["access_token"]))).status_code == 401


@pytest.mark.integration
async def test_staff_cannot_touch_staff_and_root_audit_guarded(application, client: AsyncClient) -> None:
    root = await _make_root(application, client)
    staff = await _make_staff(application, client)
    newcomer = await register_and_login(client)
    nid = (await client.get("/auth/me", headers=_auth(newcomer["access_token"]))).json()["id"]
    # staff granting staff → 403
    assert (
        await client.post(f"/admin/staff/{nid}/grant", json={"reason": REASON}, headers=_auth(staff["access_token"]))
    ).status_code == 403
    # root grants → 200; global audit root-only
    assert (
        await client.post(f"/admin/staff/{nid}/grant", json={"reason": REASON}, headers=_auth(root["access_token"]))
    ).status_code == 200
    assert (await client.get("/admin/audit", headers=_auth(staff["access_token"]))).status_code == 403
    assert (await client.get("/admin/audit", headers=_auth(root["access_token"]))).status_code == 200


@pytest.mark.integration
async def test_last_root_and_self_protection(application, client: AsyncClient) -> None:
    root = await _make_root(application, client)
    headers = _auth(root["access_token"])
    # cannot disable yourself / the only root
    assert (await client.post(f"/admin/users/{root['id']}/disable", json={"reason": REASON}, headers=headers)).status_code in (
        403,
        409,
    )
    # no generic flag-patch route exists
    assert (await client.patch(f"/admin/users/{root['id']}", json={"is_staff": True}, headers=headers)).status_code in (
        404,
        405,
    )


@pytest.mark.integration
async def test_admin_membership_set_remove(application, client: AsyncClient) -> None:
    staff = await _make_staff(application, client)
    headers = _auth(staff["access_token"])
    owner = await register_and_login(client)
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=_auth(owner["access_token"]))).json()
    target = await register_and_login(client)
    tid = (await client.get("/auth/me", headers=_auth(target["access_token"]))).json()["id"]
    created = await client.post(
        "/admin/memberships", json={"org_id": org["id"], "user_id": tid, "role": "member", "reason": REASON}, headers=headers
    )
    assert created.status_code == 201, created.text
    removed = await client.request("DELETE", f"/admin/memberships/{org['id']}/{tid}", json={"reason": REASON}, headers=headers)
    assert removed.status_code == 200, removed.text
    # removing the last owner via admin is refused
    oid = (await client.get("/auth/me", headers=_auth(owner["access_token"]))).json()["id"]
    last = await client.request("DELETE", f"/admin/memberships/{org['id']}/{oid}", json={"reason": REASON}, headers=headers)
    assert last.status_code == 409


@pytest.mark.integration
async def test_admin_fail_closed_without_audit(application, client: AsyncClient) -> None:
    staff = await _make_staff(application, client)
    victim = await register_and_login(client)
    vid = (await client.get("/auth/me", headers=_auth(victim["access_token"]))).json()["id"]
    application.state.audit_service = None
    try:
        resp = await client.post(f"/admin/users/{vid}/disable", json={"reason": REASON}, headers=_auth(staff["access_token"]))
    finally:
        from app.modules.audit.service import AuditService

        application.state.audit_service = AuditService(session_factory=application.state.session_factory)
    assert resp.status_code == 500
