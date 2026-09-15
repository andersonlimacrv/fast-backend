## Why

Zero menções a LGPD no repo; anti-enumeração provada só no forgot; nenhum teste varre `audit.metadata`/logs contra segredos; skills de frontend/a11y seguem só triadas. A landing pública e o login two-step ampliam a superfície que precisa de garantias escritas.

## What Changes

- **Docs (usuário, EN + pt-BR):** `docs/PRIVACY.md` (+`.pt-BR.md`): inventário de dados, finalidade/base legal, retenção (purge existente; `AUDIT_RETENTION_DAYS` futuro documentado, não implementado), direitos do titular mapeados p/ endpoints, cookies/`localStorage` (nota dev-only estendida), suboperadores (SMTP/S3), contato DPO via `PRIVACY_CONTACT` (`.env.example`, sem default). `SECURITY.md` (+pt-BR): seção anti-enumeração (garantias + tradeoff do 409).
- **Testes anti-vazamento (PG real):** `test_leak_audit.py` — pós change-password/reset/forgot/force-reset, varre `audit_log.metadata` e outbox redigido contra `password|token=|secret`; `LogEmailSender` com contexto falso nunca loga token (`caplog`); login desconhecido × senha-errada já coberto na change 3 (referenciar, não duplicar).
- **Skills:** pinar SHA e instalar `vercel-react-best-practices` + `web-design-guidelines` em `.opencode/skills/` (oficiais, markdown-only verificado) + registro em Instaladas; LGPD registrada como avaliada-sem-skill (docs-first).

## Capabilities

### New Capabilities

- `privacy-docs`: inventário LGPD, retenção, direitos e garantias anti-enumeração documentados.
- `leak-audit-tests`: varredura de segredos em audit/outbox/logs como teste.

### Modified Capabilities

- Nenhuma (sem mudança de comportamento).

## Impact

- Só docs, 1 var de env documentada, testes, skills pinadas. Maior risco: skill com scripts — mitigado por auditoria do `SKILL.md` + `allowed-tools` restrito antes de instalar.

## Non-goals (v2 §21)

`AUDIT_RETENTION_DAYS`, DPO operacional, cookie banner (sem cookies próprios além de sessão dev), anonimização retroativa.

## Acceptance criteria

1. `PRIVACY.md` cobre inventário/finalidade/retenção/direitos/suboperadores/contato; `SECURITY.md` declara garantias.
2. Suite anti-vazamento verde em PG real; `caplog` sem token.
3. Skills instaladas com SHA pinado + auditoria registrada, ou justificativa escrita se alguma falhar verificação.
4. Gates verdes + `openspec verify` antes de `archive`.
