"""Integration: no secret ever lands in audit metadata, outbox leftovers or logs.

Real Postgres (+ in-memory broker for dispatch). Secrets used here are unique
per run so a substring hit is always a real leak, never a coincidence.
"""

import json
import logging
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.settings import Settings
from app.infrastructure.email.renderer import EmailRenderer
from app.infrastructure.email.sender import LogEmailSender
from app.infrastructure.jobs.broker import build_broker
from app.infrastructure.jobs.models import OutboxMessage
from app.infrastructure.jobs.tasks import register_tasks
from app.modules.audit.models import AuditLog
from app.tests.conftest import register_and_login


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _pw(tag: str) -> str:
    return f"Leak-{tag}-{uuid.uuid4().hex[:8]}!9"


@pytest.mark.integration
async def test_secrets_never_reach_audit_or_outbox(application, client: AsyncClient) -> None:
    p1, p2, p3 = _pw("one"), _pw("two"), _pw("three")
    data = await register_and_login(client, password=p1)
    headers = _auth(data["access_token"])

    # change-password flow (old + new secrets in flight)
    resp = await client.post("/auth/change-password", json={"current_password": p1, "new_password": p2}, headers=headers)
    assert resp.status_code == 204, resp.text

    # forgot → reset flow (reset token + newest secret in flight)
    await client.post("/auth/password/forgot", json={"email": data["email"]})
    session_factory = application.state.session_factory
    async with session_factory() as session:
        msgs = (await session.execute(select(OutboxMessage).where(OutboxMessage.type == "email.template"))).scalars().all()
        assert len(msgs) == 1
        token = str(msgs[0].payload["context"]["link"]).split("token=")[1]
    reset = await client.post("/auth/password/reset", json={"token": token, "new_password": p3})
    assert reset.status_code == 204, reset.text

    # dispatch the queued email (redaction happens here)
    outbox = application.state.outbox
    sender = application.state.email_sender
    task = register_tasks(
        build_broker(Settings(secret_key="x" * 32, frontend_url="https://app.example.com"), in_memory=True),
        outbox,
        sender,
        renderer=EmailRenderer(),
    )
    await (await task.kiq("email.template")).wait_result(timeout=30)

    async with session_factory() as session:
        audit_rows = (await session.execute(select(AuditLog))).scalars().all()
        outbox_rows = (await session.execute(select(OutboxMessage))).scalars().all()
    audit_blob = json.dumps([r.audit_metadata for r in audit_rows])
    outbox_blob = json.dumps([r.payload for r in outbox_rows])
    for secret in (p1, p2, p3, token):
        assert secret not in audit_blob, "secret leaked into audit_log.metadata"
        assert secret not in outbox_blob, "secret left in outbox payload after dispatch"
    assert "token=" not in audit_blob


@pytest.mark.unit
async def test_log_sender_never_logs_context(caplog) -> None:
    token = f"opaque-{uuid.uuid4().hex}"
    with caplog.at_level(logging.INFO, logger="app.infrastructure.email.sender"):
        await LogEmailSender().send_template(
            to="user@example.com",
            subject="Password reset",
            template="password_reset",
            context={"name": "user@example.com", "link": f"https://app.example.com/reset?token={token}"},
        )
    assert token not in caplog.text
    assert "reset?token=" not in caplog.text
