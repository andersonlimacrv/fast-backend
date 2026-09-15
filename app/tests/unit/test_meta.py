"""Unit tests: public release metadata (no DB connections made)."""

import json
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from app.core.settings import Settings
from app.main import create_app


@pytest_asyncio.fixture(loop_scope="function")
async def bare_client() -> AsyncIterator[AsyncClient]:
    app = create_app(Settings(secret_key="x" * 32))
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


# "key"/"url" are structural payload words, not secrets — kept out on purpose.
FORBIDDEN = ("secret", "token", "passwd", "password", "smtp", "postgres", "redis", "email", "host", "dsn")


@pytest.mark.unit
async def test_meta_shape_anonymous(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/meta")
    assert resp.status_code == 200
    body = resp.json()
    assert body["app"] == "fast-backend"
    assert body["version"] == "0.1.0"
    assert {m["key"] for m in body["modules"]} == {
        "identity",
        "organization",
        "tenancy",
        "entitlements",
        "projects",
        "audit",
        "health",
        "admin",
        "billing",
    }
    assert all(set(m) == {"key", "enabled"} for m in body["modules"])


@pytest.mark.unit
async def test_meta_flags_follow_settings() -> None:
    app = create_app(Settings(secret_key="x" * 32, admin_enabled=False, billing_enabled=False))
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            resp = await ac.get("/meta")
            flags = {m["key"]: m["enabled"] for m in resp.json()["modules"]}
        assert flags["admin"] is False
        assert flags["billing"] is False
        assert flags["identity"] is True
    finally:
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.unit
async def test_meta_version_follows_setting() -> None:
    app = create_app(Settings(secret_key="x" * 32, app_version="v9.9.9"))
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            resp = await ac.get("/meta")
            assert resp.json()["version"] == "v9.9.9"
    finally:
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.unit
async def test_meta_leaks_nothing(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/meta")
    body = json.dumps(resp.json()).lower()
    assert [w for w in FORBIDDEN if w in body] == []


@pytest.mark.unit
def test_app_version_rejects_blank() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, app_version="   ")
