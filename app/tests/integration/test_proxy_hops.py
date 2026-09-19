"""Integration: X-Forwarded-For spoof resistance (real Postgres + Redis).

With `TRUSTED_PROXY_HOPS=0` (fail-closed default) a forged header must move
neither the login throttle bucket `(ip, email)` nor `audit_log.ip`; with
`hops=1` the last header entry is honored.
"""

from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.settings import Settings
from app.modules.audit.models import AuditLog
from app.tests.conftest import build_app, register_and_login


def _test_settings(base_settings: Settings, **overrides: Any) -> Settings:
    return Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        frontend_url="https://app.example.com",  # fail-fast is explicit, never global
        **overrides,
    )


async def _latest_audit_ip(application, action: str) -> str | None:
    factory = application.state.session_factory
    async with factory() as session:
        rows = await session.execute(select(AuditLog.ip).where(AuditLog.action == action).order_by(AuditLog.created_at.desc()))
        ip: str | None = rows.scalars().first()
        return ip


@pytest.mark.integration
async def test_spoofed_xff_ignored_with_zero_hops(base_settings: Settings, clean_db: None) -> None:
    settings = _test_settings(base_settings, login_max_attempts=2, login_window_seconds=60)
    assert settings.trusted_proxy_hops == 0
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "spoof@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201

            # Baseline without header: the direct peer IP.
            assert (await ac.post("/auth/login", json={"email": email, "password": "Str0ng!Pass"})).status_code == 200
            direct_ip = await _latest_audit_ip(app, "auth.login")
            assert direct_ip and direct_ip not in ("9.9.9.9", "8.8.8.8", "7.7.7.7", "unknown")

            # A spoofed successful login still audits the direct peer IP
            # (checked before filling the throttle bucket below: a full bucket
            # throttles even correct credentials, by design).
            assert (
                await ac.post(
                    "/auth/login",
                    json={"email": email, "password": "Str0ng!Pass"},
                    headers={"X-Forwarded-For": "9.9.9.9"},
                )
            ).status_code == 200
            assert await _latest_audit_ip(app, "auth.login") == direct_ip

            # Forged headers must not buy fresh throttle buckets: the bucket is keyed
            # on the direct peer, so the 3rd failure (each with a different victim
            # header) is throttled instead of counted per-victim.
            bad = {"email": email, "password": "wrong-wrong-wrong"}
            assert (await ac.post("/auth/login", json=bad, headers={"X-Forwarded-For": "9.9.9.9"})).status_code == 401
            assert (await ac.post("/auth/login", json=bad, headers={"X-Forwarded-For": "8.8.8.8"})).status_code == 401
            blocked = await ac.post("/auth/login", json=bad, headers={"X-Forwarded-For": "7.7.7.7"})
            assert blocked.status_code == 429
    finally:
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
async def test_last_hop_honored_with_one_hop(base_settings: Settings, clean_db: None) -> None:
    settings = _test_settings(base_settings, trusted_proxy_hops=1)
    app = build_app(settings)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            email = "proxied@example.com"
            assert (await ac.post("/auth/register", json={"email": email, "password": "Str0ng!Pass"})).status_code == 201

            payload = {"email": email, "password": "Str0ng!Pass"}
            assert (await ac.post("/auth/login", json=payload, headers={"X-Forwarded-For": "9.9.9.9"})).status_code == 200
            assert await _latest_audit_ip(app, "auth.login") == "9.9.9.9"

            assert (
                await ac.post("/auth/login", json=payload, headers={"X-Forwarded-For": "1.2.3.4, 5.6.7.8"})
            ).status_code == 200
            assert await _latest_audit_ip(app, "auth.login") == "5.6.7.8"
    finally:
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest.mark.integration
async def test_no_header_uses_direct_peer(client: AsyncClient, application) -> None:
    """Behavior without the header is preserved: headerless logins audit a stable, known peer IP."""
    data = await register_and_login(client)
    first = await _latest_audit_ip(application, "auth.login")
    assert first and first != "unknown"

    again = await client.post("/auth/login", json={"email": data["email"], "password": data["password"]})
    assert again.status_code == 200
    assert await _latest_audit_ip(application, "auth.login") == first
