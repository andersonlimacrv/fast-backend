# AGENTS.md — Instruções para agentes de IA (Opencode / Claude)

> Leia este arquivo + `docs/RULES.md` antes de qualquer tarefa.

## 1. Contexto

- Repo: `fast-backend` — Modular Monolith Async FastAPI SaaS Kernel (v2 congelada).
- Referência congelada (somente leitura, **nunca editar**): `references/implementation_v2.md`.
- Evidência upstream (somente leitura): `/home/anderson/dev/copy/benavlabs_FastAPI-boilerplate@0.19.0`, `/home/anderson/dev/copy/benavlabs_crudauth@0.6.0`.
- Estado: **v1.0.0 entregue** (tag `0.1.0`) — `app/` implementado (Fases 1–8), 95 testes, 20 capabilities. Decisões congeladas: Auth própria (sem crudauth), Argon2id (pwdlib), JWT HS256 10-15min, refresh opaco Postgres com rotation+reuse+atomicidade, `tokens_valid_after`, `TENANCY_MODE=single|row` sem RLS no v1, `active_org_id` contexto (autoridade = membership Postgres), idempotência lógica.
- Nomenclatura congelada: `CORE_MODULES` (nunca `PLATFORM_MODULES`); opcionais por flag (ex.: `BILLING_ENABLED`).
- Stack: FastAPI async + SQLAlchemy 2.0 + Pydantic v2 + Postgres + Redis + Alembic + Taskiq + Docker + `uv`.

## 2. Hierarquia (topo vence)

`AGENTS.md > docs/RULES.md > docs/ROADMAP.md > docs/adr/* > references/* > copy/*`

## 3. Regra de ouro (fluxo normal)

**Nova fase/tarefa relevante exige OpenSpec change (`openspec/changes/<nome>/proposal.md|tasks.md|design.md`) + aprovação antes de implementar.**

- Nunca commitar segredos (`.env` é gitignored; só `.env.example`). `references/` é imutável: conflito com a v2 → registrar ADR, nunca reescrever a referência.
- Mudanças estruturais (novo módulo, contrato, migração) exigem change correspondente.

## 4. Como trabalhar

1. **Idioma:** respostas em PT-BR; código e identificadores em inglês. Docs voltadas ao usuário em inglês + variante `.pt-BR.md`; docs internas/processo (AGENTS, RULES, ROADMAP, ADRs, openspec) em PT-BR.
2. **Plano antes de código + spec antes de plano:** `planner` escreve `openspec/changes/<nome>/proposal.md|tasks.md`, só então `backend-implementer` executa.
3. **Evidência:** ler locais antes de afirmar; citar `path:linha`; upstream só via `copy/`.
4. **Verificação:** `git status --short` após cada mudança. Sem commit sem pedido. Conventional Commits. Sem segredos.
5. **Estilo:** `ruff` line-length 128, type hints, async-first, `asyncio_mode=auto`, `import-linter` p/ DAG.

## 5. Subagentes (`.opencode/agents/`)

| Agente | Arquivo | Quando usar |
|---|---|---|
| `planner` | `planner.md` | Análise read-only. Lê v2 + `copy/` antes de opinar. |
| `backend-implementer` | `backend-implementer.md` | Implementa pós-change. Conhece auth/tenancy/DAG. **Exige change aprovada.** |
| `code-reviewer` | `code-reviewer.md` | 3 eixos: Standards + Spec + Security. Read-only. |
| `security-auditor` | `security-auditor.md` | Auditoria SAST + auth/tenancy. Read-only. **Novo.** |
| `tester` | `tester.md` | TDD; exige Postgres real p/ auth/tenancy; mock não prova isolamento. |
| `docs-writer` | `docs-writer.md` | Dono de README/docs/registry/ADRs. |

Primários: `build` (executa), `plan` (Tab, analisa sem alterar).

## 6. Mapa

```text
fast-backend/
├── README.md / AGENTS.md / CHANGELOG.md / opencode.json
├── Dockerfile / .dockerignore / docker-compose.yml / docker-compose.prod.yml
├── .opencode/agents/ (6 agentes)
├── scripts/ backup.py, deploy.py, new_project.py
├── docs/ RULES.md, ROADMAP.md, DEPLOYMENT.md, BOILERPLATE-ANALYSIS.md, SKILLS-REGISTRY.md, adr/0001-0004
├── openspec/ (specs + changes)
├── references/implementation_v2.md (congelada, nunca editar)
└── .github/ (ci, deploy, rollback)
```

Mapa atual (v1.0.0): `app/{core,infrastructure,modules}/`, `app/tests/{unit,integration,e2e,fixtures}/`, `app/migrations/` (pacote `app`, imports `from app.*` — ADR 0004) + `pyproject.toml`, `alembic.ini`, `.env.example` na raiz.

## 7. Referências

- `docs/RULES.md` — regras normativas.
- `docs/ROADMAP.md` — fases 0-8.
- `docs/BOILERPLATE-ANALYSIS.md` — reusar vs descartar vs greenfield.
- `docs/SKILLS-REGISTRY.md` — skills (nada instala sem registro).
- `docs/adr/` — decisões (0001 auth, 0002 tenancy, 0003 tiers, 0004 app-dir).
