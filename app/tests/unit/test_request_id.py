"""Unit tests: request-id propagation + log shape (no external services)."""

import logging
import uuid

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
async def test_request_id_generated_when_absent(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/healthz")
    rid = resp.headers.get("X-Request-ID", "")
    assert rid and uuid.UUID(hex=rid)


@pytest.mark.unit
async def test_request_id_propagated_when_present(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/healthz", headers={"X-Request-ID": "abc-123"})
    assert resp.headers["X-Request-ID"] == "abc-123"


@pytest.mark.unit
async def test_logs_carry_request_id(bare_client: AsyncClient) -> None:
    records: list[logging.LogRecord] = []

    class Capture(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            records.append(record)

    logger = logging.getLogger("app.request")
    handler = Capture()
    logger.addHandler(handler)
    try:
        await bare_client.get("/healthz", headers={"X-Request-ID": "log-1"})
    finally:
        logger.removeHandler(handler)
    assert records, "expected access log records"
    assert all(getattr(r, "request_id", None) == "log-1" for r in records)
    assert any("/healthz" in r.getMessage() for r in records)
