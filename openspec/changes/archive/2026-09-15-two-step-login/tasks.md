## 1. Backend: dummy Argon2 (fecha oráculo de timing)

- [x] 1.1 `identity/service.py`: dummy hash lazy + `verify` descartado no caminho `loaded is None` (+ comentário de segurança)
- [x] 1.2 Integração PG real (`test_auth_flows.py`): desconhecido vs senha-errada → mesmo 401 + mesmo corpo; hasher decorado prova `verify` nos dois caminhos
- [x] 1.3 ADR (estender 0001 ou nova `0009-login-enumeration.md`) documentando always-advance + dummy + tradeoff do 409

## 2. Client: forma two-step compartilhada

- [x] 2.1 `services/login.ts`: `normalizeEmail` puro (trim+lowercase, `null` se formato inválido) + `login.test.ts`
- [x] 2.2 `components/login-form.tsx` (etapas email→senha, `autocomplete`, `aria`, erros inline) + `components/login-modal.tsx` (Dialog) + teste Testing Library (avança sempre com email válido, nunca chama login na etapa 1)
- [x] 2.3 `Auth.tsx`: `LoginPage` usa `LoginForm`; `Landing.tsx`: botão abre modal (+ link Criar conta mantido)

## 3. Gates

- [x] 3.1 Client `build/lint/test:run`; backend `ruff/mypy/lint-imports`, `pytest -m unit` + alvo integração, `bandit/pip-audit/gitleaks`
- [x] 3.2 Aceite 1–4 (teclado/Esc/foco no modal; deep-link `/login`); `openspec verify` antes de `archive`
