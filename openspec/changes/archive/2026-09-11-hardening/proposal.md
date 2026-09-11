## Why

Auth-foundation funciona mas o app ainda não está diagnosticável nem defensível em produção: sem security headers, sem CORS por ambiente, sem readiness real e sem enforcement arquitetural (v2 Roadmap Fase 2, RULES §6).

## What Changes

- `app/infrastructure/security/headers.py`: middleware de security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS só com HTTPS) + `TrustedHost` por ambiente.
- CORS explícito por ambiente em `create_app` (origens via settings; `local` permissivo-documentado, demais restritos).
- `GET /readyz`: checa Postgres (`SELECT 1`) e Redis (`PING`); 200 só com ambos ok, 503 caso contrário (distinto do `/healthz` liveness).
- `Settings.model_validator`: rejeita config insegura em `production` (ex.: `secret_key` default, `ENVIRONMENT` incoerente); documenta `bp env validate` equivalente futuro.
- `import-linter` (`contracts/forbidden`): camadas `interfaces → modules → core → infrastructure`, DAG `identity→organization→tenancy→entitlements`, proibição de `modules.*.models|repository|service|dependencies` entre módulos; roda no CI e local (`uv run lint-imports`).
- SAST no CI (`.github/workflows/ci.yml` esqueleto): `ruff + mypy + pytest + bandit + pip-audit + gitleaks` (gates já usados manualmente na Fase 1).

## Capabilities

### New Capabilities

- `security-headers`: headers + trusted hosts + CORS por ambiente.
- `readiness`: `/readyz` com cheques DB+Redis e semântica 200/503.
- `env-validation`: rejeição de config insegura em produção.
- `module-boundaries`: DAG + import-linter como contrato executável.

### Modified Capabilities

- (vazio)

## Impact

- Novos arquivos em `app/infrastructure/security/`, `app/interfaces/` (readyz), contrato `import-linter`; CI esqueleto em `.github/`.
- Comportamento: responses ganham headers; `/readyz` novo; `production` com secret default **não sobe** (**BREAKING** intencional p/ segurança).
- Sem mudança em auth/tenancy/billing.

## Non-goals (v2 §21)

RLS, OTel/Prometheus, WAF, rate-limit global novo, frontend, qualquer feature de negócio.

## Acceptance criteria

1. `GET /` (qualquer rota) retorna os headers exigidos; origem fora da allowlist em `staging/prod` → CORS bloqueado.
2. `/readyz` → 200 com DB+Redis ok; com Redis parado → 503 (teste com container pausado via `docker stop`, marcado `slow`).
3. `ENVIRONMENT=production` + secret default → `create_app` levanta na inicialização (teste unit).
4. `import-linter` falha diante de import proibido simulado (ex.: `modules.identity` importando `modules.organization.models` num teste de arquitetura ou fixture temporária).
5. `bandit` (0 High/Medium), `pip-audit` limpo, `gitleaks` limpo — como na Fase 1.
