"""Stripe adapter: HMAC verification via the official SDK (no network calls here).

`construct_event` is pure crypto (fast, sync) — safe to call inline.
"""

import stripe

from app.core.contracts.payments import ProviderEvent
from app.core.settings import Settings


class StripePaymentProvider:
    name = "stripe"

    def __init__(self, settings: Settings) -> None:
        if not settings.stripe_webhook_secret:
            raise ValueError("stripe backend requires STRIPE_WEBHOOK_SECRET")
        self._secret = settings.stripe_webhook_secret
        self._tolerance = settings.stripe_signature_tolerance

    def parse_webhook(self, *, payload: bytes, signature: str | None, tolerance: int = 300) -> ProviderEvent:
        if not signature:
            raise ValueError("missing Stripe-Signature")
        try:
            event = stripe.Webhook.construct_event(payload, signature, self._secret, tolerance=tolerance or self._tolerance)
        except (ValueError, stripe.SignatureVerificationError) as exc:
            raise ValueError(f"invalid stripe webhook: {exc}") from exc
        if hasattr(event, "to_dict"):
            event = event.to_dict()
        if not isinstance(event, dict):
            raise ValueError("unrecognized stripe event shape")
        data = event.get("data", {}).get("object", {}) if isinstance(event, dict) else {}
        return ProviderEvent(
            provider=self.name,
            event_id=str(event.get("id", "")),
            type=str(event.get("type", "")),
            data=dict(data) if isinstance(data, dict) else {},
        )
