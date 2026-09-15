## 1. Base (infra + settings)

- [ ] 1.1 `infrastructure/auth/password_resets.py` (model `PasswordReset` + repo `create/consume/invalidate_pending/purge`, padrão `refresh_tokens.py`) + migração `0007_password_recovery` + conftest (imports + TRUNCATE)
- [ ] 1.2 `settings.py`: `password_reset_ttl_minutes=60`, `frontend_url` + validação prod + `.env.example` + unit tests
- [ ] 1.3 `core/errors.py`: `PasswordResetError` + `interfaces/errors.py`: 400 genérico

## 2. Auth: fluxos (espelham refresh)

- [ ] 2.1 `AuthenticationService.request_reset` (genérico, throttling, hash-only, outbox `password-reset:{row_id}`) + unit tests
- [ ] 2.2 `AuthenticationService.reset_password` (`FOR UPDATE`, single-use, boundary event completo) + unit tests
- [ ] 2.3 Rotas `POST /auth/password/forgot|reset` (schemas, sem logar segredo, audit só se usuário existe) + integração (happy/reuse/expirado/enumeração/429)

## 3. Email/worker (fronteira infra)

- [ ] 3.1 `infrastructure/email/renderer.py` + `SmtpEmailSender.render` delegando (sem mudar comportamento) + templates `password_reset.html/txt`
- [ ] 3.2 `LogEmailSender.send_template` (sem contexto no log) + `tasks.py` tipo `email.template` + `OutboxService.redact_payload` + testes (broker em memória + Mailpit slow)
- [ ] 3.3 Purge `password.purge` (Taskiq) + teste `slow` opcional

## 4. Admin force-reset (depende de A)

- [ ] 4.1 `AdminService.force_password_reset` (staff+, reason, revoga + gera + audit) + `POST /admin/users/{id}/force-password-reset` → `{status:accepted}` + integração (staff ok / member 403 / sem reason 422)

## 5. Docs + specs

- [ ] 5.1 `specs/recovery/spec.md` (delta) + ADR 0006 → revisado + DEPLOYMENT (+pt-BR: SMTP/Mailpit/`FRONTEND_URL`) + CHANGELOG + registry (triagem `transactional-email`)

## 6. Gates

- [ ] 6.1 `ruff + mypy + lint-imports` verdes
- [ ] 6.2 `pytest -m unit` + `-m integration` (incl. Mailpit slow onde houver docker)
- [ ] 6.3 `bandit -ll` zero Medium+ + `pip-audit` + `gitleaks` + `openspec verify`
