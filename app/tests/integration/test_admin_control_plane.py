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
@pytest.mark.parametrize(
    ("route", "expected_root", "expected_staff"),
    [
        pytest.param("overview", 200, 200, id="overview"),
        pytest.param("list-users", 200, 200, id="list-users"),
        pytest.param("get-user", 200, 200, id="get-user"),
        pytest.param("create-user", 201, 201, id="create-user"),
        pytest.param("disable", 200, 200, id="disable"),
        pytest.param("enable", 200, 200, id="enable"),
        pytest.param("revoke-sessions", 200, 200, id="revoke-sessions"),
        pytest.param("force-password-reset", 200, 200, id="force-password-reset"),
        pytest.param("grant", 200, 403, id="grant"),
        pytest.param("revoke", 200, 403, id="revoke"),
        pytest.param("list-orgs", 200, 200, id="list-orgs"),
        pytest.param("set-membership", 201, 201, id="set-membership"),
        pytest.param("remove-membership", 200, 200, id="remove-membership"),
        pytest.param("audit", 200, 403, id="audit"),
    ],
)
async def test_admin_rbac_matrix_by_route(
    application, client: AsyncClient, route: str, expected_root: int, expected_staff: int
) -> None:
    """Pin RBAC per /admin/* route (oracle: app/modules/admin/router.py:25-203).

    root → expected_root, staff → expected_staff (200/201 or 403 on root-only
    routes), member → 403, anonymous → 401. Mutating calls run anon → member →
    staff → root so the privileged mutation lands last and cannot mask a denial.
    """
    root = await _make_root(application, client)
    staff = await _make_staff(application, client)
    member = await register_and_login(client)
    victim = await register_and_login(client)
    victim_id = (await client.get("/auth/me", headers=_auth(victim["access_token"]))).json()["id"]
    root_h, staff_h = _auth(root["access_token"]), _auth(staff["access_token"])
    member_h = _auth(member["access_token"])

    async def _status(method: str, url: str, headers: dict[str, str] | None, body: dict | None) -> int:
        resp = await client.request(method, url, json=body, headers=headers)
        return resp.status_code

    if route == "create-user":
        # Same email twice would 409 on the second privileged call: unique per role.
        async def _create(headers: dict[str, str] | None) -> int:
            body = {
                "email": f"matrix-{uuid.uuid4().hex[:8]}@example.com",
                "password": "Str0ng!Pass",
                "reason": REASON,
            }
            return await _status("POST", "/admin/users", headers, body)

        assert await _create(None) == 401
        assert await _create(member_h) == 403
        assert await _create(staff_h) == expected_staff
        assert await _create(root_h) == expected_root
        return

    if route == "remove-membership":
        owner = await register_and_login(client)
        org = (await client.post("/organizations", json={"name": "Matrix"}, headers=_auth(owner["access_token"]))).json()
        targets: dict[str, str] = {}
        for key in ("for-root", "for-staff", "denied"):
            t = await register_and_login(client)
            tid = (await client.get("/auth/me", headers=_auth(t["access_token"]))).json()["id"]
            targets[key] = tid
            created = await client.post(
                "/admin/memberships",
                json={"org_id": org["id"], "user_id": tid, "role": "member", "reason": REASON},
                headers=root_h,
            )
            assert created.status_code == 201, created.text
        reason_body: dict | None = {"reason": REASON}
        denied_url = f"/admin/memberships/{org['id']}/{targets['denied']}"
        staff_url = f"/admin/memberships/{org['id']}/{targets['for-staff']}"
        root_url = f"/admin/memberships/{org['id']}/{targets['for-root']}"
        assert await _status("DELETE", denied_url, None, reason_body) == 401
        assert await _status("DELETE", denied_url, member_h, reason_body) == 403
        assert await _status("DELETE", staff_url, staff_h, reason_body) == expected_staff
        assert await _status("DELETE", root_url, root_h, reason_body) == expected_root
        return

    # --- shared setup for the remaining routes ---
    grant_target_id = victim_id
    revoke_target = await _make_staff(application, client)
    owner_for_membership: dict | None = None
    membership_org_id: str | None = None
    if route == "set-membership":
        owner_for_membership = await register_and_login(client)
        membership_org_id = (
            await client.post("/organizations", json={"name": "Matrix"}, headers=_auth(owner_for_membership["access_token"]))
        ).json()["id"]

    method, url, body = _matrix_request(
        route,
        victim_id=victim_id,
        grant_target_id=grant_target_id,
        revoke_target_id=revoke_target["id"],
        org_id=membership_org_id,
    )
    assert await _status(method, url, None, body) == 401
    assert await _status(method, url, member_h, body) == 403
    got_staff = await _status(method, url, staff_h, body)
    assert got_staff == expected_staff, f"{route} staff: {got_staff} != {expected_staff}"
    got_root = await _status(method, url, root_h, body)
    assert got_root == expected_root, f"{route} root: {got_root} != {expected_root}"
    if route == "force-password-reset" and expected_root == 200:
        # Pin the accepted shape (no secret ever travels here — change B).
        fresh = await register_and_login(client)
        fresh_id = (await client.get("/auth/me", headers=_auth(fresh["access_token"]))).json()["id"]
        resp = await client.post(f"/admin/users/{fresh_id}/force-password-reset", json={"reason": REASON}, headers=root_h)
        assert resp.json() == {"status": "accepted"}
        assert "token" not in resp.text and "link" not in resp.text


def _matrix_request(
    route: str, *, victim_id: str, grant_target_id: str, revoke_target_id: str, org_id: str | None
) -> tuple[str, str, dict | None]:
    """Map a matrix route id to (method, url, json body). Oracle: admin/router.py."""
    reasoned: dict = {"reason": REASON}
    if route == "overview":
        return ("GET", "/admin/overview", None)
    if route == "list-users":
        return ("GET", "/admin/users", None)
    if route == "get-user":
        return ("GET", f"/admin/users/{victim_id}", None)
    if route == "disable":
        return ("POST", f"/admin/users/{victim_id}/disable", reasoned)
    if route == "enable":
        return ("POST", f"/admin/users/{victim_id}/enable", reasoned)
    if route == "revoke-sessions":
        return ("POST", f"/admin/users/{victim_id}/revoke-sessions", reasoned)
    if route == "force-password-reset":
        return ("POST", f"/admin/users/{victim_id}/force-password-reset", reasoned)
    if route == "grant":
        return ("POST", f"/admin/staff/{grant_target_id}/grant", reasoned)
    if route == "revoke":
        return ("POST", f"/admin/staff/{revoke_target_id}/revoke", reasoned)
    if route == "list-orgs":
        return ("GET", "/admin/organizations", None)
    if route == "set-membership":
        assert org_id is not None
        return ("POST", "/admin/memberships", {"org_id": org_id, "user_id": victim_id, "role": "member", **reasoned})
    if route == "audit":
        return ("GET", "/admin/audit", None)
    raise AssertionError(f"unknown matrix route: {route}")


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
    meta = creates[0]["audit_metadata"]
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
async def test_staff_revoke_lifecycle_and_audit(application, client: AsyncClient) -> None:
    """revoke: staff→403, root→200, revoke-of-root→409 at the service boundary + audit."""
    root = await _make_root(application, client)
    staff = await _make_staff(application, client)
    newcomer = await register_and_login(client)
    nid = (await client.get("/auth/me", headers=_auth(newcomer["access_token"]))).json()["id"]
    root_h, staff_h = _auth(root["access_token"]), _auth(staff["access_token"])

    # staff cannot revoke (root-only route) — target untouched
    assert (await client.post(f"/admin/staff/{nid}/revoke", json={"reason": REASON}, headers=staff_h)).status_code == 403
    # root grants, then revokes → 200 and the flag actually flips
    assert (await client.post(f"/admin/staff/{nid}/grant", json={"reason": REASON}, headers=root_h)).status_code == 200
    revoked = await client.post(f"/admin/staff/{nid}/revoke", json={"reason": REASON}, headers=root_h)
    assert revoked.status_code == 200, revoked.text
    assert revoked.json()["is_staff"] is False

    # revoking staff from the root hits the last-root guard (identity/service.py:258-259)
    auth = application.state.auth_service
    with pytest.raises(LastRootProtectedError):
        await auth.set_staff(user_id=root["id"], staff=False)

    # audit carries reason+success for the revoke (mirror of admin.user_create)
    trail = (await client.get("/admin/audit", headers=root_h)).json()
    revokes = [r for r in trail if r["action"] == "admin.staff_revoked"]
    assert revokes
    meta = revokes[0]["audit_metadata"]
    assert meta.get("reason") == REASON and meta.get("success") is True


@pytest.mark.integration
async def test_self_grant_and_self_revoke_refused(application, client: AsyncClient) -> None:
    """Privilege self-changes require a second accountable actor (admin/service.py:112,121)."""
    root = await _make_root(application, client)
    root_h = _auth(root["access_token"])
    assert (await client.post(f"/admin/staff/{root['id']}/grant", json={"reason": REASON}, headers=root_h)).status_code == 403
    assert (await client.post(f"/admin/staff/{root['id']}/revoke", json={"reason": REASON}, headers=root_h)).status_code == 403


@pytest.mark.integration
async def test_last_root_and_self_protection(application, client: AsyncClient) -> None:
    root = await _make_root(application, client)
    staff = await _make_staff(application, client)
    root_h, staff_h = _auth(root["access_token"]), _auth(staff["access_token"])
    # self-disable is self-protection (403 takes precedence over the last-root guard)
    self_off = await client.post(f"/admin/users/{root['id']}/disable", json={"reason": REASON}, headers=root_h)
    assert self_off.status_code == 403
    # staff disabling the only root is the last-root guard → strict 409
    last_root = await client.post(f"/admin/users/{root['id']}/disable", json={"reason": REASON}, headers=staff_h)
    assert last_root.status_code == 409
    # no generic flag-patch route exists (path matches GET /admin/users/{id} → 405, never PATCH)
    assert (await client.patch(f"/admin/users/{root['id']}", json={"is_staff": True}, headers=root_h)).status_code == 405


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
