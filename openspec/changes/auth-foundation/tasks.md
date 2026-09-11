## 1. Scaffold app/ package (B1)

- [ ] 1.1 Create `app/` flat package (`__init__.py`, `core/`, `infrastructure/auth/`, `modules/identity/`, `tests/{unit,integration,e2e,fixtures}/`, `migrations/`) with `pyproject.toml` (deps: fastapi, sqlalchemy[asyncio], asyncpg, pydantic v2, pydantic-settings, alembic, `pwdlib[argon2]`, PyJWT, redis, pytest + pytest-asyncio + testcontainers) and tooling (`ruff` line-length 128 `known-first-party=["app"]`, `mypy`, `asyncio_mode=auto`)
- [ ] 1.2 Add `app/core/{errors.py,settings.py}` with domain exceptions (`InvalidCredentialsError`, `RefreshTokenReuseError`) — no `HTTPException` in domain

## 2. Hashing + JWT

- [ ] 2.1 Implement `app/infrastructure/auth/hashing.py` (Argon2id default via `pwdlib`, bcrypt verify-only, settings-driven cost) + unit tests
- [ ] 2.2 Implement `app/infrastructure/auth/jwt.py` (HS256 issue/verify, claims `sub/type/iat/exp/iss/aud/jti/active_org_id`, `iss/aud` validation) + unit tests

## 3. Refresh rotation (Postgres)

- [ ] 3.1 Add Alembic initial migration (`users{tokens_valid_after}`, `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by,ip,user_agent}`)
- [ ] 3.2 Implement `app/infrastructure/auth/refresh_tokens.py` (opaque mint, hash-only store, transactional rotation with `SELECT FOR UPDATE`, reuse → revoke family) + `throttling.py` (Redis, key ip+email)
- [ ] 3.3 Implement `modules/identity/` (`models.py`, `service.py AuthenticationService`, `router.py /auth/*`, `dependencies.py CurrentPrincipal` with `iat >= tokens_valid_after`, `public.py`)

## 4. Integration tests (Testcontainers Postgres+Redis, never mocks)

- [ ] 4.1 `test_refresh_reuse_revokes_entire_family` (R1 → R2 ok; reuse R1 → 401; R2 → 401)
- [ ] 4.2 Concurrency test (two simultaneous `POST /auth/refresh(R1)` → exactly one 200)
- [ ] 4.3 `tokens_valid_after` invalidation + login throttling → 429 + `/healthz` smoke

## 5. Verify

- [ ] 5.1 `ruff + mypy + pytest -m "unit or integration"` green; `bandit -r app`, `pip-audit`, `gitleaks` clean; request `/opsx-verify`
