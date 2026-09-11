"""PaymentProvider port: verify + normalize provider webhooks. No SDK imports here."""

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True)
class ProviderEvent:
    provider: str
    event_id: str
    type: str
    data: dict[str, Any]


class PaymentProvider(Protocol):
    name: str

    def parse_webhook(self, *, payload: bytes, signature: str | None, tolerance: int = 300) -> ProviderEvent:
        """Verify authenticity (HMAC etc.) and normalize. Raises `ValueError` when forged/stale."""
        ...
