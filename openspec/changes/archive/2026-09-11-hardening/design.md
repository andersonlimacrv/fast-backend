## Context

Pós-`2026-09-11-auth-foundation`: `app/` existe com auth completa, mas sem defesa em profundidade nem observabilidade de deploy. `Settings.environment` já existe (`local` default); faltam: distinção local vs staging/prod, cheques de prontidão e trava arquitetural executável (RULES §4 hoje só existe no papel).

## Goals / Non-Goals

**Goals:**
- Defaults seguros com falha ruidosa em produção mal configurada.
- `/readyz` honesto para orquestradores (Compose `healthcheck`, futuro deploy VPS).
- DAG de módulos verificável por máquina, não só por revisão.

**Non-Goals:**
- Métricas/tracing (Fase 6), RLS, WAF, mudanças em regras de negócio.

## Decisions

1. **Starlette `TrustedHostMiddleware` + middleware próprio de headers** (não dependência nova) — HSTS só quando `request.url.scheme == "https"` ou `environment == "production"`; evita HSTS em HTTP local (irreversível no browser).
2. **CORS via `CORSMiddleware` com allowlist em settings** (`cors_origins: list[str]`, default `[]`; `local` adiciona `http://localhost:*` documentado) — explícito por ambiente, sem wildcard em staging/prod.
3. **`/readyz` checa DB (`SELECT 1` com timeout curto) e Redis (`PING`)** — 503 com corpo `{"db": ..., "redis": ...}` indicando o culpado; `/healthz` segue liveness puro.
4. **`model_validator(mode="after")` em `Settings`** — `environment == "production"` + secret default ou `tenancy_mode` desconhecido → `ValueError` no boot (fail-fast). Não tenta "adivinhar" segredo.
5. **`import-linter` com contratos `layers` + `forbidden`** — camadas: `interfaces | modules.* | core | infrastructure.*`; proibidos: `modules.X → modules.Y.{models,repository,service,dependencies}` fora do DAG, `modules.* → interfaces`, `core → (infrastructure|modules|interfaces)`. Config em `pyproject.toml` (`[tool.importlinter]`), comando `uv run lint-imports` (dep `import-linter` em dev).
6. **CI esqueleto** (`.github/workflows/ci.yml`): jobs `lint (ruff+format+mypy+lint-imports)`, `test (unit)`, `test (integration, docker disponível)`, `security (bandit+pip-audit+gitleaks)` — espelha exatamente os comandos manuais da Fase 1.

## Risks / Trade-offs

- [TrustedHost atrás de proxy sem `trusted_proxy_hops`] → `400` legítimo bloqueado; mitigação: documentar `ForwardedHeaders` + exigir `TRUSTED_HOSTS` por ambiente (Fase 1 não configurou proxy — aceitar e documentar).
- [`/readyz` com timeout curto gera 503 transitório sob spike] → timeouts de 2s + `pool_pre_ping` já ativo; readiness flapping é sinal, não bug.
- [import-linter novo no time] → curva de aprendizado; mitigação: mensagem de erro do contrato cita RULES §4.
- [Alternativa rejeitada: `secure` + lib de headers] → dependência nova p/ 5 headers triviais; não justifica.
