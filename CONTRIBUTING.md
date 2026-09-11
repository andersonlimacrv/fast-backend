# Contributing — fast-backend

> 🇬🇧 English | [Português (BR)](CONTRIBUTING.pt-BR.md)

## Flow (required for relevant changes)

1. **OpenSpec change before code**: `openspec/changes/<name>/` with `proposal.md` + `design.md` (+ specs) + `tasks.md`; implement only after approval.
2. Work on a short branch from `main`; one logical commit per unit (`feat:`, `fix:`, `docs:`, `chore:` — Conventional Commits).
3. Before each commit: `git status --short` + `git diff --staged`; never commit secrets (`.env` is gitignored — only `.env.example`).

## Gates (all green before push)

```bash
uv sync --extra dev
uv run ruff check app scripts && uv run ruff format --check app scripts
uv run mypy app scripts
uv run lint-imports
FB_TEST_NETWORK=host uv run pytest   # or: uv run pytest (with Docker bridge)
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git
```

Rule details: `AGENTS.md` → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*`. `references/` is immutable — conflicts become new ADRs, never edits to the reference.

## Anatomy of a good PR

- Link to the OpenSpec change (or waiver reason, for trivialities).
- What changed / what **intentionally** didn't / risks.
- Evidence: tests (new or affected) + gates above.

## Adding a module

See `docs/guides/add-module.md` (5 steps) + register the matching `<mod>-internals-private` contract.
