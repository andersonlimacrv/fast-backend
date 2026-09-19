"""Integration: registration throttle + global per-IP ceiling (real Postgres + Redis).

- `POST /auth/register` bursts from one IP hit 429 after the register budget,
  with a body identical for new and existing emails (no enumeration oracle).
- `/admin/*` (and `/auth/me`) bursts hit the global ceiling; legitimate use
  under a high ceiling passes untouched.
- Every 429 carries `Retry-After` and a generic body (no limit values, no email).

Buckets are keyed by IP only, and the suite shares one Redis + one test-client
IP: each test flushes the (real) Redis DB around its bursts so counts never
leak across tests. Never a mock of the throttle path.
"""

import uuid
from typing import Any

import pytest
import redis.asyncio as redis
from httpx import ASGITransport, AsyncClient

from app.core.settings import Settings
from app.tests.conftest import build_app

GENERIC_THROTTLE_BODY = {"detail": "too many attempts"}


def _test_settings(base_settings: Settings, **overrides: Any) -> Settings:
    return Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        frontend_url="https://app.example.com",  # fail-fast is explicit, never global
        **overrides,
    )


def _email(tag: str) -> str:
    return f"{tag}-{uuid.uuid4().hex[:8]}@example.com"


async def _flush_redis(settings: Settings) -> None:
    client = redis.from_url(settings.redis_url, decode_responses=True)
    try:
        await client.flushdb()
    finally:
        await client.aclose()


async def _discard(app: Any) -> None:
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


def _assert_generic_429(resp: Any) -> None:
    assert resp.status_code == 429, resp.text
    assert resp.json() == GENERIC_THROTTLE_BODY
    assert resp.headers.get("retry-after") is not None
    assert resp.headers["retry-after"].strip().isdigit()


@pytest.mark.integration
async def test_register_burst_throttles_identically_for_new_and_existing(base_settings: Settings, clean_db: None) -> None:
    settings = _test_settings(
        base_settings,
        login_max_attempts=1000,
        register_max_attempts=3,
        register_window_seconds=3600,
        rate_limit_global_max_attempts=100000,
    )
    app = build_app(settings)
    try:
        await _flush_redis(settings)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            existing = _email("rl-existing")
            assert (await ac.post("/auth/register", json={"email": existing, "password": "Str0ng!Pass"})).status_code == 201

            # Fresh email: 201 once (success never consumes), then 409s, then 429.
            fresh = _email("rl-fresh")
            assert (await ac.post("/auth/register", json={"email": fresh, "password": "Str0ng!Pass"})).status_code == 201
            for _ in range(3):
                dup = await ac.post("/auth/register", json={"email": fresh, "password": "Str0ng!Pass"})
                assert dup.status_code == 409
            throttled_fresh = await ac.post("/auth/register", json={"email": fresh, "password": "Str0ng!Pass"})
            _assert_generic_429(throttled_fresh)

            # Existing email reaches the same 429 (fresh bucket, same budget).
            await _flush_redis(settings)
            for _ in range(3):
                dup = await ac.post("/auth/register", json={"email": existing, "password": "Str0ng!Pass"})
                assert dup.status_code == 409
            throttled_existing = await ac.post("/auth/register", json={"email": existing, "password": "Str0ng!Pass"})
            _assert_generic_429(throttled_existing)
            assert throttled_existing.json() == throttled_fresh.json()
    finally:
        await _flush_redis(settings)
        await _discard(app)


@pytest.mark.integration
async def test_admin_burst_throttled_but_legitimate_use_passes(base_settings: Settings, clean_db: None) -> None:
    from app.tests.integration.test_admin_control_plane import _make_staff

    settings = _test_settings(
        base_settings,
        login_max_attempts=1000,
        register_max_attempts=10000,
        rate_limit_global_max_attempts=5,
        rate_limit_global_window_seconds=60,
    )
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            staff = await _make_staff(app, ac)
            headers = {"Authorization": f"Bearer {staff['access_token']}"}
            await _flush_redis(settings)  # setup requests must not fund the burst
            for _ in range(5):
                ok = await ac.get("/admin/overview", headers=headers)
                assert ok.status_code == 200, ok.text
            _assert_generic_429(await ac.get("/admin/overview", headers=headers))
    finally:
        await _flush_redis(settings)
        await _discard(app)

    legit = _test_settings(base_settings, login_max_attempts=1000, rate_limit_global_max_attempts=100000)
    legit_app = build_app(legit)
    try:
        async with AsyncClient(transport=ASGITransport(app=legit_app), base_url="http://test") as ac:
            staff = await _make_staff(legit_app, ac)
            headers = {"Authorization": f"Bearer {staff['access_token']}"}
            await _flush_redis(legit)
            for _ in range(20):
                ok = await ac.get("/admin/overview", headers=headers)
                assert ok.status_code == 200, ok.text
    finally:
        await _flush_redis(legit)
        await _discard(legit_app)


@pytest.mark.integration
async def test_me_burst_hits_global_ceiling_with_retry_after(base_settings: Settings, clean_db: None) -> None:
    from app.tests.conftest import register_and_login

    settings = _test_settings(
        base_settings,
        login_max_attempts=1000,
        register_max_attempts=10000,
        rate_limit_global_max_attempts=3,
        rate_limit_global_window_seconds=60,
    )
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            data = await register_and_login(ac)
            headers = {"Authorization": f"Bearer {data['access_token']}"}
            await _flush_redis(settings)  # register+login must not fund the burst
            for _ in range(3):
                ok = await ac.get("/auth/me", headers=headers)
                assert ok.status_code == 200, ok.text
            throttled = await ac.get("/auth/me", headers=headers)
            _assert_generic_429(throttled)
            # The generic body reveals neither the limit nor anything account-specific.
            assert "3" not in throttled.json()["detail"] and "email" not in throttled.json()["detail"].lower()
    finally:
        await _flush_redis(settings)
        await _discard(app)


@pytest.mark.integration
async def test_anonymous_burst_counts_before_auth(base_settings: Settings, clean_db: None) -> None:
    """The global ceiling is a router-level dependency: it runs BEFORE auth.

    Anonymous floods must fill the bucket (429) instead of dying at 401
    uncounted — otherwise unauthenticated scraping has no ceiling.
    """
    settings = _test_settings(
        base_settings,
        login_max_attempts=1000,
        register_max_attempts=10000,
        rate_limit_global_max_attempts=3,
        rate_limit_global_window_seconds=60,
    )
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            await _flush_redis(settings)
            for _ in range(3):
                assert (await ac.get("/auth/me")).status_code == 401
            _assert_generic_429(await ac.get("/auth/me"))
    finally:
        await _flush_redis(settings)
        await _discard(app)
