# ADR 0001 — Remoção do crudauth (auth própria)

- Status: aceito
- Data: 2026-09-11
- Referência congelada: `references/implementation_v2.md` § "Decisão registrada" + §3
- Contexto upstream: `copy/benavlabs_crudauth@0.6.0`, `copy/benavlabs_FastAPI-boilerplate@0.19.0` (`backend/src/infrastructure/auth/setup.py` usa só `SessionTransport`)

## Contexto

O Fastro 0.19 delega autenticação ao `crudauth` (sessions server-side como padrão, JWT bearer stateless opcional, `DEFAULT_ALGORITHM="HS256"` em `crudauth/constants.py:24`). O `fast-backend` precisa de JWT+refresh como mecanismo **principal**, sem sessions no core, com controle explícito de rotation, revogação, reuse detection, concorrência e ciclo de vida.

`crudauth` real entrega: `Principal` único transport-agnostic, CSRF synchronizer-token, lockout escalonado, `bcrypt+SHA-256 pre-hash` (`crudauth/utils.py`), `token_version` (época, sem rotation/family), hooks, sudo, multi-device, OAuth Google/GitHub, `EmailSender` port. Não entrega: refresh opaco em Postgres, family/reuse, `tokens_valid_after`, Argon2id, tenancy/org/membership (API keys reais vivem em `backend/src/modules/api_keys/`, não na lib).

## Decisão

Remover `crudauth` do dependency tree. Implementar auth própria:

- `infrastructure/auth/hashing.py`: Argon2id via `pwdlib`; bcrypt só compat/migração; calibrar no hardware-alvo (OWASP).
- `infrastructure/auth/jwt.py`: access 10–15min, HS256, claims `sub/type/iat/exp/iss/aud/jti/active_org_id`, validação de `iss/aud`.
- `infrastructure/auth/refresh_tokens.py`: token opaco aleatório (nunca JWT), só hash em Postgres `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by}`, rotation obrigatória, reuse revoga family inteira, operação atomicamente consumível (`SELECT FOR UPDATE` ou `UPDATE ... WHERE used_at IS NULL` na mesma transação).
- `users.tokens_valid_after`: revogação global via `token.iat >= user.tokens_valid_after`, checado **só** em `CurrentPrincipal`.
- `infrastructure/auth/throttling.py`: reuso do rate-limit Redis, chave (ip, email canônico).
- `modules/identity/`: `User`, `Credential`, `AuthenticationService{register,login,refresh,logout,change_password,invalidate_tokens}` (nunca levanta `HTTPException`), router `/auth/*`, `CurrentPrincipal`, `public.py`.

Sessions/cookies, OAuth, API keys, magic link, passkeys viram extensões futuras sobre `CurrentPrincipal`, não core.

## Consequências

- Recuperamos ownership da camada mais sensível; compensamos com escopo menor que a auth histórica, fronteiras explícitas, TDD desde o início, integração real Postgres via Testcontainers (rotation, concorrência A/B, reuse, revogação).
- Perdemos upstream fixes (lib Alpha, só latest tem fix — `SECURITY.md`) e peças prontas (hooks, sudo, email tokens, OAuth). Reimplementar só o necessário, quando projeto concreto precisar.
- Critério de reversão: se spike de `Transport` custom provar que `BearerTransport + token_version` atende o MVP, esta ADR pode ser revogada por ADR nova (nunca editando esta).
