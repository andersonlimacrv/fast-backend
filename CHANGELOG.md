# CHANGELOG — fast-backend

Format: delivered phases (Conventional Commits in git tell the fine-grained story).
Releases are automatic: every PR merged to `main` finalizes `[Unreleased]` into a version (see ADR 0011); never leave entries parked here.
An empty `[Unreleased]` below is the normal idle state — the bot (`auto_release.py --if-needed`) only cuts a release when a behavior change adds an entry; docs-only PRs pass the gate without one (see `release-check.yml`).

> Version convention: tags and sections use the `v` prefix from here on (`v1.1.0`, …).
> The `0.1.0` section below is historical (tag `0.1.0` without prefix) and stays as is.

## [v0.3.2] — 2026-09-19

- **`ci-cookie-sessions`**: `cookie-auth.spec.ts` pula quando a API não emite cookies (`describeWithCookies`, mesmo padrão do `describeWithApi`); job `web` do CI liga `AUTH_COOKIE_ENABLED=true` + `SECURE=false` (http puro) para os 4 testes rodarem lá; `.env.example` sem o falso-positivo `generic-api-key` do gitleaks (comentário `AUTH_COOKIE_DOMAIN` reescrito, 0 achados em tracked).
- **`bootstrap-email-validation`**: `scripts/bootstrap_root.py` rejeita email sem formato válido antes de qualquer I/O de banco (sintaxe via `email-validator`, sem DNS; genérico preservado) — typo no one-shot não vira root permanente; testes unit sem DB + integração (0 users).
- **`bootstrap-ux-fixes`**: `amain` pede a senha 2x (divergência → genérico, exit 1, 0 linhas); `make admin-bootstrap` lê `BOOTSTRAP_KEY` do `.env` sozinho (antes exigia export manual e falhava fechado) e exige email (`ROOT_EMAIL=` ou `email=`) com mensagem de uso; runbook de primeiro uso em `DEPLOYMENT.md` (+pt-BR) + pointer no README (EN+PT).
- **`proxy-hops-trusted`**: `TRUSTED_PROXY_HOPS=0` fail-closed (nunca honra `X-Forwarded-For` por default); helper único de IP real (throttle + `audit.ip` à prova de spoof); teste de spoof com Postgres/Redis reais; runbook Caddy/`ProxyHeadersMiddleware` no `DEPLOYMENT.md`.
- **`rate-limit-global`**: `POST /auth/register` throttled por IP antes do Argon2 (só 409 consome; 201 nunca) com 429 genérico idêntico p/ email novo/existente; teto global anti-abuso por IP em `/auth/*` + `/admin/*` (`RATE_LIMIT_GLOBAL_*`, `REGISTER_*` em settings + `.env.example` + `env-check`); 429 com `Retry-After` (TTL da chave) e corpo genérico; chaves sobre o IP real da `proxy-hops-trusted` (`TRUSTED_PROXY_HOPS`); Redis real nos testes.
- **`auth-cookies-http-only`** (backend; transição dual, flag off por default): `AUTH_COOKIE_ENABLED=true` emite sessão por cookies `HttpOnly`/`SameSite=Lax` (`access_token` `Path=/`, `refresh_token` `Path=/auth`, `Max-Age`=TTLs) em login/refresh/switch e expira no logout; leitura dual header-OU-cookie em `CurrentPrincipal`; mutações por cookie exigem synchronizer `csrf_token` legível ecoado em `X-CSRF-Token` (403 sem ele; `CSRF_ENABLED` kill-switch); `AUTH_COOKIE_SECURE` amarrado a HTTPS (dev-http usa `false`; prod falha sem `Secure`/CSRF); `AUTH_COOKIE_SAMESITE=lax|strict`, `AUTH_COOKIE_DOMAIN` opcional; bodies seguem com tokens (remoção do header-only é change futura; rollback = flag off); `active_org_id` segue não-secreto; runbook em `DEPLOYMENT.md` (+pt-BR), inventário em `PRIVACY.md` (+pt-BR); testes com Postgres/Redis reais.

- **`superuser-coverage`** (test-only, sem runtime): matriz RBAC pinada nas 14 rotas `/admin/*`, lifecycle grant/revoke + auditoria `admin.staff_revoked`, `SuperuserContext` explícito vs tenant comum (Postgres real; `reason` mantém default — Opção B), bootstrap com stdout genérico, 409 estrito (`LastRootProtectedError`); changes em `openspec/changes/superuser-coverage/`.
- **`suite-hermetica`** (test-only, sem runtime): fixture session-autouse isola o `.env` do dev (allowlist + `env_file=None`, teardown restaura); `base_settings` com `frontend_url` explícito; suite verde com e sem `.env` customizado; change em `openspec/changes/suite-hermetica/`.

## [Unreleased]

