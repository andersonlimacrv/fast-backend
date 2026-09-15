"""Unit tests: security headers, trusted hosts, CORS (no external services)."""

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.core.settings import Settings
from app.main import create_app


@pytest_asyncio.fixture(loop_scope="function")
async def bare_client():
    app = create_app(Settings(secret_key="x" * 32))
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


def _client_for(settings: Settings) -> tuple[AsyncClient, FastAPI]:
    app = create_app(settings)
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test"), app


@pytest.mark.unit
async def test_base_headers_present_no_hsts_on_local_http(bare_client: AsyncClient) -> None:
    resp = await bare_client.get("/healthz")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["Referrer-Policy"] == "same-origin"
    assert "Strict-Transport-Security" not in resp.headers


@pytest.mark.unit
async def test_hsts_in_production() -> None:
    settings = Settings(
        secret_key="x" * 32,
        environment="production",
        trusted_hosts=["example.com"],
        bootstrap_key="y" * 32,
        frontend_url="https://example.com",
    )
    ac, app = _client_for(settings)
    try:
        resp = await ac.get("/healthz", headers={"Host": "example.com"})
        assert "Strict-Transport-Security" in resp.headers
    finally:
        await ac.aclose()
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.unit
async def test_unknown_host_rejected() -> None:
    settings = Settings(secret_key="x" * 32, trusted_hosts=["example.com"])
    ac, app = _client_for(settings)
    try:
        resp = await ac.get("/healthz")  # Host: test
        assert resp.status_code == 400
    finally:
        await ac.aclose()
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.unit
async def test_cors_allowlist() -> None:
    settings = Settings(secret_key="x" * 32, cors_origins=["https://app.example.com"])
    ac, app = _client_for(settings)
    try:
        allowed = await ac.options(
            "/healthz",
            headers={
                "Origin": "https://app.example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert allowed.headers.get("Access-Control-Allow-Origin") == "https://app.example.com"

        denied = await ac.options(
            "/healthz",
            headers={"Origin": "https://evil.example.com", "Access-Control-Request-Method": "GET"},
        )
        assert "Access-Control-Allow-Origin" not in denied.headers
    finally:
        await ac.aclose()
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()
