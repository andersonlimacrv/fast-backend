## Why

`POST /auth/register` não tem throttling (`app/modules/identity/service.py:68-80` vs login/refresh/forgot com `service.py:93,120,278,307`): três impactos — (1) enumeração massiva de emails (o 409 `EmailAlreadyRegisteredError` é tradeoff aceito no ADR 0009 para 1 request, não para 1M); (2) cada request queima Argon2id (~centenas de ms de CPU) sem limite → DoS barato; (3) criação de contas em massa. Não há rate-limit global em nenhuma rota (non-goal explícito do hardening) — `/admin/*` e `/auth/me` também sem teto.

## What Changes

- Throttle por `(ip)` no `register` (reusa `LoginThrottler` ou generaliza a chave para `(ip, escopo)`), com 429 genérico indistinguível (sem oráculo: throttled responde igual para email novo/existente).
- Limite global por IP nas rotas sensíveis: `forgot/reset`, `refresh`, `/admin/*` (tetos maiores que os de auth, só anti-abuso, via settings: ex. `RATE_LIMIT_GLOBAL_MAX_ATTEMPTS` + janela).
- 429 com `Retry-After`; erro mapeado em `interfaces/errors.py` (genérico, sem dizer qual limite estourou).
- Depende de `proxy-hops-trusted` para o IP ser real (ordem: proxy primeiro); documentada a dependência, implementável em paralelo com IP de `request.client` + rebase.

## Capabilities

### New Capabilities

- Nenhuma (hardening).

### Modified Capabilities

- `security-headers` (ou a que cobre throttling): teto global anti-abuso.

## Impact

- Alterados: `identity/service.py` (register throttled), throttler (chave por escopo), middleware ou dependência global, `interfaces/errors.py`, settings + `.env.example`, testes (Redis real), docs.
- Legítimo afetado só sob abuso (tetos altos); respostas de erro não distinguem throttled de inválido.

## Non-goals

WAF/CDN, captcha, throttling por user autenticado (só IP), `X-Forwarded-For` confiável (change `proxy-hops-trusted`).

## Acceptance criteria

1. Rajada em `/register` (mesmo IP) → 429 após o teto, idêntico p/ email novo e existente.
2. Rajada em `/admin/*` → 429 sem derrubar uso legítimo (teste com N requests normais passa).
3. `Retry-After` presente; nenhum corpo de erro revela o limite.
4. `pytest -m unit` + integração (Redis real), `ruff`, `mypy` verdes.
