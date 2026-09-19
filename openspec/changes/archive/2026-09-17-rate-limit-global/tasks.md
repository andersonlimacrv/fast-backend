## 1. Throttler por escopo

- [x] 1.1 Generalizar chave `LoginThrottler` para `(ip, escopo)` (`register`, `forgot`, `reset`, `admin`) ou classe irmã com mesmo backend Redis
- [x] 1.2 `register`: check antes do custo Argon2 + record_failure só em falha (nunca em 201), 429 genérico
- [x] 1.3 Settings (`RATE_LIMIT_*` + janelas) + validação + `.env.example`

## 2. Teto global

- [x] 2.1 Dependência/middleware por IP nas rotas `/auth/*` sensíveis + `/admin/*` (tetos altos, anti-abuso)
- [x] 2.2 429 + `Retry-After` via `interfaces/errors.py` (corpo genérico, sem oráculo)

## 3. Testes (Redis real, nunca mock de throttle)

- [x] 3.1 Rajada register mesmo IP → 429 idêntico p/ email novo/existente (anti-enumeração sob throttle)
- [x] 3.2 Rajada admin → 429; uso legítimo (N requests) passa
- [x] 3.3 `Retry-After` presente; corpo não revela limite nem existência de conta

## 4. Gates

- [x] 4.1 `pytest -m unit`, `pytest -m integration` (ou `FB_TEST_NETWORK=host`), `ruff`, `mypy`
- [x] 4.2 Nota de rebase sobre `proxy-hops-trusted` (IP real) registrada no design
