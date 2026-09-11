## Context

Fase 0: sem `app/`, sem specs prévias. Upstream (`copy/benavlabs_crudauth@0.6.0`) resolve auth com sessions + JWT stateless (`bcrypt+SHA-256`, `token_version` por época, sem rotation/family). A v2 + ADR 0001 exigem auth própria com controle fino (rotation, reuse, atomicidade, revogação global). Layout alvo: pacote flat `app/` (ADR 0004, B1, imports `from app.*`).

## Goals / Non-Goals

**Goals:**
- `CurrentPrincipal` confiável sobre JWT curto + refresh opaco Postgres.
- Superfície mínima auditável: 4 arquivos em `infrastructure/auth/` + `modules/identity/`.

**Non-Goals:**
- Sessions, OAuth, API keys, passkeys; tenancy enforcement; RBAC; email; RLS.

## Decisions

1. **Argon2id via `pwdlib`, bcrypt só verificação** — OWASP p/ sistema novo; bcrypt mantido p/ migrar hashes legados sem forçar reset (v2 §3.1). Parâmetros (memory/time/parallelism) via settings, calibrar no hardware-alvo.
2. **HS256, não RS256** — monólito: ninguém verifica token fora do backend; RS256 só gerenciaria chaves à toa. Troca futura não quebra `CurrentPrincipal` (v2 §3.2).
3. **Refresh opaco em Postgres, não JWT stateless nem Redis** — rotation + family + reuse detection exigem fonte de verdade transacional; Redis não dá atomicidade `check-and-set` + auditoria no mesmo commit (v2 §3.3–3.4).
4. **Atomicidade via `SELECT FOR UPDATE` na transação de refresh** (`UPDATE ... WHERE used_at IS NULL` como alternativa equivalente) — `if not used_at` em memória perde corrida (v2 §3.4).
5. **`tokens_valid_after` em vez de blocklist Redis** — access stateless; `CurrentPrincipal` já carrega o user, comparação `iat >= tokens_valid_after` é grátis; logout global/ban = 1 `UPDATE` (v2 §3.5).
6. **Service nunca levanta `HTTPException`** — `AuthenticationService` retorna erros de domínio (`InvalidCredentialsError`, `RefreshTokenReuseError`); `interfaces/` traduz p/ HTTP (v2 §3.7, RULES §3).
7. **Throttling sobre Redis existente** (chave ip+email canônico) — reusa infra do Fastro em vez de nova tabela.

## Risks / Trade-offs

- [Argon2id custa CPU/memória sob rajada de login] → throttling + parâmetros calibrados + limite de concorrência no endpoint.
- [Clock skew invalida `iat >= tokens_valid_after` no limite] → tolerância pequena documentada (ex. 60s) só nessa comparação, nunca em `exp`.
- [`FOR UPDATE` sob `READ COMMITTED` + pool pequeno pode enfileirar refresh] → transação curta (1 SELECT + 2 writes), sem I/O externo dentro dela.
- [Alternativa rejeitada: manter `crudauth` + estender via `Transport` custom] → manteria lock-in Alpha + sessions como default; spike só se esta change provar custo maior que o benefício (critério de reversão, ADR 0001).

## Migration Plan

Greenfield: `app/` novo + migration Alembic inicial (`users`, `refresh_tokens`). Sem rollback de dados (sem produção). Rollback de deploy = não promover a change (`archive` só após verify).

## Open Questions

- Nenhuma bloqueante (v2 §23 decididas). Calibragem Argon2id fica p/ implementação no hardware-alvo.
