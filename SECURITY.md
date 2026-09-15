# Security Policy — fast-backend

> 🇬🇧 English | [Português (BR)](SECURITY.pt-BR.md)

## Supported versions

Pre-1.0: only current `main` receives fixes. Always use the latest tag.

| Version | Support |
|---|---|
| `main` / latest tag | ✅ |
| older tags | ❌ |

## Reporting vulnerabilities

**Do not open a public issue.** Report privately:

- Email: keep the repository channel (or GitHub Security Advisories, when enabled).

Include: description, reproduction steps, impact, affected version, and suggested fix, if any.

## Scope

Auth surface (hashing, JWT, refresh/rotation, lockout), tenant isolation, RBAC/entitlements, webhooks (HMAC), secrets in logs/git, dependencies (`pip-audit`), containers (non-root, no exposed data ports).

## Anti-enumeration guarantees

- `POST /auth/login`: unknown email and wrong password return the **same 401 status and body**; unknown emails additionally spend equal Argon2 cost (discarded dummy verify, ADR 0009).
- `POST /auth/password/forgot`: always `202 accepted`; row + email only for existing active users; throttled per (ip, email).
- `POST /auth/password/reset`: reuse/expired/unknown all return the same generic 400.
- Accepted tradeoff: `POST /auth/register` returns 409 for taken emails (registration must say so; mitigated by throttling).
- Proven by `test_auth_flows.py` (indistinguishability + verify-spent) and `test_leak_audit.py` (no secret in audit/outbox/logs). Full inventory in `docs/PRIVACY.md`.

## Expectations

- Acknowledgment within 48h; status update within 1 week.
- Severity-based fixes; coordinated disclosure after the fix.
