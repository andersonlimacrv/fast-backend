"""Integration: tenant isolation IDOR across list/get/update/delete (real Postgres)."""

import pytest
from httpx import AsyncClient

from app.core.settings import Settings
from app.tests.conftest import register_and_login


async def _org_with_token(client: AsyncClient, name: str = "Acme") -> tuple[dict[str, str], dict, dict]:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    org = (await client.post("/organizations", json={"name": name}, headers=headers)).json()
    switched = await client.post("/auth/switch-organization", json={"org_id": org["id"]}, headers=headers)
    assert switched.status_code == 200
    tenant_headers = {"Authorization": f"Bearer {switched.json()['access_token']}"}
    return tenant_headers, org, data


@pytest.mark.integration
async def test_tenant_never_sees_data_from_another_tenant(client: AsyncClient) -> None:
    headers_a, _org_a, _ = await _org_with_token(client, "Org A")
    headers_b, _org_b, _ = await _org_with_token(client, "Org B")

    res_a = (await client.post("/projects", json={"name": "segredo-a"}, headers=headers_a)).json()
    res_b = (await client.post("/projects", json={"name": "segredo-b"}, headers=headers_b)).json()

    # listagem nunca vaza dado de outra org
    listed = (await client.get("/projects", headers=headers_a)).json()
    assert [r["id"] for r in listed] == [res_a["id"]]

    # ataque direto por ID (IDOR) em get/update/delete
    assert (await client.get(f"/projects/{res_b['id']}", headers=headers_a)).status_code == 404
    assert (await client.patch(f"/projects/{res_b['id']}", json={"name": "xx"}, headers=headers_a)).status_code == 404
    assert (await client.delete(f"/projects/{res_b['id']}", headers=headers_a)).status_code == 204
    # ...e o delete cross-tenant não apagou nada
    assert (await client.get(f"/projects/{res_b['id']}", headers=headers_b)).status_code == 200

    # update/delete próprios funcionam
    assert (await client.patch(f"/projects/{res_a['id']}", json={"name": "novo-a"}, headers=headers_a)).status_code == 200
    assert (await client.delete(f"/projects/{res_a['id']}", headers=headers_a)).status_code == 204
    assert (await client.get(f"/projects/{res_a['id']}", headers=headers_a)).status_code == 404


@pytest.mark.integration
async def test_row_mode_requires_claim(client: AsyncClient, base_settings: Settings) -> None:
    from httpx import ASGITransport

    from app.tests.conftest import build_app

    data = await register_and_login(client)
    plain_headers = {"Authorization": f"Bearer {data['access_token']}"}
    # default app runs single-mode in tests; row-mode app must deny claimless tokens.
    # NOTE: same secret AND same database as the issuing app — otherwise the
    # failure happens in authentication (401/500) instead of tenancy (403).
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        tenancy_mode="row",
        frontend_url="https://app.example.com",
    )
    row_app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=row_app), base_url="http://test") as ac:
            assert (await ac.get("/projects", headers=plain_headers)).status_code == 403
    finally:
        await row_app.state.throttler.aclose()
        await row_app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
async def test_single_mode_resolves_sole_org(client: AsyncClient) -> None:
    data = await register_and_login(client)
    plain_headers = {"Authorization": f"Bearer {data['access_token']}"}
    await client.post("/organizations", json={"name": "Solo"}, headers=plain_headers)
    # sem switch (sem active_org_id): single-mode resolve a única org
    assert (await client.get("/projects", headers=plain_headers)).status_code == 200


@pytest.mark.integration
async def test_superuser_read_is_explicit(client: AsyncClient, application) -> None:
    from app.modules.projects.models import Project
    from app.modules.tenancy.public import SuperuserContext, TenantScopedRepository

    headers_a, _org_a, _ = await _org_with_token(client, "Org A")
    created = (await client.post("/projects", json={"name": "segredo-a"}, headers=headers_a)).json()

    factory = application.state.session_factory
    async with factory() as session:
        repo = TenantScopedRepository.scoped_for_superuser(session, SuperuserContext(reason="test"))
        found = await repo.get(Project, created["id"])
        assert found is not None and found.name == "segredo-a"


@pytest.mark.integration
async def test_tenant_repository_has_no_implicit_bypass(client: AsyncClient, application) -> None:
    """Common tenants never read cross-tenant rows; bypass needs an explicit SuperuserContext."""
    from app.modules.projects.models import Project
    from app.modules.tenancy.public import SuperuserContext, TenantScopedRepository

    headers_a, org_a, _ = await _org_with_token(client, "Org A")
    headers_b, org_b, _ = await _org_with_token(client, "Org B")
    created_a = (await client.post("/projects", json={"name": "segredo-a"}, headers=headers_a)).json()
    created_b = (await client.post("/projects", json={"name": "segredo-b"}, headers=headers_b)).json()

    factory = application.state.session_factory
    async with factory() as session:
        # No implicit bypass: tenant_id=None without a superuser is refused.
        with pytest.raises(ValueError):
            TenantScopedRepository(session, None)
        # Tenant-scoped reads stay inside their own tenant (Postgres real).
        repo_a = TenantScopedRepository(session, org_a["id"])
        assert await repo_a.get(Project, created_a["id"]) is not None
        assert await repo_a.get(Project, created_b["id"]) is None
        repo_b = TenantScopedRepository(session, org_b["id"])
        assert await repo_b.get(Project, created_b["id"]) is not None
        assert await repo_b.get(Project, created_a["id"]) is None
        listed_a = await repo_a.list(Project)
        assert [p.id for p in listed_a] == [created_a["id"]]
        # Explicit bypass reads across tenants (reason is always visible at the call site).
        su = TenantScopedRepository.scoped_for_superuser(session, SuperuserContext(reason="containment audit"))
        assert await su.get(Project, created_a["id"]) is not None
        assert await su.get(Project, created_b["id"]) is not None
