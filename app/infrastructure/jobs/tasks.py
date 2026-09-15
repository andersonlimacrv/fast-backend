"""Taskiq tasks: thin wrappers over services. Broker is injected (prod vs test).

The outbox owns durability; tasks only transport + execute. Retry policy lives
here (Taskiq) while attempt accounting lives in the outbox (Postgres).
"""

from taskiq import AsyncBroker

from app.core.contracts.email import EmailSender
from app.infrastructure.jobs.outbox import OutboxService


def register_tasks(broker: AsyncBroker, outbox: OutboxService, email_sender: EmailSender, renderer=None, auth_service=None):
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
                elif message.type == "email.template":
                    payload = message.payload
                    if renderer is None:
                        from app.infrastructure.email.renderer import EmailRenderer

                        local_renderer = EmailRenderer()
                    else:
                        local_renderer = renderer
                    html, text = local_renderer.render(payload["template"], payload.get("context") or {})
                    await email_sender.send(
                        to=payload["to"],
                        subject=payload["subject"],
                        html=html,
                        text=text,
                    )
                    await outbox.redact_payload(message_id=message.id)
                else:
                    raise ValueError(f"unknown outbox type: {message.type}")
                await outbox.complete(message_id=message.id)
                done += 1
            except Exception as exc:  # noqa: BLE001 (record-then-retry by design)
                await outbox.fail(message_id=message.id, error=str(exc))
        return {"claimed": len(claimed), "done": done}

    @broker.task(task_name="password.purge")
    async def purge_password_resets(limit: int = 1000) -> dict[str, int]:
        if auth_service is None:
            raise ValueError("password.purge requires auth_service")
        purged = await auth_service.purge_expired_resets(limit=limit)
        return {"purged": purged}

    return dispatch_outbox
