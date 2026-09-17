"""Integration: outbox logical-once + claim/retry/dead + taskiq dispatch (real Postgres)."""

import asyncio

import pytest
from sqlalchemy import select

from app.core.settings import Settings
from app.infrastructure.jobs.broker import build_broker
from app.infrastructure.jobs.models import PROCESSED, OutboxMessage
from app.infrastructure.jobs.outbox import OutboxService
from app.infrastructure.jobs.tasks import register_tasks


@pytest.fixture()
def outbox(application) -> OutboxService:
    return OutboxService(settings=application.state.settings, session_factory=application.state.session_factory)


@pytest.mark.integration
async def test_double_enqueue_single_effect(outbox: OutboxService, application) -> None:
    first = await outbox.enqueue(type="email.send", idempotency_key="k-1", payload={"to": "a@b.c"})
    second = await outbox.enqueue(type="email.send", idempotency_key="k-1", payload={"to": "a@b.c"})
    assert first.id == second.id

    factory = application.state.session_factory
    async with factory() as session:
        count = len((await session.execute(select(OutboxMessage))).scalars().all())
    assert count == 1


@pytest.mark.integration
async def test_claim_complete_cycle(outbox: OutboxService) -> None:
    await outbox.enqueue(type="email.send", idempotency_key="k-2", payload={})
    claimed = await outbox.claim(type="email.send")
    assert len(claimed) == 1 and claimed[0].attempts == 1
    assert await outbox.claim(type="email.send") == []
    await outbox.complete(message_id=claimed[0].id)
    row = await outbox.get(message_id=claimed[0].id)
    assert row is not None and row.status == PROCESSED and row.processed_at is not None


@pytest.mark.integration
async def test_concurrent_claims_split_work(outbox: OutboxService) -> None:
    for i in range(6):
        await outbox.enqueue(type="email.send", idempotency_key=f"cc-{i}", payload={})
    first, second = await asyncio.gather(
        outbox.claim(type="email.send", limit=10),
        outbox.claim(type="email.send", limit=10),
    )
    ids = [m.id for m in first] + [m.id for m in second]
    assert sorted(ids) == sorted(set(ids)) and len(ids) == 6


@pytest.mark.integration
async def test_dispatch_retries_then_succeeds(outbox: OutboxService) -> None:
    calls: list[str] = []

    class Flaky:
        async def send(self, *, to: str, subject: str, html: str, text: str | None = None) -> None:
            calls.append(to)
            if len(calls) == 1:
                raise ConnectionError("smtp down")

    task = register_tasks(
        build_broker(Settings(secret_key="x" * 32, frontend_url="https://app.example.com"), in_memory=True), outbox, Flaky()
    )
    await outbox.enqueue(
        type="email.send",
        idempotency_key="k-3",
        payload={"to": "a@b.c", "subject": "s", "html": "<p>h</p>"},
    )
    await (await task.kiq("email.send")).wait_result(timeout=30)
    await (await task.kiq("email.send")).wait_result(timeout=30)
    assert calls == ["a@b.c", "a@b.c"]
    row = await outbox.get(message_id=(await outbox.enqueue(type="email.send", idempotency_key="k-3", payload={})).id)
    assert row is not None and row.status == PROCESSED and row.attempts == 2


@pytest.mark.integration
async def test_dispatch_parks_dead_after_limit(application, base_settings: Settings) -> None:
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        outbox_max_attempts=2,
        frontend_url="https://app.example.com",
    )
    svc = OutboxService(settings=settings, session_factory=application.state.session_factory)

    class AlwaysDown:
        async def send(self, *, to: str, subject: str, html: str, text: str | None = None) -> None:
            raise ConnectionError("smtp down")

    task = register_tasks(build_broker(settings, in_memory=True), svc, AlwaysDown())
    msg = await svc.enqueue(type="email.send", idempotency_key="k-4", payload={"to": "a@b.c"})
    await (await task.kiq("email.send")).wait_result(timeout=30)
    await (await task.kiq("email.send")).wait_result(timeout=30)
    await (await task.kiq("email.send")).wait_result(timeout=30)
    row = await svc.get(message_id=msg.id)
    assert row is not None and row.status == "dead" and row.attempts == 2
