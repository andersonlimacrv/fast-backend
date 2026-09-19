## Why

`_client_ip` (`app/modules/identity/router.py:26-30`, duplicado em `app/modules/admin/router.py:112-113`) confia em `X-Forwarded-For` sem verificar proxy confiável: qualquer cliente envia `X-Forwarded-For: <vítima>` e (1) desvia o throttling `(ip, email)` (`app/infrastructure/auth/throttling.py:14-15`) — cada request forjado ganha balde próprio; (2) polui `audit_log.ip` e `refresh_tokens.ip` com IP arbitrário, cegando forense. O design do hardening admite a lacuna (`TrustedHost atrás de proxy sem trusted_proxy_hops → 400` só documentado).

## What Changes

- Nova setting `TRUSTED_PROXY_HOPS: int = 0` (fail-closed: `0` = nunca honrar `X-Forwarded-For`; só honrar os últimos N hops quando `> 0`) + validação (negativo rejeitado; prod exige valor explícito quando atrás de proxy — documentado no runbook).
- `_client_ip` centralizado (um helper em `infrastructure/`, não dois copiados): honra `X-Forwarded-For` só até N hops confiáveis; senão `request.client.host`.
- Alternativa documentada no `DEPLOYMENT.md` (+pt-BR): `ProxyHeadersMiddleware` do `uvicorn[standard]` (já instalado) + `uvicorn --proxy-headers` quando o deploy termina TLS no Caddy.
- Teste de spoof: `X-Forwarded-For: vítima` com `TRUSTED_PROXY_HOPS=0` → throttle/audit usam o IP real; com hops=1 → usam o último hop.

## Capabilities

### New Capabilities

- Nenhuma (hardening de infra).

### Modified Capabilities

- `security-headers` (ou a capability que cobre throttling/audit-ip): IP real garantido.

## Impact

- Alterados: `app/core/settings.py` (nova setting + validação), helper `_client_ip` (moves para `infrastructure/` + 2 routers consomem), `app/tests/**` (spoof), `docs/DEPLOYMENT.md` (+pt-BR), `.env.example`.
- Sem mudança de contrato HTTP; throttling fica *mais* restritivo para quem forjava header (efeito desejado).

## Non-goals

Rate-limit global (change `rate-limit-global`), geolocalização de IP, `forwarded` RFC 7239.

## Acceptance criteria

1. Spoof `X-Forwarded-For` com hops=0 → throttle key e audit usam `request.client.host` (teste dédiado).
2. hops=1 atrás de proxy documentado → usa o último hop.
3. `ruff`, `mypy`, `pytest -m unit` + integração de throttling/audit verdes.
