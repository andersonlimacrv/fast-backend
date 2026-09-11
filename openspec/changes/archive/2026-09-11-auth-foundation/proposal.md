## Why

Tudo no SaaS (tenancy, RBAC, entitlements, billing) depende de um `CurrentPrincipal` confiável, que hoje não existe — o repo está na Fase 0, sem `app/` (v2 §Top 10 #1, ADR 0001). Esta change cria a fundação de autenticação própria.

## What Changes

- `app/infrastructure/auth/hashing.py`: Argon2id via `pwdlib`; bcrypt aceito somente para verificação/migração de hashes legados; parâmetros calibráveis por env (v2 §3.1, §23.1).
- `app/infrastructure/auth/jwt.py`: emissão/verificação de access token HS256, TTL 10–15min, claims `sub/type/iat/exp/iss/aud/jti/active_org_id`, validação de `iss/aud` (v2 §3.2).
- `app/infrastructure/auth/refresh_tokens.py`: refresh opaco aleatório (nunca JWT), somente hash em Postgres `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by,ip,user_agent}`; rotation obrigatória; reuse de token consumido revoga a family inteira; consumo atomicamente protegido (`SELECT FOR UPDATE` ou `UPDATE ... WHERE used_at IS NULL` na mesma transação) (v2 §3.3–3.4, §23.5).
- `users.tokens_valid_after`: revogação global verificada como `token.iat >= user.tokens_valid_after` **exclusivamente** em `CurrentPrincipal` (v2 §3.5).
- `app/infrastructure/auth/throttling.py`: throttling de login/refresh sobre Redis, chave (ip, email canônico) (v2 §3.1).
- `app/modules/identity/`: `User`, `Credential`, `AuthenticationService{register,login,refresh,logout,change_password,invalidate_tokens}` (nunca levanta `HTTPException`), router `/auth/*`, `CurrentPrincipal`, `public.py` (v2 §3.6–3.7).
- `GET /healthz` mínimo + logging estruturado mínimo (suficiente p/ debugar esta fase; hardening completo é Fase 2).

## Capabilities

### New Capabilities

- `password-hashing`: Argon2id como padrão, bcrypt só migração, calibragem por ambiente.
- `jwt-access`: access token HS256 curto + `CurrentPrincipal` + `tokens_valid_after`.
- `refresh-rotation`: refresh opaco Postgres com rotation, reuse→revoga-family e atomicidade contra concorrência.

### Modified Capabilities

- (vazio — `openspec/specs/` não tem specs ainda)

## Impact

- Novo: `app/` (pacote flat B1, ADR 0004), deps `pwdlib[argon2]`, PyJWT, Testcontainers p/ testes; Alembic migration inicial (`users`, `refresh_tokens`).
- APIs novas: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/healthz`. Sem sessions/cookies no core (extensões futuras, ADR 0001).
- Sem impacto em código existente (não há `app/` ainda).

## Non-goals (v2 §21, recorte da fase)

Sessions/cookies, OAuth, API keys, magic link, passkeys; tenancy completa (`CurrentTenant` é Fase 3); RBAC/entitlements; email; RLS; OTel; Kubernetes/microservices; Stripe.

## Acceptance criteria (todos com Postgres real via Testcontainers, nunca mock)

1. Rotation funciona: `POST /auth/refresh(R1)` → 200 + novo `R2`, `R1.used_at` setado, `R1.replaced_by = R2`.
2. Concorrência: duas requisições simultâneas com o mesmo `R1` → exatamente 1 vence, a outra falha.
3. Reuse: reusar `R1` consumido → 401 e `R2` (antes válido) também passa a 401 (family revogada).
4. `tokens_valid_after`: após `invalidate_tokens`, access tokens antigos com `iat` anterior → 401.
5. Throttling: rajada de logins errados → 429.
