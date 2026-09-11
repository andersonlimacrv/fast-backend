## Why

O core funciona sem billing, mas SaaS real cobra: falta o módulo opcional que traduz eventos Stripe em entitlements, com entrega repetida produzindo efeito único (v2 §10, ROADMAP Fase 7).

## What Changes

- `core/contracts/payments.py`: `PaymentProvider` Protocol (`parse_webhook(payload, signature) -> ProviderEvent{provider,event_id,type,data}`).
- `infrastructure/payments/stripe_adapter.py`: verificação HMAC (`Stripe-Signature`, tolerância de timestamp) via SDK `stripe` (chamadas bloqueantes isoladas em `to_thread`).
- `app/modules/billing_stripe/`: router `POST /billing/webhooks/stripe` (raw body), service aplicando efeitos via `entitlements.public` (folha → core, DAG ok): `checkout.session.completed`/`customer.subscription.created|updated` → upsert grant pelo `STRIPE_PRICE_MAP` (`price_id → {key, limit}`); `customer.subscription.deleted` → `enabled=false`.
- Idempotência reutilizando o outbox (Fase 5): `idempotency_key = "stripe:{event_id}"`, tipo `billing.stripe-event`; duplicata retorna o registro existente sem reaplicar.
- Flag `BILLING_ENABLED=false` (default): router nem é montado; core/testes existentes passam idênticos. Settings validam `billing_enabled → stripe_webhook_secret` obrigatório.
- Sem tabelas novas (outbox + grants já cobrem). Dep: `stripe>=9`.

## Capabilities

### New Capabilities

- `billing`: provider contract + Stripe adapter + webhook idempotente + price map + flag.

### Modified Capabilities

- (vazio)

## Impact

- Novos: `app/core/contracts/payments.py`, `app/infrastructure/payments/`, `app/modules/billing_stripe/`, 1 dep.
- Comportamento existente inalterado (flag default off; teste "core sem billing" o prova).
- Assinatura Stripe verificada com tolerância de 5min contra replay.

## Non-goals (v2 §21)

Checkout/portal hospedado, faturas/boletos, créditos/consumo granular, trials, dunning, multi-provider.

## Acceptance criteria (sem rede Stripe: HMAC local)

1. Mesmo `evt_123` entregue 3x → 200 nas 3, 1 linha de outbox processada, efeito aplicado 1x.
2. Assinatura inválida → 400, nada persistido como processado.
3. `subscription.deleted` → grant `enabled=false`.
4. `BILLING_ENABLED=false` → rota inexistente (404) e suite Fase 1–6 verde.
5. `lint-imports` verde (billing folha).
