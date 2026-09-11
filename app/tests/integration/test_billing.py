"""Integration: Stripe webhooks — verified, idempotent, mapped to grants (no Stripe API)."""

import hashlib
import hmac
import json
import time

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from app.core.settings import Settings
from app.modules.entitlements.models import EntitlementGrant
from app.tests.conftest import build_app, register_and_login

SECRET = "whsec_test_secret_for_hmac_signing_ok"
PRICE_PRO = "price_pro_123"


def _signed(payload: bytes, secret: str = SECRET) -> str:
    ts = int(time.time())
    sig = hmac.new(secret.encode(), f"{ts}.".encode() + payload, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"


def _event(event_id: str, type: str, obj: dict) -> bytes:
    return json.dumps({"id": event_id, "type": type, "data": {"object": obj}}).encode()


@pytest_asyncio.fixture(loop_scope="function")
async def billing_client(base_settings: Settings, clean_db: None):
    settings = Settings(
        secret_key=base_settings.secret_key,
        database_url=base_settings.database_url,
        redis_url=base_settings.redis_url,
        billing_enabled=True,
        stripe_webhook_secret=SECRET,
        stripe_price_map={PRICE_PRO: {"key": "projects.max", "limit": 50}},
    )
    app = build_app(settings)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await app.state.throttler.aclose()
    await app.state.session_factory.kw["bind"].dispose()


async def _org_id(client: AsyncClient) -> str:
    data = await register_and_login(client)
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    org = (await client.post("/organizations", json={"name": "Acme"}, headers=headers)).json()
    return str(org["id"])


@pytest.mark.integration
async def test_triple_delivery_single_effect(billing_client: AsyncClient, client: AsyncClient, application) -> None:
    org_id = await _org_id(client)
    payload = _event(
        "evt_123",
        "checkout.session.completed",
        {"id": "cs_1", "metadata": {"fast_backend_org_id": org_id, "price_id": PRICE_PRO}},
    )
    for _ in range(3):
        resp = await billing_client.post(
            "/billing/webhooks/stripe", content=payload, headers={"Stripe-Signature": _signed(payload)}
        )
        assert resp.status_code == 200, resp.text

    factory = application.state.session_factory
    async with factory() as session:
        rows = (await session.execute(select(EntitlementGrant).where(EntitlementGrant.org_id == org_id))).scalars()
        grants = list(rows.all())
    assert [(g.key, g.limit, g.enabled) for g in grants] == [("projects.max", 50, True)]


@pytest.mark.integration
async def test_bad_signature_rejected(billing_client: AsyncClient, application) -> None:
    payload = _event("evt_bad", "checkout.session.completed", {})
    resp = await billing_client.post(
        "/billing/webhooks/stripe", content=payload, headers={"Stripe-Signature": "t=1,v1=deadbeef"}
    )
    assert resp.status_code == 400
    resp2 = await billing_client.post("/billing/webhooks/stripe", content=payload)
    assert resp2.status_code == 400

    from app.infrastructure.jobs.models import OutboxMessage

    factory = application.state.session_factory
    async with factory() as session:
        n = await session.scalar(select(func.count()).select_from(OutboxMessage))
        assert n == 0


@pytest.mark.integration
async def test_cancel_disables_grant(billing_client: AsyncClient, client: AsyncClient, application) -> None:
    org_id = await _org_id(client)
    sub = {"id": "sub_1", "metadata": {"fast_backend_org_id": org_id}, "items": {"data": [{"price": {"id": PRICE_PRO}}]}}
    created = _event("evt_sub_1", "customer.subscription.created", sub)
    assert (
        await billing_client.post("/billing/webhooks/stripe", content=created, headers={"Stripe-Signature": _signed(created)})
    ).status_code == 200

    deleted = _event("evt_sub_2", "customer.subscription.deleted", sub)
    assert (
        await billing_client.post("/billing/webhooks/stripe", content=deleted, headers={"Stripe-Signature": _signed(deleted)})
    ).status_code == 200

    factory = application.state.session_factory
    async with factory() as session:
        grant = await session.scalar(
            select(EntitlementGrant).where(EntitlementGrant.org_id == org_id, EntitlementGrant.key == "projects.max")
        )
        assert grant is not None and grant.enabled is False and grant.limit == 50


@pytest.mark.integration
async def test_unmapped_price_records_without_effect(billing_client: AsyncClient, client: AsyncClient, application) -> None:
    org_id = await _org_id(client)
    payload = _event(
        "evt_nomap",
        "checkout.session.completed",
        {"id": "cs_9", "metadata": {"fast_backend_org_id": org_id, "price_id": "price_unknown"}},
    )
    assert (
        await billing_client.post("/billing/webhooks/stripe", content=payload, headers={"Stripe-Signature": _signed(payload)})
    ).status_code == 200

    from app.infrastructure.jobs.models import OutboxMessage

    factory = application.state.session_factory
    async with factory() as session:
        row = await session.scalar(select(OutboxMessage).where(OutboxMessage.idempotency_key == "stripe:evt_nomap"))
        assert row is not None and row.status == "processed"
        grants = (await session.execute(select(EntitlementGrant).where(EntitlementGrant.org_id == org_id))).scalars()
        assert list(grants.all()) == []


@pytest.mark.integration
async def test_billing_disabled_by_default(client: AsyncClient) -> None:
    payload = _event("evt_x", "checkout.session.completed", {})
    resp = await client.post("/billing/webhooks/stripe", content=payload, headers={"Stripe-Signature": _signed(payload)})
    assert resp.status_code == 404
