"""Integration: readiness (real Postgres/Redis, plus failure paths)."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.settings import Settings
from app.tests.conftest import build_app


@pytest.mark.integration
async def test_readyz_ok_when_healthy(client: AsyncClient) -> None:
    resp = await client.get("/readyz")
    assert resp.status_code == 200, resp.text
    assert resp.json() == {"status": "ready", "db": "ok", "redis": "ok"}


@pytest.mark.integration
async def test_healthz_ignores_dependencies(client: AsyncClient) -> None:
    assert (await client.get("/healthz")).status_code == 200


@pytest_asyncio.fixture(loop_scope="function")
async def redis_down_client(base_settings: Settings, clean_db: None):
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url="redis://localhost:6390/0",
        login_max_attempts=1000,
    )
    app = build_app(settings)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
@pytest.mark.slow
async def test_readyz_degraded_when_redis_down(redis_down_client: AsyncClient) -> None:
    resp = await redis_down_client.get("/readyz")
    assert resp.status_code == 503
    assert resp.json() == {"status": "degraded", "db": "ok", "redis": "fail"}
    assert (await redis_down_client.get("/healthz")).status_code == 200


@pytest_asyncio.fixture(loop_scope="function")
async def db_down_client(base_settings: Settings, clean_db: None):
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url="postgresql+asyncpg://postgres:postgres@localhost:5433/nodb",
        redis_url=base_settings.redis_url,
        login_max_attempts=1000,
    )
    app = build_app(settings)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
@pytest.mark.slow
async def test_readyz_degraded_when_db_down(db_down_client: AsyncClient) -> None:
    resp = await db_down_client.get("/readyz")
    assert resp.status_code == 503
    assert resp.json()["db"] == "fail"
    assert (await db_down_client.get("/healthz")).status_code == 200
