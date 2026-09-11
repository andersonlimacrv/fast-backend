## 1. Contratos + settings

- [x] 1.1 `app/core/contracts/{email,storage}.py` (Protocolos) + settings (`STORAGE_BACKEND`, `EMAIL_BACKEND`, `SMTP_*`, `S3_*`, `STORAGE_MAX_BYTES`, `TASKS_*`)

## 2. Email

- [x] 2.1 `SmtpEmailSender` (Jinja2 `StrictUndefined` + `aiosmtplib`) + templates base + testes de render
- [x] 2.2 Teste Mailpit end-to-end (`slow`, skip sem docker)

## 3. Storage

- [x] 3.1 `LocalFilesystemStorage` + testes roundtrip (zero infra)
- [x] 3.2 `S3CompatibleStorage` + teste MinIO (`slow`, skip sem docker) + contrato anti-provider no gate

## 4. Jobs + outbox

- [x] 4.1 Model + migration `0004_outbox` + `OutboxService{enqueue,claim,complete,fail}` + taskiq `send_email`
- [x] 4.2 Tests: double-enqueue 1 efeito, retry→processed, falha→dead, `SKIP LOCKED` (2 workers)

## 5. Gate + verify

- [x] 5.1 `lint-imports` verde + wiring em `main.py` por env
- [x] 5.2 `ruff + mypy + pytest + bandit + pip-audit + gitleaks` verdes; request `/opsx-verify`
