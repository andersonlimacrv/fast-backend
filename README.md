# fast-backend

Modular Monolith Async FastAPI SaaS Kernel — em preparação.

> **Status: Fase 0. Sem `backend/`.** Referência congelada: `references/implementation_v2.md` (nunca editar).
> Regra: sem `backend/` sem OpenSpec change aprovada + ordem explícita.

## Origem (somente leitura)

- Upstream: [benavlabs/FastAPI-boilerplate@0.19.0](https://github.com/benavlabs/FastAPI-boilerplate) + `crudauth@0.6.0`
- Cópias locais: `/home/anderson/dev/copy/benavlabs_FastAPI-boilerplate`, `/home/anderson/dev/copy/benavlabs_crudauth`
- Decisão (ADR 0001): ejetar `crudauth`, auth própria (Argon2id, JWT HS256 10-15min, refresh opaco Postgres + rotation/reuse/atomicidade, `tokens_valid_after`).

## Mapa

```text
fast-backend/
├── AGENTS.md / docs/RULES.md / docs/ROADMAP.md (fases 0-8) / docs/adr/0001-0003
├── docs/BOILERPLATE-ANALYSIS.md / docs/SKILLS-REGISTRY.md
├── .opencode/agents/ (planner, backend-implementer, code-reviewer, security-auditor, tester, docs-writer)
├── openspec/ (specs + changes) + .opencode/commands|skills (opsx)
├── references/implementation_v2.md (congelada)
└── .github/ (CI futuro)
```

## Fases (resumo, fonte: `docs/ROADMAP.md`)

0 Baseline repo (atual) → 1 Auth → 2 Hardening → 3 Identity/Org/Tenancy → 4 RBAC+Entitlements → 5 Email/Storage/Jobs → 6 Audit/Obs/Backup → 7 Billing Stripe opcional → 8 CI/CD+Template+Docs.

Stack: FastAPI async + SQLAlchemy 2.0 + Pydantic v2 + Postgres + Redis + Alembic + Taskiq + Docker + `uv`. `CORE_MODULES` sempre ligados; opcionais via `ENABLED_MODULES`.

## Próximos passos

1. Revisar `docs/RULES.md`, `docs/ROADMAP.md`, `docs/adr/*`.
2. Aprovar instalação de skills do `docs/SKILLS-REGISTRY.md` (openspec `opsx:*` já instaladas pelo `init`).
3. `planner` escreve `openspec/changes/auth-foundation/proposal.md|tasks.md` → aprovação → Fase 1.

## Regras

PT-BR; código em inglês. Sem commit sem pedido. Sem segredos. `git status --short` após cada mudança. Licença MIT.
