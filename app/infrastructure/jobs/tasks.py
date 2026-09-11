"""Taskiq tasks: thin wrappers over services. Broker is injected (prod vs test).

The outbox owns durability; tasks only transport + execute. Retry policy lives
here (Taskiq) while attempt accounting lives in the outbox (Postgres).
"""

from taskiq import AsyncBroker

from app.core.contracts.email import EmailSender
from app.infrastructure.jobs.outbox import OutboxService


def register_tasks(broker: AsyncBroker, outbox: OutboxService, email_sender: EmailSender):
    @broker.task(task_name="outbox.dispatch")
    async def dispatch_outbox(message_type: str, limit: int = 10) -> dict[str, int]:
        claimed = await outbox.claim(type=message_type, limit=limit)
        done = 0
        for message in claimed:
            try:
                if message.type == "email.send":
                    payload = message.payload
                    await email_sender.send(
                        to=payload["to"],
                        subject=payload["subject"],
                        html=payload["html"],
                        text=payload.get("text"),
                    )
                else:
                    raise ValueError(f"unknown outbox type: {message.type}")
                await outbox.complete(message_id=message.id)
                done += 1
            except Exception as exc:  # noqa: BLE001 (record-then-retry by design)
                await outbox.fail(message_id=message.id, error=str(exc))
        return {"claimed": len(claimed), "done": done}

    return dispatch_outbox
