# oidc-id-token-signature — proposal

## Why

Since `login-social-redesign` (ADR 0014) the `id_token` is only a
consistency check (unverified decode): the real identity proof comes from
the UserInfo call. That was an explicit, documented gap. This change closes
it: full RS256 signature validation against the provider JWKS, per OIDC
Core §3.1.3.7.

## What Changes

- New runtime dep `cryptography` (PyJWT needs it for RS256; BSD/Apache,
  maintained — RULES §11 ok).
- `infrastructure/auth/oidc.py`: fetch `jwks_uri` from discovery (already
  cached), cache keys in memory, refetch once on unknown `kid`
  (rotation); verify signature (`RS256` only — anything else refused),
  `iss`/`aud`/`exp` (+60s leeway)/`nonce`.
- Fail-closed everywhere: no JWKS, unknown alg, bad signature, expired
  token, audience/issuer/nonce mismatch → generic `SocialLoginError`.
- Tests: unit with real generated RSA keys (valid, tampered, wrong
  aud/iss, expired, rotation via refetch, nonce mismatch); existing
  integration suite unchanged (fake provider sends no `id_token`).
- ADR 0015; pointer in ADR 0014; module docstring updated.

## Capabilities

- `social-login`: `id_token` becomes a verified assertion, not a hint.

## Impact

- `pyproject.toml` + `uv.lock` (new dep), `oidc.py`, `test_oidc.py`,
  docs. No settings, no routes, no migration, no contract shape change
  (Protocol untouched).

## Non-goals

- Other algs (`ES256`, `HS256` — refused), JWKS Redis cache (process
  memory + refetch-on-miss is enough), `private_key_jwt` client auth.

## Acceptance criteria

1. Unit: valid RS256 `id_token` passes; tampered/wrong-aud/wrong-iss/
   expired/unknown-alg/nonce-mismatch fail; rotated `kid` passes after
   refetch.
2. `ruff`, `mypy`, `lint-imports`, unit + social integration green;
   `pip-audit` clean (new dep audited).
3. ADR 0015 + pointer in 0014.
