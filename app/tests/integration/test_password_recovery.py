"""Integration: password recovery self-service + admin force-reset (real Postgres+Redis)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.infrastructure.auth.password_resets import PasswordReset, hash_reset_token
from app.tests.conftest import register_and_login


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _user_id(client: AsyncClient, token: str) -> str:
    me = await client.get("/auth/me", headers=_auth(token))
    return str(me.json()["id"])


@pytest.mark.integration
async def test_forgot_is_generic_and_reset_boundary_event(application, client: AsyncClient) -> None:
    victim = await register_and_login(client)
    # unknown email → same 202, no row, no mail
    ghost = await client.post("/auth/password/forgot", json={"email": "ghost@example.com"})
    assert ghost.status_code == 202 and ghost.json() == {"status": "accepted"}

    mine = await client.post("/auth/password/forgot", json={"email": victim["email"]})
    assert mine.status_code == 202
    session_factory = application.state.session_factory
    async with session_factory() as session:
        rows = (await session.execute(select(PasswordReset))).scalars().all()
        assert len(rows) == 1
        row_id = rows[0].id
    outbox = application.state.outbox
    queued = await outbox.get(
        message_id=(
            await outbox.enqueue(
                type="email.template",
                idempotency_key=f"password-reset:{row_id}",
                payload={"to": victim["email"]},
                aggregate_id=None,
            )
        ).id
    )
    assert queued is not None  # logical-once: same key returns the existing row

    # extract the real token by re-reading the pending row via a second forgot is NOT
    # possible (hash-only); instead simulate dispatch by reading the outbox payload
    async with session_factory() as session:
        from app.infrastructure.jobs.models import OutboxMessage

        msgs = (await session.execute(select(OutboxMessage).where(OutboxMessage.type == "email.template"))).scalars().all()
        assert len(msgs) == 1
        link = msgs[0].payload["context"]["link"]
        token = link.split("token=")[1]
        assert hash_reset_token(token) is not None

    new_password = "N3w!Str0ngPass"
    reset = await client.post("/auth/password/reset", json={"token": token, "new_password": new_password})
    assert reset.status_code == 204, reset.text
    # old session dead (boundary event)
    assert (await client.get("/auth/me", headers=_auth(victim["access_token"]))).status_code == 401
    # reuse dead
    again = await client.post("/auth/password/reset", json={"token": token, "new_password": "Xx!123456"})
    assert again.status_code == 400
    # login with the new password works
    login = await client.post("/auth/login", json={"email": victim["email"], "password": new_password})
    assert login.status_code == 200


@pytest.mark.integration
async def test_forgot_throttling_without_enumeration(application, client: AsyncClient) -> None:
    settings = application.state.settings
    settings.login_max_attempts = 3
    try:
        for _ in range(3):
            resp = await client.post("/auth/password/forgot", json={"email": "burst@example.com"})
            assert resp.status_code == 202
        throttled = await client.post("/auth/password/forgot", json={"email": "burst@example.com"})
        assert throttled.status_code == 429
        # throttling does not reveal existence either
        assert "detail" in throttled.json()
    finally:
        settings.login_max_attempts = 1000


@pytest.mark.integration
async def test_admin_force_reset_returns_accepted_without_secret(application, client: AsyncClient) -> None:
    from app.tests.integration.test_admin_control_plane import _make_staff  # reuse helper

    staff = await _make_staff(application, client)
    victim = await register_and_login(client)
    vid = await _user_id(client, victim["access_token"])
    resp = await client.post(
        f"/admin/users/{vid}/force-password-reset",
        json={"reason": "integration test containment"},
        headers=_auth(staff["access_token"]),
    )
    assert resp.status_code == 200, resp.text
    assert resp.json() == {"status": "accepted"}
    assert "token" not in resp.text and "link" not in resp.text
    # victim sessions revoked immediately
    assert (await client.get("/auth/me", headers=_auth(victim["access_token"]))).status_code == 401
    # member cannot force-reset
    member = await register_and_login(client)
    denied = await client.post(
        f"/admin/users/{vid}/force-password-reset",
        json={"reason": "integration test containment"},
        headers=_auth(member["access_token"]),
    )
    assert denied.status_code == 403


@pytest.mark.integration
async def test_dispatch_redacts_token(application, client: AsyncClient) -> None:
    from app.core.settings import Settings
    from app.infrastructure.email.renderer import EmailRenderer
    from app.infrastructure.jobs.broker import build_broker
    from app.infrastructure.jobs.tasks import register_tasks

    victim = await register_and_login(client, email=f"redact-{uuid.uuid4().hex[:8]}@example.com")
    await client.post("/auth/password/forgot", json={"email": victim["email"]})
    outbox = application.state.outbox
    sender = application.state.email_sender
    task = register_tasks(
        build_broker(Settings(secret_key="x" * 32, frontend_url="https://app.example.com"), in_memory=True),
        outbox,
        sender,
        renderer=EmailRenderer(),
    )
    await (await task.kiq("email.template")).wait_result(timeout=30)
    async with application.state.session_factory() as session:
        from app.infrastructure.jobs.models import OutboxMessage

        msgs = (await session.execute(select(OutboxMessage).where(OutboxMessage.type == "email.template"))).scalars().all()
        assert msgs and all(m.status == "processed" for m in msgs)
        assert all((m.payload.get("redacted") is True and "context" not in m.payload) for m in msgs)
