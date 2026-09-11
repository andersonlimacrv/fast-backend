"""EmailSender port. Providers (SMTP now; Resend/SES later) implement this."""

from typing import Protocol


class EmailSender(Protocol):
    async def send(self, *, to: str, subject: str, html: str, text: str | None = None) -> None:
        """Deliver one message. Raises on failure (caller owns retry/idempotency)."""
        ...
