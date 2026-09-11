## 1. Security headers + hosts + CORS

- [x] 1.1 Implement `app/infrastructure/security/headers.py` (headers middleware + HSTS-conditional) and wire `TrustedHostMiddleware` + `CORSMiddleware` in `create_app` with new settings (`trusted_hosts`, `cors_origins`, HSTS flag)
- [x] 1.2 Unit/integration tests: headers present, HSTS only on HTTPS, unknown host → 400, disallowed origin blocked

## 2. Readiness

- [x] 2.1 Implement `GET /readyz` (DB `SELECT 1` + Redis `PING`, 2s timeouts, 200/503 with per-dependency body); keep `/healthz` dependency-free
- [x] 2.2 Tests: ready-ok 200, redis-down 503 (`slow`, container stop/start)

## 3. Env validation

- [x] 3.1 Add `Settings.model_validator` (production + default secret → boot error; unknown tenancy → error) + unit tests (prod-blocks, local-boots)

## 4. Module boundaries gate

- [x] 4.1 Add `import-linter` dev dep + `[tool.importlinter]` contracts (layers + forbidden + DAG) + `uv run lint-imports` script
- [x] 4.2 Negative test proving the gate fails on a forbidden import

## 5. CI skeleton

- [x] 5.1 `.github/workflows/ci.yml` (lint / unit / integration / security jobs mirroring Fase 1 manual gates)

## 6. Verify

- [x] 6.1 `ruff + mypy + lint-imports + pytest + bandit + pip-audit + gitleaks` green; request `/opsx-verify`
