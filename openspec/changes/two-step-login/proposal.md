## Why

O login é um formulário único email+senha (`Auth.tsx:10`) e o backend vaza existência por timing: email desconhecido pula o Argon2 (`service.py:89-91`), enquanto o corpo 401 é genérico. A landing (change 2) precisa de um botão Login que abra email-primeiro. Sem fechar o oráculo, o two-step criaria o oráculo que o `forgot` 202-genérico evita.

## What Changes

- **Client:** `LoginForm` compartilhado email→senha (normaliza trim+lowercase como o `canonical_email` do backend; **sempre avança** p/ senha com email válido; erro genérico só no fim); `LoginModal` (Base-UI Dialog, já dependência) na landing; `/login` vira a mesma forma two-step (deep-link); sucesso → `/~`; `autocomplete` + `aria`, erros inline.
- **Backend (3 linhas + teste):** `login()` executa dummy `verify` Argon2 quando o usuário não existe (hash falsa lazy, custo ≈ caminho real); contrato inalterado; throttling inalterado; `register` 409 mantido como tradeoff aceito e documentado.

## Capabilities

### New Capabilities

- `two-step-login`: login email-primeiro sem oráculo + dummy Argon2 no backend.

### Modified Capabilities

- Nenhuma (contrato `/auth/login` inalterado).

## Impact

- `client/`: `services/login.ts` (`normalizeEmail` puro), `components/login-form.tsx`, `components/login-modal.tsx`, `Auth.tsx`, `Landing.tsx` (botão abre modal); testes vitest + Testing Library.
- `app/`: `identity/service.py` (dummy hash lazy) + teste de integração (401 idêntico + `verify` chamado no caminho desconhecido via hasher decorado).
- Custo: +1 Argon2 verify em logins de email inexistente (mesma ordem do caminho real — é o ponto).

## Non-goals (v2 §21)

Revelar existência; mudar throttling/TTLs; captcha/WebAuthn; registro two-step.

## Acceptance criteria

1. Email válido (existente ou não) sempre avança p/ senha; inválido nem avança (inline).
2. Desconhecido vs senha-errada: **mesmo status 401 e mesmo corpo** (PG real); `verify` chamado nos dois caminhos.
3. Modal abre/fecha por teclado (Esc), foco gerenciado pelo Dialog; sucesso fecha e vai p/ `/~`.
4. Gates verdes (client `build/lint/test:run`; backend `ruff/mypy/lint-imports`, `pytest -m unit`, alvo de integração, `bandit/pip-audit/gitleaks`).
