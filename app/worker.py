"""Taskiq worker entrypoint: `taskiq worker app.worker:broker`.

Broker and senders come from env (same Settings as the API).
"""

from app.core.settings import Settings
from app.infrastructure.db.session import create_session_factory
from app.infrastructure.email.sender import LogEmailSender, SmtpEmailSender
from app.infrastructure.jobs.broker import build_broker
from app.infrastructure.jobs.outbox import OutboxService
from app.infrastructure.jobs.tasks import register_tasks

settings = Settings()
broker = build_broker(settings)

_session_factory = create_session_factory(settings)
_outbox = OutboxService(settings=settings, session_factory=_session_factory)
_sender = SmtpEmailSender(settings) if settings.email_backend == "smtp" else LogEmailSender()

register_tasks(broker, _outbox, _sender)
