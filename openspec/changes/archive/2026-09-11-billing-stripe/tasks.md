## 1. Contrato + adapter + settings

- [x] 1.1 `core/contracts/payments.py` + `infrastructure/payments/stripe_adapter.py` + settings (`BILLING_ENABLED`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MAP`, tolerância) + dep `stripe`

## 2. Módulo billing_stripe

- [x] 2.1 Router `POST /billing/webhooks/stripe` (raw body → verify → outbox → efeito via entitlements) + montagem condicional em `main.py`
- [x] 2.2 Tests: 3x entrega 1 efeito, assinatura inválida 400, deleted desliga, flag-off 404 + suite verde

## 3. Gate + verify

- [x] 3.1 `lint-imports` verde (billing folha)
- [x] 3.2 `ruff + mypy + pytest + bandit + pip-audit + gitleaks` verdes; request `/opsx-verify`
