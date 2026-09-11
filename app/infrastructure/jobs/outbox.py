"""OutboxService: enqueue (logical-once), claim (SKIP LOCKED), complete/fail.

Postgres decides; Taskiq/Redis only transports. No HTTPException here.
"""

from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.settings import Settings
from app.infrastructure.jobs.models import DEAD, PENDING, PROCESSED, PROCESSING, OutboxMessage


class OutboxService:
    def __init__(self, settings: Settings, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._settings = settings
        self._sessions = session_factory

    async def enqueue(
        self, *, type: str, idempotency_key: str, payload: dict, aggregate_id: str | None = None
    ) -> OutboxMessage:
        """Insert intent; on key conflict return the existing row (no duplicate effect)."""
        async with self._sessions() as session:
            async with session.begin():
                stmt = (
                    insert(OutboxMessage)
                    .values(
                        type=type,
                        aggregate_id=aggregate_id,
                        idempotency_key=idempotency_key,
                        payload=payload,
                        status=PENDING,
                    )
                    .on_conflict_do_nothing(index_elements=["idempotency_key"])
                    .returning(OutboxMessage)
                )
                row = (await session.execute(stmt)).scalar_one_or_none()
                if row is None:
                    row = await session.scalar(select(OutboxMessage).where(OutboxMessage.idempotency_key == idempotency_key))
                    assert row is not None
            return row

    async def claim(self, *, type: str, limit: int = 10) -> list[OutboxMessage]:
        """Atomically move up to `limit` pending rows to processing (SKIP LOCKED:
        concurrent workers never grab the same row).

        Returned objects are detached with all columns loaded; access no further
        lazy state on them.
        """
        async with self._sessions() as session:
            async with session.begin():
                rows = (
                    await session.execute(
                        select(OutboxMessage)
                        .where(OutboxMessage.type == type, OutboxMessage.status == PENDING)
                        .order_by(OutboxMessage.created_at)
                        .limit(limit)
                        .with_for_update(skip_locked=True)
                    )
                ).scalars()
                claimed = list(rows.all())
                for row in claimed:
                    row.status = PROCESSING
                    row.attempts += 1
            for row in claimed:
                session.expunge(row)
            return claimed

    async def complete(self, *, message_id: str) -> None:
        async with self._sessions() as session:
            async with session.begin():
                await session.execute(
                    update(OutboxMessage)
                    .where(OutboxMessage.id == message_id)
                    .values(status=PROCESSED, processed_at=func.now(), last_error=None)
                )

    async def fail(self, *, message_id: str, error: str) -> str:
        """Record failure; park as `dead` past the attempt limit. Returns new status."""
        async with self._sessions() as session:
            async with session.begin():
                row = await session.get(OutboxMessage, message_id)
                if row is None:
                    return DEAD
                max_attempts = self._settings.outbox_max_attempts
                if row.attempts >= max_attempts:
                    row.status = DEAD
                else:
                    row.status = PENDING
                row.last_error = error[:2000]
                return row.status

    async def get(self, *, message_id: str) -> OutboxMessage | None:
        async with self._sessions() as session:
            return await session.get(OutboxMessage, message_id)
