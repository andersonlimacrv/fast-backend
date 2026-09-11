"""Stripe webhook route. Raw body first, signature before any parsing."""

from fastapi import APIRouter, Request

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request) -> dict[str, str]:
    service = request.app.state.billing_service
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature")
    result = await service.handle_webhook(payload=payload, signature=signature)
    assert isinstance(result, dict)
    return result
