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

## Expectations

- Acknowledgment within 48h; status update within 1 week.
- Severity-based fixes; coordinated disclosure after the fix.
