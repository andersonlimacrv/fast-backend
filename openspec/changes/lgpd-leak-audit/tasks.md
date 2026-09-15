## 1. Docs de privacidade/segurança

- [x] 1.1 `docs/PRIVACY.md` + `docs/PRIVACY.pt-BR.md` (inventário, finalidade/base, retenção, direitos→endpoints, cookies/storage, suboperadores, contato)
- [x] 1.2 `SECURITY.md` + `SECURITY.pt-BR.md`: seção anti-enumeração (login/forgot/reset garantias + tradeoff 409)
- [x] 1.3 `.env.example`: `PRIVACY_CONTACT` comentado (sem default)

## 2. Testes anti-vazamento

- [x] 2.1 `app/tests/integration/test_leak_audit.py` (PG real): fluxos change-password/forgot/reset/force-reset → varre `audit_log.metadata` + outbox redigido contra substrings de segredo
- [x] 2.2 `test_email.py`: `caplog` com contexto contendo token falso → nada do contexto no log
- [x] 2.3 Referenciar (não duplicar) testes forgot/login da change 3 e B

## 3. Skills

- [x] 3.1 Auditar `SKILL.md` + pinar SHA de `vercel-react-best-practices` e `web-design-guidelines`; instalar em `.opencode/skills/`; registrar em Instaladas (ou justificar não-instalação)
- [x] 3.2 Registrar LGPD como avaliada-sem-skill em Triagem

## 4. Gates

- [x] 4.1 `ruff/mypy/lint-imports`, `pytest -m unit` + alvo integração, `bandit/pip-audit/gitleaks`, `npm` gates do client intactos
- [x] 4.2 `openspec verify` 3 dimensões antes de `archive`
