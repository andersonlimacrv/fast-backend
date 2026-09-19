"""Unit tests: healthz + error mapping (no DB connections made)."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.settings import Settings
from app.main import create_app


@pytest_asyncio.fixture(loop_scope="function")
async def bare_client():
    app = create_app(Settings(secret_key="x" * 32, frontend_url="https://app.example.com"))
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.unit
async def test_healthz_ok(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.unit
async def test_unknown_route_is_json_404(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/nope")
    assert resp.status_code == 404
    assert resp.headers["content-type"].startswith("application/json")
