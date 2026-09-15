"""SMTP sender (Jinja2 StrictUndefined + aiosmtplib) and log sender for dev default."""

import logging
from email.message import EmailMessage
from pathlib import Path

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, StrictUndefined

from app.core.settings import Settings

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent / "templates"


class SmtpEmailSender:
    """Renders templates then delivers over SMTP. Missing variables fail loudly."""

    def __init__(self, settings: Settings, templates_dir: Path | None = None) -> None:
        self._settings = settings
        self._env = Environment(
            loader=FileSystemLoader(templates_dir or TEMPLATES_DIR),
            undefined=StrictUndefined,
            autoescape=True,
        )

    def render(self, template: str, context: dict) -> tuple[str, str]:
        """Render a template pair (delegates to the shared renderer contract)."""
        from app.infrastructure.email.renderer import EmailRenderer

        return EmailRenderer(templates_dir=TEMPLATES_DIR).render(template, context)

    async def send_template(self, *, to: str, subject: str, template: str, context: dict) -> None:
        html, text = self.render(template, context)
        await self.send(to=to, subject=subject, html=html, text=text)

    async def send(self, *, to: str, subject: str, html: str, text: str | None = None) -> None:
        message = EmailMessage()
        message["From"] = self._settings.smtp_from
        message["To"] = to
        message["Subject"] = subject
        message.set_content(text or "HTML-only message. Use an HTML-capable client.")
        message.add_alternative(html, subtype="html")
        kwargs: dict = {
            "hostname": self._settings.smtp_host,
            "port": self._settings.smtp_port,
            "timeout": 10,
        }
        if self._settings.smtp_username:
            kwargs["username"] = self._settings.smtp_username
            kwargs["password"] = self._settings.smtp_password
        if self._settings.smtp_use_tls:
            kwargs["use_tls"] = True
        await aiosmtplib.send(message, **kwargs)


class LogEmailSender:
    """Dev default: renders nothing, logs instead of delivering. Never used in prod."""

    async def send(self, *, to: str, subject: str, html: str, text: str | None = None) -> None:
        logger.info("email (log backend) to=%s subject=%s html_bytes=%d", to, subject, len(html))

    async def send_template(self, *, to: str, subject: str, template: str, context: dict | None = None) -> None:
        """Log the intent without the context: reset tokens must never hit logs."""
        _ = context
        logger.info("email (log backend) to=%s template=%s subject=%s", to, template, subject)
