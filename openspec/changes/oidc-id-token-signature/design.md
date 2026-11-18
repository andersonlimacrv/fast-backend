# oidc-id-token-signature — design

## Context

ADR 0014 deferred `id_token` signature validation: the token was decoded
without verification as a consistency check, with identity proof coming
from UserInfo. The deferred hardening is now implemented.

## Decisions

1. **RS256 only.** The overwhelming default for server-side OIDC providers
   (Google, Keycloak, Auth0, Entra ID). Any other `alg` (incl. `none`) is
   refused outright — no algorithm negotiation with the attacker-controlled
   header. Rejected: accepting `ES256` too (more code paths, no deploy
   needs it; easy follow-up).
2. **JWKS from discovery, cached in process, refetch on unknown `kid`.**
   `jwks_uri` comes from the already-cached discovery doc (issuer match
   still enforced). Keys live in process memory; an unknown `kid` triggers
   exactly one refetch (rotation) before failing. Rejected: Redis cache
   (another moving part for data that changes rarely; process cache +
   refetch covers rotation).
3. **Full claim checks in one place.** `jwt.decode` with `audience`,
   `issuer`, `algorithms=["RS256"]`, `leeway=60` (clock skew),
   `require=["exp", "iat", "sub"]`, plus explicit `nonce` comparison
   against the state record. `sub` cross-checked with UserInfo (as before).
4. **New dep `cryptography`.** PyJWT's RS256 path requires it. Pinned
   `cryptography>=44`, audited via `pip-audit` like everything else.
   Rejected: `JWKClient` from PyJWT (hides caching/rotation policy; the
   explicit fetch keeps fail-closed behavior visible).
5. **Errors stay generic.** Every verification failure surfaces as
   `SocialLoginError("identity provider token invalid")` — no oracle
   about which check failed.

## Risks / Trade-offs

- Process-memory JWKS: multi-worker deploys fetch once per worker —
  negligible (one small JSON per IdP).
- `leeway=60` accepts up to 60s of clock skew on expiry; standard practice,
  documented.
- If a provider rotates keys *and* the old key is used in the same second,
  the single refetch may still miss — next login retries fresh. Acceptable.

## Migration

None. Add `cryptography` via `uv lock` + `uv sync`.
