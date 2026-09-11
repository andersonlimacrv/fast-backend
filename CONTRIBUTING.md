# Contributing — fast-backend

## Fluxo (obrigatório p/ mudança relevante)

1. **OpenSpec change antes de código**: `openspec/changes/<nome>/` com `proposal.md` + `design.md` (+ specs) + `tasks.md`; só implementar após aprovação.
2. Trabalhe em branch curto a partir de `main`; um commit lógico por unidade (`feat:`, `fix:`, `docs:`, `chore:` — Conventional Commits).
3. Antes de cada commit: `git status --short` + `git diff --staged`; nunca commitar segredos (`.env` é gitignored — só `.env.example`).

## Gates (tudo verde antes do push)

```bash
uv sync --extra dev
uv run ruff check app scripts && uv run ruff format --check app scripts
uv run mypy app scripts
uv run lint-imports
FB_TEST_NETWORK=host uv run pytest   # ou: uv run pytest (com bridge Docker)
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git
```

Detalhe das regras: `AGENTS.md` → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*`. `references/` é imutável — conflito vira ADR novo, nunca edição da referência.

## Estrutura de uma boa PR

- Link para a change OpenSpec (ou motivo de dispensa, p/ trivialidades).
- O que mudou / o que **não** mudou de propósito / riscos.
- Evidência: testes (novos ou afetados) + gates acima.

## Adicionando um módulo

Ver `docs/guides/add-module.md` (5 passos) + registrar o contrato `<mod>-internals-private` correspondente.
