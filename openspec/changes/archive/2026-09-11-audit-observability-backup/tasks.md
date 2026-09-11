## 1. Contratos + audit module

- [x] 1.1 `core/contracts/audit.py` (AuditRecorder) + `modules/audit/` (model, service, public, router admin) + migration `0005_audit`
- [x] 1.2 Injetar recorder em auth/org/entitlements services via `main.py` + testes de trilha (login, papel, grant)

## 2. Observabilidade

- [x] 2.1 Middleware request-id + logging factory com contextvars + testes (header ecoado, shape do log)

## 3. Backup

- [x] 3.1 `scripts/backup.py` (dump→gzip→enc→destino, prune, sem passphrase = erro) + testes unitários (nomeação, prune)
- [x] 3.2 Restore drill de verdade (`slow`, banco dedicado)

## 4. Gate + verify

- [x] 4.1 `lint-imports` verde (audit folha)
- [x] 4.2 `ruff + mypy + pytest + bandit + pip-audit + gitleaks` verdes; request `/opsx-verify`
