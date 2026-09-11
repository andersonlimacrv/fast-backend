"""BillingService: verified provider events applied once as entitlement grants.

Flow: enqueue (`stripe:{event_id}`) → claim → apply → complete. Redelivery hits
the dedupe/processed path. Unknown prices and missing org mapping complete
WITHOUT effect (never 500-loop Stripe redeliveries).
"""

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.contracts.payments import PaymentProvider, ProviderEvent
from app.core.errors import WebhookVerificationError
from app.core.settings import Settings
from app.infrastructure.jobs.outbox import OutboxService
from app.modules.entitlements.public import EntitlementService

logger = logging.getLogger(__name__)

EVENT_TYPE = "billing.stripe-event"
APPLY_TYPES = {
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
}
CANCEL_TYPES = {"customer.subscription.deleted", "customer.subscription.canceled"}


def extract_price_id(data: dict[str, Any]) -> str | None:
    """Price from explicit metadata (checkout without expansion) or subscription items."""
    metadata = data.get("metadata") or {}
    if metadata.get("price_id"):
        return str(metadata["price_id"])
    try:
        return str(data["items"]["data"][0]["price"]["id"])
    except (KeyError, IndexError, TypeError):
        return None


def org_of(data: dict[str, Any]) -> str | None:
    metadata = data.get("metadata") or {}
    return metadata.get("fast_backend_org_id") or metadata.get("org_id")


class BillingService:
    def __init__(
        self,
        settings: Settings,
        session_factory: async_sessionmaker[AsyncSession],
        provider: PaymentProvider,
        entitlements: EntitlementService,
        outbox: OutboxService,
    ) -> None:
        self._settings = settings
        self._sessions = session_factory
        self._provider = provider
        self._entitlements = entitlements
        self._outbox = outbox

    async def handle_webhook(self, *, payload: bytes, signature: str | None) -> dict[str, str]:
        try:
            event = self._provider.parse_webhook(payload=payload, signature=signature)
        except ValueError as exc:
            raise WebhookVerificationError(str(exc)) from exc
        if not event.event_id:
            raise WebhookVerificationError("event without id")

        row = await self._outbox.enqueue(
            type=EVENT_TYPE,
            idempotency_key=f"stripe:{event.event_id}",
            payload={"event_id": event.event_id, "type": event.type, "data": event.data},
        )
        if row.status == "processed":
            return {"status": "duplicate"}
        claimed = await self._outbox.claim(type=EVENT_TYPE, limit=25)
        if all(m.id != row.id for m in claimed):
            current = await self._outbox.get(message_id=row.id)
            if current is not None and current.status == "processed":
                return {"status": "duplicate"}
            raise RuntimeError("event is being processed concurrently")
        await self._apply(event)
        await self._outbox.complete(message_id=row.id)
        return {"status": "processed"}

    async def _apply(self, event: ProviderEvent) -> None:
        data = event.data
        org_id = org_of(data)
        if event.type in CANCEL_TYPES:
            if not org_id:
                logger.warning("stripe cancel without org mapping: %s", event.event_id)
                return
            key = self._mapped_key(event) or "projects.max"
            current = await self._entitlements.resolve(org_id=org_id, key=key)
            await self._entitlements.upsert(org_id=org_id, key=key, limit=current.limit, enabled=False)
            return
        if event.type not in APPLY_TYPES:
            logger.info("stripe event ignored: %s", event.type)
            return
        if not org_id:
            logger.warning("stripe event without org mapping: %s", event.event_id)
            return
        mapped = self._mapped_key(event, with_limit=True)
        if mapped is None:
            logger.warning("stripe price unmapped for event %s", event.event_id)
            return
        key, limit = mapped
        await self._entitlements.upsert(org_id=org_id, key=key, limit=limit, enabled=True)

    def _mapped_key(self, event: ProviderEvent, with_limit: bool = False):
        price_id = extract_price_id(event.data)
        if not price_id:
            return None
        entry = (self._settings.stripe_price_map or {}).get(price_id)
        if not isinstance(entry, dict) or "key" not in entry:
            return None
        if with_limit:
            return str(entry["key"]), entry.get("limit")
        return str(entry["key"])
